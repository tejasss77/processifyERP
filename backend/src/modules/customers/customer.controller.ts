import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { sendPaginated, sendSuccess } from '../../utils/response';

const createCustomerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  mobile: z.string().min(1, 'Mobile number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  businessName: z.string().min(1, 'Business name is required'),
  gstNumber: z.string().optional(),
  customerType: z.enum(['LEAD', 'RETAIL', 'WHOLESALE', 'DISTRIBUTOR']).default('LEAD'),
  address: z.string().optional(),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE', 'CONVERTED']).default('LEAD'),
  followUpDate: z.string().optional().nullable(),
});

const updateCustomerSchema = createCustomerSchema.partial();

const addNoteSchema = z.object({
  note: z.string().min(1, 'Note content cannot be empty'),
});

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = (req.query.search as string || '').trim();
    const status = (req.query.status as string || '').trim();
    const type = (req.query.type as string || '').trim();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search && search !== 'undefined') {
      where.OR = [
        { name: { contains: search } },
        { businessName: { contains: search } },
        { mobile: { contains: search } },
        { email: { contains: search } },
        { gstNumber: { contains: search } },
      ];
    }

    if (status && status !== 'undefined') {
      where.status = status;
    }

    if (type && type !== 'undefined') {
      where.customerType = type;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: { notes: true, challans: true },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return sendPaginated(res, customers, page, limit, total, 'Customers fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    return sendSuccess(res, customer, 'Customer detail fetched');
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createCustomerSchema.parse(req.body);

    const customer = await prisma.customer.create({
      data: {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      },
    });

    return sendSuccess(res, customer, 'Customer created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updateCustomerSchema.parse(req.body);

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Customer not found');
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...data,
        followUpDate: data.followUpDate !== undefined
          ? (data.followUpDate ? new Date(data.followUpDate) : null)
          : undefined,
      },
    });

    return sendSuccess(res, updated, 'Customer updated successfully');
  } catch (error) {
    next(error);
  }
};

export const addCustomerNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { note } = addNoteSchema.parse(req.body);

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const createdNote = await prisma.customerNote.create({
      data: {
        customerId: id,
        note,
        createdBy: req.user!.id,
      },
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return sendSuccess(res, createdNote, 'Follow-up note added successfully', 201);
  } catch (error) {
    next(error);
  }
};
