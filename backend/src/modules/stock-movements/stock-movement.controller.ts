import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma';
import { sendPaginated } from '../../utils/response';

export const getStockMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = (req.query.search as string || '').trim();
    const type = (req.query.type as string || '').trim();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (type && type !== 'undefined') {
      where.movementType = type;
    }

    if (search && search !== 'undefined') {
      where.OR = [
        { reason: { contains: search } },
        { product: { name: { contains: search } } },
        { product: { sku: { contains: search } } },
        { user: { name: { contains: search } } },
      ];
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              category: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return sendPaginated(res, movements, page, limit, total, 'Stock movement log fetched');
  } catch (error) {
    next(error);
  }
};
