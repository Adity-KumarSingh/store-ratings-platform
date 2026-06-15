import { Request, Response, NextFunction } from 'express';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: 'Resource not found.' });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {

  if (err?.code === '23505') {
    return res.status(409).json({ message: 'A record with that value already exists.' });
  }

  console.error(err);
  res.status(err?.status ?? 500).json({
    message: err?.message ?? 'Internal server error.',
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
