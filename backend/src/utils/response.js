// The single success-response shape for the entire API:
//   { success: true, message, ...data }
// Payload keys are spread at the top level so the existing response contract the
// frontend already consumes (user, product(s), cart, pagination, orders, ...) is
// preserved exactly — no route hand-rolls its own JSON shape.
export const sendSuccess = (res, statusCode = 200, message = "OK", data = {}) =>
  res.status(statusCode).json({ success: true, message, ...data });

export default sendSuccess;
