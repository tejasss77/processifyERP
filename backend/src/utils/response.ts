import { Response } from 'express';

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
) {
  const totalPages = Math.ceil(total / limit) || 1;
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}

export function sendError(res: Response, message: string, statusCode: number = 500, details?: any) {
  return res.status(statusCode).json({
    success: false,
    message,
    details,
  });
}
