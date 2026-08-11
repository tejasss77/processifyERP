import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5001,
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'processify_erp_super_secret_jwt_key_2026',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};
