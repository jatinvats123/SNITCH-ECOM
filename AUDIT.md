# Aveniq — Production-Readiness Audit (Phase 0)

**Date:** 2026-07-24
**Scope:** Read-only audit of the full working tree. No source files were modified in this phase (this report is the only artifact produced).
**Reviewer stance:** Senior staff engineer, reviewing as if for a hiring panel.

---

## 0. Executive summary

The application is functional and thoughtfully written in places (server-side amount calculation for payments, timing-safe signature comparison, snapshotted order line-items, a "don't leak which emails exist" forgot-password flow). But it is a **student-grade codebase in a production costume**, exactly as described. The dominant themes:

- **No safety net.** No global error handler, no 404 handler, no helmet, no rate limiting, no input-sanitisation layer, no structured logging. Every controller hand-rolls its own `try/catch` and response shape.
- **Wrong status codes on the auth path.** Invalid/expired JWTs return **500**, not 401 — the single most damaging correctness bug in the tree.
- **Missing database indexes.** `product` and `cart` have **zero** indexes; the seller dashboard, catalog sort, and every cart operation table-scan. Only `order` is indexed correctly.
- **Inventory is never decremented.** A paid order does not reduce variant stock — the store can oversell without limit.
- **Dead and broken code.** Two dead components, three dead/broken exports (one wired to a UI button that 404s), and duplicated logic in six places.
- **8 high-severity dependency advisories** across the two packages (`react-router`, `vite`, `postcss`, `multer`).

### Secret / git-hygiene check (non-negotiable constraint)

| Check | Result |
|---|---|
| `.env` tracked by git | **No** — not in `git ls-files` |
| `.env` anywhere in git history | **No** — clean across all refs |
| Hardcoded secrets in tracked source (Razorpay/Google/Mongo URI/private keys) | **None found** |
| `.gitignore` coverage | Covers `node_modules` and `.env` only. **Does not yet cover `.env.*` or `!*.example`** — Phase 1 fix, not a leak |

**No secret leak. Safe to proceed.** The lone gap is that `.gitignore` should be broadened so future `.env.production` / `.env.local` files can't be committed by accident.

---

## 1. Dependency audit

### 1a. Repository layout note

There is a **stray root `package.json`** declaring a single dependency (`passport ^0.7.0`) plus a root `package-lock.json` and root `node_modules`. Nothing at the root consumes `passport` — the real code lives in `backend/` and `frontend/`, each with its own manifest. This root manifest is misleading and should be replaced in Phase 1 with a real two-package orchestrator (`npm run dev/test/lint/build`).

**Runtime:** Node `v24.13.0`, npm `11.6.2` locally. Neither package declares an `engines` field or ships an `.nvmrc`, so there is no pinned/authoritative Node version.

### 1b. Backend — `npm audit` (5 vulnerabilities: 1 low, 3 moderate, **1 high**)

| Package | Installed | Severity | Advisory | Fix |
|---|---|---|---|---|
| **multer** | 2.1.1 | **HIGH** | DoS via deeply nested field names (GHSA-72gw-mp4g-v24j); DoS via incomplete cleanup of aborted uploads (GHSA-3p4h-7m6x-2hcm) | → 2.2.0 |
| mongoose | 9.4.1 | Moderate | Prototype pollution in update casting via `__proto__`-prefixed dotted path (GHSA-664h-wqgq-64gw) | → 9.8.0 |
| morgan | 1.10.1 | Moderate | Log forging via unneutralised control chars in `:remote-user` (GHSA-4vj7-5mj6-jm8m) | → 1.11.0 (or **drop** — replaced by pino in Phase 2) |
| qs (transitive) | 6.11.x | Moderate | `qs.stringify` DoS on null/undefined comma-format entries (GHSA-q8mj-m7cp-5q26) | via `npm audit fix` |

### 1c. Frontend — `npm audit` (8 vulnerabilities: 1 low, **7 high**)

| Package | Installed | Severity | Advisory (summary) | Fix |
|---|---|---|---|---|
| **react-router** | 7.14.1 | **HIGH** | 8 advisories incl. turbo-stream unauth RCE (GHSA-49rj-9fvp-4h2h), DoS via route matching, CSRF, open redirect, XSS | → 7.18.1 (patch within 7.x; 8.x is latest major) |
| **vite** | 8.0.8 | **HIGH** | launch-editor NTLMv2 hash disclosure on Windows (GHSA-v6wh-96g9-6wx3); `server.fs.deny` bypass | → 8.1.5 |
| **postcss** (transitive) | — | **HIGH** | Arbitrary file read via attacker-controlled `sourceMappingURL` (GHSA-6g55-p6wh-862q) | via `npm audit fix` |

> The Vite/PostCSS/react-router-dev advisories are **dev/build-time** exposure primarily, but `react-router`'s runtime CSRF/open-redirect/XSS items ship to production and must be patched.

### 1d. Outdated (non-advisory) — notable

Backend: `@imagekit/nodejs 7.5→7.10`, `mongoose 9.4.1→9.8`, `razorpay 2.9.6→2.9.8`.
Frontend: `axios 1.15→1.18`, `@reduxjs/toolkit 2.11→2.12`, `react 19.2.4→19.2.8`, `tailwindcss 4.2→4.3`, plus the security-relevant ones above.

**Unmaintained / to-replace:** none are abandoned, but `morgan` is in maintenance-only mode and is slated for removal in favour of `pino`/`pino-http` (Phase 2).

---

## 2. API route inventory

Base app: `backend/src/app.js`. Auth model: a JWT in an **httpOnly cookie** named `token`; `authenticateUser` requires any valid user, `authenticateSeller` additionally requires `role === "seller"`.

Legend — **Auth:** Public = no middleware; User = `authenticateUser`; Seller = `authenticateSeller`. **Validation:** express-validator chain present? **Unauth reachable:** can an anonymous caller reach the handler?

### `/api/auth` — `auth.routes.js`

| Method | Path | Auth | Validation | Unauth reachable | Notes |
|---|---|---|---|---|---|
| GET | `/` (root, in app.js) | Public | — | Yes | Liveness string; harmless |
| POST | `/api/auth/register` | Public | ✅ `validateRegisterUser` | Yes (by design) | ⚠️ `isSeller` is client-controlled → self-elevation to seller |
| POST | `/api/auth/login` | Public | ✅ `validateLoginUser` | Yes (by design) | ⚠️ controller has **no try/catch**; no rate limiting |
| POST | `/api/auth/forgot-password` | Public | ✅ | Yes (by design) | Good: constant response regardless of email existence |
| POST | `/api/auth/reset-password/:token` | Public | ✅ (password only) | Yes (by design) | Token checked in controller; unindexed lookup (§3) |
| POST | `/api/auth/logout` | Public | — | Yes | Clears cookie; harmless |
| GET | `/api/auth/google` | Public | — (passport) | Yes | OAuth start |
| GET | `/api/auth/google/callback` | Public | — (passport) | Yes | OAuth callback |
| GET | `/api/auth/me` | User | — | No | Returns current user |

### `/api/products` — `product.routes.js`

| Method | Path | Auth | Validation | Unauth reachable | Notes |
|---|---|---|---|---|---|
| POST | `/api/products/` | **Seller** | ✅ `createProductValidator` + multer | No | Create. Auth ✅. No MIME check on upload (§5) |
| GET | `/api/products/seller` | Seller | — | No | ⚠️ `find({seller})` **table-scans** (no index) |
| GET | `/api/products/` | Public | ❌ query params unvalidated | Yes | ⚠️ user regex → ReDoS (§5); unindexed sort/filter |
| GET | `/api/products/detail/:productId` | Public | ❌ `productId` not `isMongoId` | Yes | Bad ObjectId → CastError → unhandled 500 |
| DELETE | `/api/products/:productId` | **Seller** | — | No | Destructive. Auth ✅ + **ownership check ✅** |
| POST | `/api/products/:productId/variants` | **Seller** | ✅ `createVariantValidator` + multer | No | Auth ✅ + ownership ✅ |
| DELETE | `/api/products/:productId/variants/:variantId` | **Seller** | — | No | Destructive. Auth ✅ + ownership ✅ |
| _(missing)_ | `PATCH /api/products/:productId/variants/:variantId/stock` | — | — | — | **Route does not exist**, but the frontend calls it (§4) → runtime 404 |

### `/api/cart` — `cart.routes.js` (all `authenticateUser`)

| Method | Path | Auth | Validation | Notes |
|---|---|---|---|---|
| POST | `/api/cart/add/:productId` | User | ✅ `validateAddToCart` | Stock check present |
| GET | `/api/cart/` | User | — | Aggregation; unindexed `$match {user}` |
| PATCH | `/api/cart/quantity/increament/:productId/:variantId` | User | ❌ | Note misspelling `increament`; `validateIncrementCartItemQuantity` exists but is **never wired** |
| PATCH | `/api/cart/quantity/decrement/:productId/:variantId` | User | ❌ | — |
| PATCH | `/api/cart/quantity/decrement/:productId` | User | ❌ | Duplicate handler for no-variant items |
| DELETE | `/api/cart/remove/:productId` | User | ❌ | Destructive; auth ✅ |
| DELETE | `/api/cart/remove/:productId/:variantId` | User | ❌ | Destructive; auth ✅ |

### `/api/payment` — `payment.routes.js` (all `authenticateUser`)

| Method | Path | Auth | Validation | Notes |
|---|---|---|---|---|
| POST | `/api/payment/create-order` | User | — | Amount computed server-side from cart ✅. **Order persisted _before_ payment** (Phase 2 to move post-verify) |
| POST | `/api/payment/verify` | User | manual field check | ✅ Timing-safe HMAC compare; idempotent. **No stock decrement; no DB transaction** (§5) |
| POST | `/api/payment/failure` | User | — | Never overwrites a paid order ✅ |

### Destructive-route auth summary

**Every** POST/PUT/PATCH/DELETE in the tree is behind an auth middleware — there are **no unauthenticated destructive routes**. That is a genuine positive. The real auth weaknesses are elsewhere: (a) the middleware returns 500 instead of 401 on a bad token (§5 #1), (b) `isSeller` self-elevation at register (§5 #6), (c) no rate limiting on the public auth endpoints.

---

## 3. Data models & indexes

| Model / collection | Declared indexes | Table-scan risk at 10k docs |
|---|---|---|
| **user** (`user.model.js`) | `email` unique (from `unique:true`) | `resetPassword` does `findOne({resetPasswordToken, resetPasswordExpires})` — **`resetPasswordToken` is unindexed** → full scan on every reset. `googleId` also unindexed (login path uses `email`, so lower risk). |
| **product** (`productModel.js`) | **NONE** | `find({seller})` (seller dashboard) → **full scan**. `getAllProducts` sorts by `createdAt` / `price.amount` and filters `price.amount` ranges — **all unindexed** → scan + in-memory sort. Text search uses a case-insensitive `RegExp`, which **cannot use an index at all** (and is a ReDoS vector). |
| **cart** (`cartModel.js`) | **NONE** | Every op (`findOne({user})`, aggregate `$match {user}`) → **full scan**. `user` is also **not unique**, so the `findOne(...)||create(...)` pattern in `addToCart` can create **duplicate carts** under a race. |
| **order** (`orderModel.js`) | `user`, `status`, `razorpayOrderId` (unique) — all `index:true` | ✅ Correctly indexed. `verifyPayment` matches on the unique `razorpayOrderId`; future order-history `find({user})` uses the `user` index. (A `{user, createdAt}` compound would optimise sorted history later.) |
| price (`price.schema.js`) | subdocument, no collection | n/a |

**Indexes to add in Phase 2:** `product.seller`, `product.price.amount`, `product.createdAt` (or a `{seller, createdAt}` compound), a text index (or Atlas Search) for title/description, `cart.user` (**unique**), and `user.resetPasswordToken` (sparse).

---

## 4. Dead files, unused exports, unused deps, duplicated logic

### Dead files (safe to delete after import-verification in Phase 1)

| File | Size | Evidence |
|---|---|---|
| `frontend/src/features/products/pages/SellerProductDetails.jsx` | 34 lines | Not imported anywhere; a near-duplicate stub of `SellerProductDetail.jsx` (the one named in the brief) |
| `frontend/src/features/products/pages/SellerCart.jsx` | 46 lines | **Bonus find (not in the brief):** not imported, not in `app.routes.jsx` — fully dead |

### Unused / broken exports

| Symbol | Location | Problem |
|---|---|---|
| `getProductById` | `frontend/.../auth/services/auth.api.js:48` | Never imported; also points at `/api/auth/product/:id`, which **does not exist**. Dead **and** broken. |
| `validateIncrementCartItemQuantity` | `backend/.../validator/cart.validator.js:19` | Exported but **never wired** to the increment/decrement routes → those routes run unvalidated. |
| `updateVariantStock` / `handleUpdateVariantStock` | `frontend/.../product.api.js:38`, `useProduct.js:35` | Wired into the seller UI but calls `PATCH /api/products/:productId/variants/:variantId/stock`, which has **no backend route** → **runtime 404** whenever a seller edits stock. |

### Unused dependencies

| Package | Where | Note |
|---|---|---|
| `react-razorpay` | frontend | Unused — the cart hand-rolls a script loader (`service/loadRazorpay.js`) instead. Remove. |
| `passport` | **root** `package.json` | Root manifest is spurious (see §1a); backend has its own copy. Remove the root manifest. |
| `morgan` | backend | Used today, but flagged for **replacement** by `pino-http` in Phase 2. |

### Duplicated logic (drives Phase 2 refactor)

- **`validateRequest`** defined 3× identically — `auth.validator.js:3`, `cart.validator.js:3`, `product.validator.js:2`.
- **Auth middleware** — `authenticateUser` and `authenticateSeller` are near-identical (`auth.middleware.js`), differing only by one role check.
- **Ownership check** — `String(product.seller?._id ?? product.seller) !== String(seller?._id ?? seller)` copy-pasted in `deleteProduct`, `addProductVariant`, `deleteVariant` (`product.controller.js`).
- **Cookie/`isProduction` options** — duplicated between `sendTokenResponse`/`logout` and `googleCallBack` (`auth.controller.js`).
- **Variant-key/label resolution** — `getVariantMatchValue`/`getItemVariantMatchValue`/`buildVariantSnapshot` (`cart.controller.js`) mirror `getItemVariantKey`/`getVariantLabel`/`getItemImage` (`cart.jsx`).
- **Tax rate `0.18`** — hardcoded in `payment.controller.js` (`TAX_RATE`) **and** `cart.jsx` (`total*0.18`, `total*1.18`). Two sources of truth for money math.
- **Per-controller `try/catch` + `{message, success:false}`** — repeated in ~15 handlers. This is precisely what the Phase 2 `asyncHandler` + response helper eliminate.

---

## 5. Top 10 riskiest lines

Ranked by blast radius × likelihood. All references are `file:line`.

1. **`backend/src/middleware/auth.middleware.js:21`** (mirrored at `:45`) — `catch { return res.status(500) }` on `jwt.verify` failure. **An expired, malformed, or tampered token returns HTTP 500, not 401.** This breaks every client's "am I logged in?" logic, masks auth failures as server faults, and floods logs with stack traces on ordinary unauthenticated traffic. Highest-impact correctness bug in the repo.
2. **`backend/src/controller/product.controller.js:65`** — `const regex = new RegExp(q.trim(), "i")` built from **unsanitised query input** on the public `GET /api/products` endpoint. A crafted `q` causes catastrophic backtracking (**ReDoS**) or throws on invalid regex (e.g. `q=(`) → unhandled 500. Remote, unauthenticated, no rate limit.
3. **`backend/src/controller/payment.controller.js:144`** — order is marked `paid` but **variant `stock` is never decremented anywhere in the codebase**. The store can sell unlimited quantity of a 1-in-stock item. Also, the paid-write + cart-clear are **not wrapped in a transaction**.
4. **`backend/src/controller/auth.controller.js:71`** — `login` has **no try/catch** and the public auth endpoints have **no rate limiting**, leaving login/register/forgot-password open to credential stuffing and brute force.
5. **`backend/src/controller/auth.controller.js:28`** — `expiresIn: "100d"` (with a matching 100-day cookie `maxAge`). A stolen token is valid for **100 days**, with no refresh, rotation, or server-side revocation — and a password reset does not invalidate existing tokens.
6. **`backend/src/controller/auth.controller.js:63`** (`role: isSeller ? "seller" : "buyer"`, fed from `req.body.isSeller` at `:47`) — **privilege self-elevation**: any registrant flips one boolean to gain seller/product-write authority. RBAC trusts client input.
7. **`backend/src/routes/product.routes.js:10-13` + `product.controller.js:11`** — uploads are capped by size/count but the **MIME type is never sniffed**; arbitrary file content is streamed to ImageKit under an authenticated seller session. Compounded by the `multer` HIGH-severity DoS advisory (§1b).
8. **`backend/src/controller/product.controller.js:146`** (pattern repeats: `:37`, `:223`, and every controller `catch`) — responses return `error: error.message` to the client → **internal error / stack detail disclosure**.
9. **`backend/src/app.js` (end of file, ~:50)** — **no global error-handling middleware and no 404 handler**, and the stack has **no helmet, no rate limiter, no mongo-sanitize, no explicit body-size limit**. Any unhandled throw falls to Express's default HTML error page; there is no consistent JSON error contract.
10. **`backend/src/dao/cart.dao.js:6`** (representative of the whole `cart`/`product` index gap) — `$match: { user: … }` / `findOne({user})` against a **cart collection with no index on `user`** → full-collection scan on every add/get/increment/decrement/remove, and a missing unique constraint permits duplicate carts.

**Honourable mentions:** `config.js` throws at import time if any of 13 env vars is missing (blocks test bootstrapping — relevant to Phase 4); `db.js` `connectDB` has no retry/backoff; `getProductDetail`/`detail/:productId` doesn't validate the id; CORS uses a single `CLIENT_URL` string rather than an env-driven allow-list.

---

## 6. What I recommend carrying into later phases

- **Phase 1:** delete the 2 dead files + 3 dead/broken exports; fix `.gitignore` (`.env*`, `!*.example`); add `.nvmrc`/`engines`; normalise `cart.jsx` → `Cart.jsx`; wire ESLint/Prettier; strip the 18 `console.*` sites; replace the root manifest.
- **Phase 2:** the 500-on-bad-token bug (#1), `asyncHandler` + `AppError` + one error middleware + response helper (kills §4's duplication and #8), the missing indexes (§3), stock decrement + transactional order creation (#3), the order-history domain.
- **Phase 3:** helmet, rate limiting (#4), mongo-sanitize/hpp, MIME sniffing (#7), token lifetime/rotation (#5), the `isSeller` elevation (#6), CORS allow-list.
- **Phase 4:** the expired-token test will _fail against current behaviour_ (500 vs 401) — a good proof the fix landed.

> **Nothing in this repository was modified during Phase 0.** This file (`AUDIT.md`) is the sole output. Awaiting your go-ahead before starting Phase 1.
