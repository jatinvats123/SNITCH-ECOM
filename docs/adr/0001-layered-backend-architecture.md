# 1. Layered backend architecture

- **Date:** 2026-07-27
- **Status:** Accepted

## Context

The original backend mixed data access, business rules, HTTP handling and error
handling inside each controller, and every controller repeated its own `try/catch`
and hand-rolled its response shape. Logic was hard to test in isolation and easy to
let diverge from endpoint to endpoint.

## Decision

Adopt a layered architecture with a single direction of dependency:

```
routes → controllers → services → DAOs → Mongoose models
```

- **routes** map an HTTP verb/path to middleware and a controller.
- **controllers** are thin: read the request, call a service, and send exactly one
  response through the shared `sendSuccess` helper; failures are raised as `AppError`.
- **services** hold business rules and orchestration (e.g. the transactional order
  creation at payment verification).
- **DAOs** isolate database queries.
- **models** own the schemas and indexes.

Cross-cutting concerns are centralised: an `asyncHandler` wrapper removes
per-controller `try/catch`, one Express error middleware maps every error to a
consistent `{ success, message, code, details? }` body, and pino provides
request-scoped logging with a per-request id.

## Consequences

- Business logic is testable without HTTP — the order service is exercised directly
  and end-to-end via Supertest.
- Controllers shrank dramatically and stopped duplicating error/response code.
- One response contract and one error contract across the whole API.
- Trade-off: more files and a little indirection for very small endpoints, accepted
  for the consistency and testability it buys.
