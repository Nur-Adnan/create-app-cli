import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  try {
    const token = header.slice(7);
    const decoded = verifyToken(token);
    (req as Request & { user: unknown }).user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}
