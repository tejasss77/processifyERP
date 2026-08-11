import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma';
import { sendSuccess } from '../../utils/response';

export const getReportAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      allProducts,
      allCustomers,
      allChallans,
      allMovements,
      recentMovements,
    ] = await Promise.all([
      prisma.product.findMany({
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.customer.findMany({
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.challan.findMany({
        include: {
          customer: { select: { id: true, name: true, businessName: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stockMovement.findMany({
        include: {
          product: { select: { id: true, name: true, sku: true } },
          user: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stockMovement.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          user: { select: { id: true, name: true, role: true } },
        },
      }),
    ]);

    // Executive Calculations
    const confirmedChallans = allChallans.filter((c) => c.status === 'CONFIRMED');
    const totalGrossRevenue = confirmedChallans.reduce((sum, c) => sum + c.totalAmount, 0);
    const inventoryValuation = allProducts.reduce((sum, p) => sum + p.currentStock * p.unitPrice, 0);
    const lowStockItems = allProducts.filter((p) => p.currentStock <= p.minStock);

    // Category Asset Breakdown
    const categoryMap: Record<string, { count: number; totalStock: number; totalValue: number; lowStockCount: number }> = {};
    allProducts.forEach((p) => {
      const cat = p.category || 'Unassigned';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { count: 0, totalStock: 0, totalValue: 0, lowStockCount: 0 };
      }
      categoryMap[cat].count += 1;
      categoryMap[cat].totalStock += p.currentStock;
      categoryMap[cat].totalValue += p.currentStock * p.unitPrice;
      if (p.currentStock <= p.minStock) {
        categoryMap[cat].lowStockCount += 1;
      }
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([category, stats]) => ({
      category,
      ...stats,
    }));

    // Customer Segmentation Breakdown
    const customerTypeMap: Record<string, number> = {};
    const customerStatusMap: Record<string, number> = {};
    allCustomers.forEach((c) => {
      customerTypeMap[c.customerType] = (customerTypeMap[c.customerType] || 0) + 1;
      customerStatusMap[c.status] = (customerStatusMap[c.status] || 0) + 1;
    });

    // Challan Status Breakdown
    const challanStatusBreakdown = {
      DRAFT: { count: 0, totalValue: 0 },
      CONFIRMED: { count: 0, totalValue: 0 },
      CANCELLED: { count: 0, totalValue: 0 },
    };

    allChallans.forEach((c) => {
      const statusKey = c.status as 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
      if (challanStatusBreakdown[statusKey]) {
        challanStatusBreakdown[statusKey].count += 1;
        challanStatusBreakdown[statusKey].totalValue += c.totalAmount;
      }
    });

    // Stock Movement Velocity (IN vs OUT)
    let totalStockINCount = 0;
    let totalStockINQty = 0;
    let totalStockOUTCount = 0;
    let totalStockOUTQty = 0;

    allMovements.forEach((m) => {
      if (m.movementType === 'IN') {
        totalStockINCount += 1;
        totalStockINQty += m.quantity;
      } else {
        totalStockOUTCount += 1;
        totalStockOUTQty += m.quantity;
      }
    });

    return sendSuccess(res, {
      executive: {
        totalGrossRevenue,
        inventoryValuation,
        totalProducts: allProducts.length,
        totalCustomers: allCustomers.length,
        lowStockCount: lowStockItems.length,
        totalStockMovements: allMovements.length,
        totalChallans: allChallans.length,
        confirmedChallansCount: confirmedChallans.length,
      },
      categoryBreakdown,
      customerSegmentation: {
        byType: customerTypeMap,
        byStatus: customerStatusMap,
      },
      challanBreakdown: challanStatusBreakdown,
      stockVelocity: {
        inCount: totalStockINCount,
        inQty: totalStockINQty,
        outCount: totalStockOUTCount,
        outQty: totalStockOUTQty,
      },
      lowStockRiskList: lowStockItems.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        currentStock: p.currentStock,
        minStock: p.minStock,
        warehouseLocation: p.warehouseLocation,
        unitPrice: p.unitPrice,
      })),
      recentAuditLogs: recentMovements,
    }, 'Report analytics fetched successfully');
  } catch (error) {
    next(error);
  }
};
