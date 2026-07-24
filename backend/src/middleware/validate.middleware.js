import { validationResult } from "express-validator";
import { AppError } from "../utils/AppError.js";

// Shared terminal middleware for express-validator chains, replacing the three
// near-identical `validateRequest` copies. On failure it throws a 400 AppError
// whose message is the first validation message (so existing clients that read
// `.message` still show something useful) and whose `details` carry the full
// field-by-field breakdown. The central error handler renders it.
export function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array();
  const details = errors.map((e) => ({ field: e.path ?? e.param, message: e.msg }));
  return next(new AppError(errors[0].msg, 400, "VALIDATION_ERROR", details));
}

export default validate;
