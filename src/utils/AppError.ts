export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    options?: {
      code?: string;
      details?: Record<string, unknown>;
    },
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = options?.code;
    this.details = options?.details;

    Error.captureStackTrace(this, this.constructor);
  }
}
