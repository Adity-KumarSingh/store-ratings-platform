import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { Role } from '../types';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  const token = header.slice('Bearer '.length);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have access to this resource.' });
    }
    next();
  };
}
