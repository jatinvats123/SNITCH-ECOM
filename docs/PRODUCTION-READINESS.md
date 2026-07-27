# Production Readiness Report

A candid before/after of taking Aveniq from a working-but-student-grade MERN app to
a production-shaped one, the limitations that honestly remain, and ten interview
questions I should be able to answer about this codebase.

> "Before" = the state captured in [`AUDIT.md`](../AUDIT.md) (Phase 0). "After" = `main` at the end of Phase 7.

---

## 1. Before / after

| Metric                                     | Before          | After                            | How measured                                 |
| ------------------------------------------ | --------------- | -------------------------------- | -------------------------------------------- |
| Automated tests                            | **0**           | **71** integration tests         | `npm test` (Jest + Supertest)                |
| Statement coverage (`backend/src`)         | **0%**          | **94.9%** (gate enforced at 60%) | Jest `--coverage` (V8)                       |
| Lighthouse — Performance                   | 92              | **97**                           | Lighthouse 12, headless Chrome, catalog page |
| Lighthouse — Accessibility                 | 90              | **100**                          | "                                            |
| Lighthouse — Best Practices                | 96              | 96 ¹                             | "                                            |
| Lighthouse — SEO                           | 82              | **100**                          | "                                            |
| npm audit — **production** deps (backend)  | 1 high (multer) | **0**                            | `npm audit --omit=dev`                       |
| npm audit — **production** deps (frontend) | 7 high          | **5 high** (react-router) ²      | `npm audit --omit=dev`                       |
| npm audit — full tree incl. dev tooling    | be 5 / fe 8     | be 22 / fe 8 ³                   | `npm audit`                                  |
| Docker images                              | none            | 2 multi-stage slim images ⁴      | see note                                     |
| p95 `GET /api/products` (catalog query)    | n/a (untested)  | **123 ms** (p50 54 ms)           | autocannon, 250 req, local ⁵                 |
| p95 `GET /api/orders` (history)            | n/a             | **51 ms** (p50 28 ms)            | "                                            |
| p95 `GET /api/cart` (`$lookup` aggregate)  | n/a             | **42 ms** (p50 33 ms)            | "                                            |

**Notes — read these; the raw numbers are misleading without them.**

1. **Best Practices stuck at 96** because Lighthouse flagged `errors-in-console`. That
   only fires because the local Lighthouse run has no backend, so the product fetch
   404s and logs an error. On the deployed site (API responds) this is clean.
2. **Frontend's 5 high advisories are all `react-router`.** Several are SSR- or
   dev-server-specific (this is a client-rendered SPA, so e.g. the SSR turbo-stream
   RCE does not apply), but the version should still be bumped — see limitations.
3. **The backend's 22 "high" advisories are entirely in dev/test tooling** (jest,
   mongodb-memory-server, …) which is stripped from the production image
   (`npm ci --omit=dev`). The **shipped** backend has **0** advisories. Reporting the
   full-tree count without this caveat would be alarmist.
4. **Image sizes were not built in this sandbox** — `npm ci` fails inside the Docker
   build container (the build sandbox can't reach the npm registry; host npm works,
   which is why every dependency install in this repo succeeded). The Dockerfiles are
   correct and CI builds both. By design they are slim: the backend runtime stage is
   `node:22-alpine` + production deps + `dumb-init`, running as a non-root user; the
   frontend is `nginx:alpine` serving the static Vite build. Real sizes should be read
   from the CI `docker build` step.
5. **p95 was measured locally against an in-memory MongoDB replica set**, which is
   faster than a networked Atlas cluster — so treat these as an optimistic lower
   bound, not production numbers. They are, however, real measurements of the actual
   query paths (catalog filter/sort/paginate + `countDocuments`, the cart `$lookup`
   aggregation, and the user-scoped order history) with 60 seeded products.

### Other structural wins (not a single number)

- One 448 kB JS bundle → **20 route-split chunks**, ~59 kB gzip initial core.
- The 618-line `SellerProductDetail` god component → a hook + 4 presentational
  components + a 138-line page (largest file 172 lines).
- Every controller's copy-pasted `try/catch` → one `asyncHandler` + one error
  middleware + one response helper.
- The audit's #1 bug (expired token → **500**) → correct **401**.

---

## 2. Known limitations (honestly stated)

- **No automated refund when a fully-paid order can't be fulfilled.** Overselling is now
  prevented: stock is decremented atomically inside the order transaction with a guarded
  `$inc` (`stock: { $gte: quantity }`), so two checkouts racing for the last unit cannot
  both succeed. The residual trade-off is that decrementing at payment-verification time
  means if inventory runs out in the small window between checkout and payment, verify
  returns `409 INSUFFICIENT_STOCK` on an already-captured payment. That case is logged
  loudly as "refund required"; automating the Razorpay refund (or reserving stock at
  order-creation with a release/expiry) is the next step.
- **Anyone can self-register as a seller.** Registration trusts a client `isSeller`
  boolean and assigns the role directly — there is no seller onboarding/verification.
  Fine for a demo marketplace, wrong for production.
- **Frontend `react-router` advisories (5 high).** Not yet upgraded because it is a
  major version bump with breaking changes; several advisories don't apply to a CSR
  SPA, but it should still be updated.
- **No CSRF token.** State-changing requests rely on `SameSite` cookies + a CORS
  allow-list. A dedicated CSRF token is the right next hardening for cookie auth.
- **No refresh-token rotation.** The auth cookie lives 7 days (down from 100); there is
  no refresh/rotation or server-side revocation.
- **Rate limiting is per-instance (in-memory store).** Correct for a single Render
  instance; multi-instance deployments need a shared store (e.g. Redis).
- **`docker compose` runs a single-node replica set.** Enough for transactions and a
  local demo, not a real HA topology.
- **Performance/accessibility numbers were measured on my machine, not prod hardware,
  and the responsive layout was not audited interactively at every breakpoint** (320 /
  768 / 1024 / 1440) — it uses responsive utilities and Lighthouse's mobile pass found
  no horizontal-scroll issues, but that is not the same as a manual sweep.
- **The OpenAPI spec is hand-written**, so it can drift from the routes; there is no
  generate-from-code step.
- **No end-to-end/browser tests.** Coverage is backend integration tests; the frontend
  is verified by build + lint + Lighthouse, not automated UI tests.

---

## 3. Ten interview questions & model answers

### Q1. Walk me through the backend architecture.

It is layered with a single direction of dependency: **routes → controllers →
services → DAOs → Mongoose models**. Routes wire an HTTP verb/path to middleware and a
controller. Controllers are thin — read the request, call a service, and send exactly
one response via a shared `sendSuccess` helper; failures are thrown as `AppError`.
Services hold business rules (e.g. transactional order creation). DAOs isolate queries.
Cross-cutting concerns are centralised: an `asyncHandler` wrapper removes per-controller
`try/catch`, one Express error middleware maps everything to
`{ success, message, code, details? }`, and pino gives request-scoped logging with an
`x-request-id`. The payoff is testability (services are exercised directly and over
HTTP) and one consistent response/error contract. The trade-off is more files for tiny
endpoints — accepted for the consistency. (See ADR-0001.)

### Q2. Walk me through the authentication flow.

On register/login the password is hashed with bcrypt (a pre-save hook) and compared with
`comparePassword`. On success I sign a JWT containing the user id and set it in an
**HTTP-only** cookie named `token` — `secure` + `SameSite=None` in production (frontend
and API are on different hosts), `SameSite=Lax` in dev. Every protected request runs
`authenticateUser`, which reads the cookie, `jwt.verify`s it, and loads the user onto
`req.user`. Google login is Passport's Google OAuth strategy, which lands on the same
cookie. I chose an HTTP-only cookie over `localStorage` specifically so injected
JavaScript can't read the token (XSS token theft) — see ADR-0002. I also shortened the
token lifetime from 100 days to 7 to limit the exposure window.

### Q3. How do you verify a Razorpay payment, and how do you stop someone forging a "paid" order?

Two safeguards. First, **the amount is computed server-side from the cart** at
create-order time and passed to Razorpay — the client never tells us what to charge.
Second, **the order does not exist in our database until the signature is verified.**
On `/verify` I recompute `HMAC-SHA256(razorpay_order_id | razorpay_payment_id,
key_secret)` and compare it to the client-supplied signature with a **timing-safe**
comparison. Only on a match do I create the order — inside a **MongoDB transaction**
that inserts the paid order and clears the cart atomically — keyed by a **unique**
`razorpayOrderId` so a replayed verify is idempotent. So a forged request can't produce
an order: without the shared secret you can't produce a valid signature, and there's no
"pending order" row to flip to paid. A test proves a tampered signature yields 400 and
**zero** orders.

### Q4. Describe the RBAC model. How do you stop one seller from touching another seller's data?

The JWT identifies the user; the user has a `role` of `buyer` or `seller`.
`authenticateSeller` enforces the role for seller-only routes (403 `NOT_A_SELLER`
otherwise). **Ownership** is separate from role: before mutating a product, the
controller checks `product.seller === req.user._id` and returns 403 `NOT_OWNER`
otherwise — so a seller can't delete or add variants to another seller's product.
Reading an order queries `{ _id, user: req.user._id }`, so requesting someone else's
order id is a **404, not a leak** (an IDOR guard). The seller order view filters each
order's line items down to that seller's own products. Every one of these rules has a
test (a buyer hitting a seller route → 403; seller B mutating seller A's product → 403;
buyer B fetching buyer A's order → 404).

### Q5. What's your test strategy?

**Jest + Supertest + `mongodb-memory-server`** — 71 integration tests that drive the
real Express stack over HTTP against an **in-memory MongoDB replica set** (a replica
set, not a standalone, because order creation uses a transaction). No external database
and no real third-party calls: the **Razorpay SDK, the mailer, and ImageKit are
mocked**, so signature verification is tested with a locally-computed HMAC and the tests
never touch a real API. Fixtures come from factories. Coverage is gated at 60%
statements (actual ~94%) so it can't silently rot. For speed and stability the whole
suite shares one replica set via `globalSetup` (~17 s). Coverage spans auth (validation,
duplicate email, login, reset-token expiry, missing/expired token), RBAC 403s, product
CRUD + pagination + search, cart add/increment/decrement-to-zero/remove + isolation
between two users, payment valid-vs-tampered signature and atomic stock decrement —
including a concurrency test where two buyers race for the last unit and exactly one
order is created — and orders (created only after a verified payment; a buyer sees only
their own).

### Q6. What was the most serious bug you found, and how did you fix it?

The auth middleware returned **HTTP 500 instead of 401** on a missing, expired, or
malformed token — it caught `jwt.verify` failures and reported them as "Internal Server
Error." That's damaging: every client's "am I logged in?" logic breaks, real auth
failures look like server outages, and stack traces leaked. I reworked the middleware
onto `AppError` so those cases return a proper **401**, and added a test that a malformed
or expired token yields 401 (which failed against the old behaviour — a nice proof the
fix landed).

### Q7. How is the API hardened against common attacks?

Defence in depth: **helmet** (a CSP that whitelists the ImageKit and Razorpay origins,
plus HSTS, `nosniff`, frameguard); **rate limiting** (a strict limiter on the auth
endpoints to blunt brute-force/credential-stuffing, a general limiter elsewhere,
returning 429 + `Retry-After`); **NoSQL-injection sanitization** that strips
`$`-prefixed operator keys (implemented Express-5-safe, since `req.query` is a read-only
getter in Express 5); **hpp** for parameter pollution; a **CORS allow-list** from env
with no wildcard in production; **HTTP-only + secure + SameSite** auth cookies; and
**upload validation** that sniffs magic bytes (not just the file extension) plus size
and count caps. `SECURITY.md` documents the threat model.

### Q8. You chose MongoDB. How do you keep queries fast, and why did you need a transaction?

The domain is naturally nested — a product owns a variable list of variants with
open-ended attribute maps, always read together — so embedding beats join tables (ADR-
0003). The audit found the `product` and `cart` collections had **zero indexes** (full
collection scans at 10k documents), so I added indexes on every filtered/sorted field
and documented each in the model: `{seller, createdAt}` and `{price.amount}` and
`{createdAt}` on products, `{user}` on carts, `{user, createdAt}` and `{items.product}`
on orders, a sparse index on the password-reset token. The **transaction** is order
creation: inserting the paid order and clearing the cart must be atomic, otherwise a
crash between them leaves a paid order with a stale cart (or vice versa). Transactions
require a replica set, which is why Atlas (and the test/compose setups) run one.

### Q9. How did you make the frontend fast and accessible, and how do you know?

I measured with Lighthouse (headless Chrome) before and after, so these are real
numbers, not guesses. **Performance 92 → 97**: route-level code splitting with
`React.lazy` (one 448 kB bundle → per-route chunks, ~59 kB gzip core), memoised catalog
cards (the grid had been re-rendering every second because of a live clock in the
parent), `loading="lazy"` on below-fold images, and ImageKit width/quality/format
transforms. **Accessibility 90 → 100** and **SEO 82 → 100**: I fixed every axe violation
Lighthouse reported — sub-AA grey text raised to a 4.5:1 contrast ratio, an unlabelled
sort control associated with its label, alt text, and making catalog cards real
keyboard-focusable `<button>`s — plus a meta description, title and `robots.txt`. There's
also a global error boundary so a render error shows a fallback instead of a white
screen.

### Q10. If this were going to real production traffic, what would you fix first?

The highest-value correctness bug — **overselling** — is already fixed: stock is now
decremented atomically inside the order transaction with a guarded `$inc`, and a
concurrency test proves two buyers can't both take the last unit. What I'd do next, in
order: **(1) Automate the refund** for the residual edge where a payment is captured but
stock ran out between checkout and payment (today verify returns `409` and logs "refund
required"); reserving stock at order-creation with a release/expiry is the fuller fix.
**(2) Seller onboarding** — registration currently trusts a client `isSeller` flag, so
anyone can become a seller; that needs a real verification step. **(3) A shared
rate-limit store** (Redis) so limits hold across multiple instances, plus a CSRF token
for the cookie-based auth. After that: bump `react-router` off its advisories, add
refresh-token rotation, and add end-to-end browser tests. I keep these in the "known
limitations" section of this document precisely so they're visible rather than hidden.
