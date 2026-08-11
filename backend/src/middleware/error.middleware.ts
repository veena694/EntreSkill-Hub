import { Request, Response, NextFunction } from 'express';

export class CustomError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export const errorHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err instanceof CustomError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error Middleware] ${req.method} ${req.url} - Status: ${statusCode} - Error: ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    errors: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
export default errorHandler;
