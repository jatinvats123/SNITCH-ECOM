// Operational application error carrying an HTTP status and a stable,
// machine-readable code. `isOperational` marks errors we throw deliberately
// (bad input, not found, forbidden, ...) as opposed to unexpected
// programmer/system errors, so the global error handler knows what is safe to
// expose to the client.
export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR", details) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    if (details !== undefined) this.details = details;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", code = "BAD_REQUEST", details) {
    return new AppError(message, 400, code, details);
  }
  static unauthorized(message = "Unauthorized", code = "UNAUTHORIZED") {
    return new AppError(message, 401, code);
  }
  static forbidden(message = "Forbidden", code = "FORBIDDEN") {
    return new AppError(message, 403, code);
  }
  static notFound(message = "Not found", code = "NOT_FOUND") {
    return new AppError(message, 404, code);
  }
  static conflict(message = "Conflict", code = "CONFLICT") {
    return new AppError(message, 409, code);
  }
}

export default AppError;
