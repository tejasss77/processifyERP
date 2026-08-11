export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface AuthUserPayload {
  id: string;
  name: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}
