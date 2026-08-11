import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../prisma';
import { ENV } from '../../config/env';
import { BadRequestError, UnauthorizedError } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';

const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '1d' });

    return sendSuccess(
      res,
      {
        token,
        user: payload,
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User account no longer exists');
    }

    return sendSuccess(res, user, 'User profile fetched');
  } catch (error) {
    next(error);
  }
};
