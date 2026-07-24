import logger from "../config/logger.js";
import { AppError } from "../utils/AppError.js";

const isProduction = process.env.NODE_ENV === "production";

// 404 handler for unmatched routes — funnels into the same error shape below.
export function notFound(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, "NOT_FOUND"));
}

// Central error handler. Normalises anything thrown in the app into one JSON
// contract: { success: false, message, code, details? }.
// eslint-disable-next-line no-unused-vars -- Express identifies error middleware by its 4-arg signature
export function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let code = "INTERNAL_ERROR";
  let message = "Something went wrong";
  let details;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err?.name === "ValidationError") {
    // Mongoose schema validation error.
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Validation failed";
    details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err?.name === "CastError") {
    // Malformed ObjectId or similar.
    statusCode = 400;
    code = "INVALID_ID";
    message = `Invalid value for '${err.path}'`;
  } else if (err?.code === 11000) {
    // Mongo duplicate-key violation.
    statusCode = 409;
    code = "DUPLICATE_KEY";
    message = "Resource already exists";
    details = err.keyValue ? Object.keys(err.keyValue).map((field) => ({ field })) : undefined;
  } else if (err?.type === "entity.parse.failed") {
    // express.json() could not parse the request body.
    statusCode = 400;
    code = "INVALID_JSON";
    message = "Malformed JSON body";
  }

  // Attach to the request-scoped logger so the x-request-id travels with the log.
  const log = req.log || logger;
  if (statusCode >= 500) {
    log.error({ err, code }, message);
  } else {
    log.warn({ code, statusCode }, message);
  }

  const body = { success: false, message, code };
  if (details) body.details = details;
  // Only expose the stack for unexpected 5xx errors, and only outside production,
  // so internal details are never leaked to clients in prod.
  if (!isProduction && statusCode >= 500 && err?.stack) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

export default errorHandler;
