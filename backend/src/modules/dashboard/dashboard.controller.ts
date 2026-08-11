import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma';
import { sendSuccess } from '../../utils/response';

export const getDashboardMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalCustomers,
      totalProducts,
      allProducts,
      todayChallansCount,
      confirmedChallans,
      recentChallans,
      upcomingFollowUps,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.product.findMany({ select: { currentStock: true, minStock: true } }),
      prisma.challan.count({
        where: {
          createdAt: { gte: todayStart },
        },
      }),
      prisma.challan.findMany({
        where: { status: 'CONFIRMED' },
        select: { totalAmount: true },
      }),
      prisma.challan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, businessName: true } },
        },
      }),
      prisma.customer.findMany({
        where: {
          followUpDate: {
            gte: new Date(),
          },
        },
        take: 5,
        orderBy: { followUpDate: 'asc' },
        select: {
          id: true,
          name: true,
          businessName: true,
          followUpDate: true,
          status: true,
        },
      }),
    ]);

    const lowStockCount = allProducts.filter((p) => p.currentStock <= p.minStock).length;
    const totalRevenue = confirmedChallans.reduce((sum, c) => sum + c.totalAmount, 0);

    return sendSuccess(res, {
      totalCustomers,
      totalProducts,
      lowStockCount,
      todayChallansCount,
      totalRevenue,
      recentChallans,
      upcomingFollowUps,
    }, 'Dashboard metrics fetched');
  } catch (error) {
    next(error);
  }
};
