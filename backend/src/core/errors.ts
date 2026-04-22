export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const Errors = {
  NotFound: (resource = 'Resource') => new AppError(`${resource} not found`, 404),
  Unauthorized: (msg = 'Unauthorized') => new AppError(msg, 401),
  Forbidden: (msg = 'Forbidden') => new AppError(msg, 403),
  BadRequest: (msg: string) => new AppError(msg, 400),
  Conflict: (msg: string) => new AppError(msg, 409),
  Internal: (msg = 'Internal server error') => new AppError(msg, 500, false),
} as const;
