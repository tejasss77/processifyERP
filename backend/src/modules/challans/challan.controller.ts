import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma';
import { BadRequestError, NotFoundError, ConflictError } from '../../utils/errors';
import { sendPaginated, sendSuccess } from '../../utils/response';

const createChallanItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be greater than zero'),
});

const createChallanSchema = z.object({
  customerId: z.string().min(1, 'Customer selection is required'),
  items: z.array(createChallanItemSchema).min(1, 'At least one item is required in a sales challan'),
});

// Helper to generate sequential unique challan number
async function generateChallanNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `CH-${currentYear}-`;

  const allChallans = await prisma.challan.findMany({
    where: {
      challanNumber: {
        startsWith: prefix,
      },
    },
    select: { challanNumber: true },
  });

  if (allChallans.length === 0) {
    return `${prefix}0001`;
  }

  const seqNumbers = allChallans.map((c) => {
    const seqStr = c.challanNumber.replace(prefix, '');
    return parseInt(seqStr, 10) || 0;
  });

  const maxSeq = Math.max(...seqNumbers, 0);
  const nextSeq = (maxSeq + 1).toString().padStart(4, '0');

  return `${prefix}${nextSeq}`;
}

export const getChallans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = (req.query.search as string || '').trim();
    const status = (req.query.status as string || '').trim();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== 'undefined') {
      where.status = status;
    }

    if (search && search !== 'undefined') {
      where.OR = [
        { challanNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { businessName: { contains: search } } },
        { user: { name: { contains: search } } },
      ];
    }

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, businessName: true, mobile: true },
          },
          user: {
            select: { id: true, name: true, role: true },
          },
          items: true,
        },
      }),
      prisma.challan.count({ where }),
    ]);

    return sendPaginated(res, challans, page, limit, total, 'Sales challans fetched');
  } catch (error) {
    next(error);
  }
};

export const getChallanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        user: {
          select: { id: true, name: true, role: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, currentStock: true, minStock: true },
            },
          },
        },
      },
    });

    if (!challan) {
      throw new NotFoundError('Sales challan not found');
    }

    return sendSuccess(res, challan, 'Challan detail fetched');
  } catch (error) {
    next(error);
  }
};

export const createDraftChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, items } = createChallanSchema.parse(req.body);

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundError('Selected customer does not exist');
    }

    // Fetch product details for snapshot capture
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestError('One or more selected products could not be found');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalQuantity = 0;
    let totalAmount = 0;

    const challanItemsData = items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = product.unitPrice;
      const lineTotal = unitPrice * item.quantity;

      totalQuantity += item.quantity;
      totalAmount += lineTotal;

      return {
        productId: product.id,
        productName: product.name, // SNAPSHOT DATA
        sku: product.sku,          // SNAPSHOT DATA
        quantity: item.quantity,
        unitPrice: unitPrice,     // SNAPSHOT DATA
        lineTotal: lineTotal,
      };
    });

    const challanNumber = await generateChallanNumber();

    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId,
        status: 'DRAFT', // Saved as DRAFT, stock is NOT reduced
        totalQuantity,
        totalAmount,
        createdBy: req.user!.id,
        items: {
          create: challanItemsData,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return sendSuccess(res, challan, `Draft Challan ${challanNumber} created successfully`, 201);
  } catch (error) {
    next(error);
  }
};

export const confirmChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true, customer: true },
      });

      if (!challan) {
        throw new NotFoundError('Challan not found');
      }

      if (challan.status !== 'DRAFT') {
        throw new BadRequestError(`Cannot confirm a challan that is currently in '${challan.status}' status`);
      }

      // High-Value Order Governance Rule: Non-Admin orders >= ₹1,00,000 require Admin approval
      const isHighValue = challan.totalAmount >= 100000;
      const requiresApproval = isHighValue && req.user?.role !== 'ADMIN';

      if (requiresApproval) {
        await tx.challan.update({
          where: { id },
          data: { status: 'PENDING_APPROVAL' },
        });

        await tx.approvalRequest.create({
          data: {
            requestType: 'HIGH_VALUE_CHALLAN',
            entityId: challan.id,
            title: `High-Value Order: Challan #${challan.challanNumber}`,
            description: `Sales order for ${challan.customer.businessName} totaling ₹${challan.totalAmount.toLocaleString('en-IN')} (${challan.totalQuantity} items) requires Admin approval.`,
            amount: challan.totalAmount,
            status: 'PENDING',
            requestedBy: req.user!.id,
          },
        });

        return { ...challan, status: 'PENDING_APPROVAL', isPendingApproval: true };
      }

      // Check stock availability for all items
      for (const item of challan.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundError(`Product '${item.productName}' no longer exists`);
        }

        if (product.currentStock < item.quantity) {
          throw new ConflictError(
            `Insufficient stock for '${product.name}'. Available: ${product.currentStock}, Requested: ${item.quantity}`,
            {
              productId: product.id,
              productName: product.name,
              available: product.currentStock,
              requested: item.quantity,
            }
          );
        }
      }

      // Reduce stock and log OUT movement for each item
      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: 'OUT',
            reason: `Sale Challan #${challan.challanNumber} (${challan.customer.businessName})`,
            createdBy: req.user!.id,
          },
        });
      }

      // Update challan status to CONFIRMED
      const updatedChallan = await tx.challan.update({
        where: { id },
        data: { status: 'CONFIRMED' },
        include: { customer: true, items: true },
      });

      return updatedChallan;
    });

    return sendSuccess(res, result, `Sales Challan #${result.challanNumber} confirmed and stock reduced successfully`);
  } catch (error) {
    next(error);
  }
};

export const cancelChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const challan = await prisma.challan.findUnique({ where: { id } });

    if (!challan) {
      throw new NotFoundError('Challan not found');
    }

    if (challan.status !== 'DRAFT') {
      throw new BadRequestError(`Only DRAFT challans can be cancelled. Current status: ${challan.status}`);
    }

    const cancelledChallan = await prisma.challan.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { customer: true, items: true },
    });

    return sendSuccess(res, cancelledChallan, `Sales Challan #${cancelledChallan.challanNumber} cancelled successfully`);
  } catch (error) {
    next(error);
  }
};
