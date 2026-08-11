import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma';
import { sendSuccess, sendError } from '../../utils/response';

export const getApprovals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status && status !== 'ALL' && status !== 'undefined') {
      where.status = String(status);
    }

    const [requests, pendingCount] = await Promise.all([
      prisma.approvalRequest.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          approver: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.approvalRequest.count({
        where: { status: 'PENDING' },
      }),
    ]);

    return sendSuccess(res, { requests, pendingCount }, 'Approval requests fetched');
  } catch (error) {
    next(error);
  }
};

export const approveRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminUser = req.user;

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return sendError(res, 'Forbidden: Only Administrators can approve governance requests', 403);
    }

    const approval = await prisma.approvalRequest.findUnique({
      where: { id },
    });

    if (!approval) {
      return sendError(res, 'Approval request not found', 404);
    }

    if (approval.status !== 'PENDING') {
      return sendError(res, `Request is already ${approval.status}`, 400);
    }

    // High-Value Challan Approval
    if (approval.requestType === 'HIGH_VALUE_CHALLAN') {
      const challan = await prisma.challan.findUnique({
        where: { id: approval.entityId },
        include: { items: true },
      });

      if (!challan) {
        return sendError(res, 'Associated sales challan not found', 404);
      }

      if (challan.status !== 'DRAFT' && challan.status !== 'PENDING_APPROVAL') {
        return sendError(res, `Challan is already in ${challan.status} state`, 400);
      }

      // Check Inventory Stock Availability
      for (const item of challan.items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          return sendError(res, `Product ${item.productName} no longer exists`, 404);
        }
        if (product.currentStock < item.quantity) {
          return sendError(
            res,
            `Stock conflict: Product ${item.productName} has only ${product.currentStock} units available, but ${item.quantity} units requested.`,
            409,
            { productId: product.id, available: product.currentStock, requested: item.quantity }
          );
        }
      }

      // Execute Database Transaction: Stock reduction + Audit Log + Challan Confirmation + Approval status
      await prisma.$transaction(async (tx) => {
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: 'OUT',
              reason: `Sales Challan #${challan.challanNumber} (Admin Approved)`,
              createdBy: adminUser.userId,
            },
          });
        }

        await tx.challan.update({
          where: { id: challan.id },
          data: { status: 'CONFIRMED' },
        });

        await tx.approvalRequest.update({
          where: { id: approval.id },
          data: {
            status: 'APPROVED',
            approvedBy: adminUser.userId,
          },
        });
      });
    } else {
      // General Approval
      await prisma.approvalRequest.update({
        where: { id: approval.id },
        data: {
          status: 'APPROVED',
          approvedBy: adminUser.userId,
        },
      });
    }

    return sendSuccess(res, null, 'Request approved successfully');
  } catch (error) {
    next(error);
  }
};

export const rejectRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminUser = req.user;

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return sendError(res, 'Forbidden: Only Administrators can reject governance requests', 403);
    }

    const approval = await prisma.approvalRequest.findUnique({
      where: { id },
    });

    if (!approval) {
      return sendError(res, 'Approval request not found', 404);
    }

    if (approval.status !== 'PENDING') {
      return sendError(res, `Request is already ${approval.status}`, 400);
    }

    if (approval.requestType === 'HIGH_VALUE_CHALLAN') {
      await prisma.$transaction([
        prisma.challan.update({
          where: { id: approval.entityId },
          data: { status: 'CANCELLED' },
        }),
        prisma.approvalRequest.update({
          where: { id: approval.id },
          data: {
            status: 'REJECTED',
            approvedBy: adminUser.userId,
            rejectionReason: rejectionReason || 'Rejected by Administrator',
          },
        }),
      ]);
    } else {
      await prisma.approvalRequest.update({
        where: { id: approval.id },
        data: {
          status: 'REJECTED',
          approvedBy: adminUser.userId,
          rejectionReason: rejectionReason || 'Rejected by Administrator',
        },
      });
    }

    return sendSuccess(res, null, 'Request rejected');
  } catch (error) {
    next(error);
  }
};
