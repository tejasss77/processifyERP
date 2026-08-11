import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma';
import { BadRequestError, NotFoundError, ConflictError } from '../../utils/errors';
import { sendPaginated, sendSuccess } from '../../utils/response';

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  currentStock: z.number().int().min(0, 'Current stock cannot be negative').default(0),
  minStock: z.number().int().min(0, 'Minimum stock cannot be negative').default(0),
  warehouseLocation: z.string().min(1, 'Warehouse location is required'),
});

const updateProductSchema = createProductSchema.partial();

const stockAdjustmentSchema = z.object({
  movementType: z.enum(['IN', 'OUT']),
  quantity: z.number().int().positive('Quantity must be greater than zero'),
  reason: z.string().min(1, 'Reason for stock adjustment is required'),
});

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = (req.query.search as string || '').trim();
    const category = (req.query.category as string || '').trim();
    const lowStockOnly = req.query.lowStock === 'true';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search && search !== 'undefined') {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { category: { contains: search } },
        { warehouseLocation: { contains: search } },
      ];
    }

    if (category && category !== 'undefined') {
      where.category = category;
    }

    const allProducts = await prisma.product.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    let filtered = allProducts;
    if (lowStockOnly) {
      filtered = allProducts.filter((p) => p.currentStock <= p.minStock);
    }

    const total = filtered.length;
    const paginatedProducts = filtered.slice(skip, skip + limit);

    return sendPaginated(res, paginatedProducts, page, limit, total, 'Products fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return sendSuccess(res, product, 'Product detail fetched');
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createProductSchema.parse(req.body);

    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku.toUpperCase() },
    });
    if (existingSku) {
      throw new ConflictError(`Product SKU '${data.sku}' already exists`);
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        sku: data.sku.toUpperCase(),
      },
    });

    if (product.currentStock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantity: product.currentStock,
          movementType: 'IN',
          reason: 'Initial stock on product creation',
          createdBy: req.user!.id,
        },
      });
    }

    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updateProductSchema.parse(req.body);

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    if (data.sku && data.sku.toUpperCase() !== existing.sku) {
      const skuCheck = await prisma.product.findUnique({
        where: { sku: data.sku.toUpperCase() },
      });
      if (skuCheck) {
        throw new ConflictError(`Product SKU '${data.sku}' already exists`);
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        sku: data.sku ? data.sku.toUpperCase() : undefined,
      },
    });

    return sendSuccess(res, updated, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { movementType, quantity, reason } = stockAdjustmentSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id } });
      if (!product) {
        throw new NotFoundError('Product not found');
      }

      let newStock = product.currentStock;
      if (movementType === 'IN') {
        newStock += quantity;
      } else {
        if (product.currentStock < quantity) {
          throw new ConflictError(
            `Insufficient stock for '${product.name}'. Available: ${product.currentStock}, Requested reduction: ${quantity}`,
            {
              productId: product.id,
              productName: product.name,
              available: product.currentStock,
              requested: quantity,
            }
          );
        }
        newStock -= quantity;
      }

      const updatedProduct = await tx.product.update({
        where: { id },
        data: { currentStock: newStock },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId: id,
          quantity,
          movementType,
          reason,
          createdBy: req.user!.id,
        },
      });

      return { product: updatedProduct, movement };
    });

    return sendSuccess(res, result, `Stock adjusted successfully (${movementType} ${quantity})`);
  } catch (error) {
    next(error);
  }
};
