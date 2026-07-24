// Wraps an async route handler so any thrown error or rejected promise is
// forwarded to the Express error middleware via next(), instead of leaving the
// request hanging. This is what lets controllers drop their repetitive
// try/catch blocks.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
