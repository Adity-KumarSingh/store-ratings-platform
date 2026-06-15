export type Role = 'admin' | 'user' | 'owner';

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password: string;
  address: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface AuthPayload {
  id: number;
  role: Role;
  email: string;
}

declare global {

  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
