# Security Policy

## Reporting a vulnerability

**Please do not open a public GitHub issue for security problems.**

Report privately through GitHub's **"Report a vulnerability"** button on the
repository's **Security** tab (Private Vulnerability Reporting), or contact the
repository owner directly. Please include:

- a description of the issue and its impact,
- steps to reproduce (a proof of concept if possible),
- affected endpoint(s) or component(s).

You can expect an acknowledgement within a few days. Please give a reasonable
window to remediate before any public disclosure.

---

## Threat model

Aveniq is a MERN marketplace with buyer and seller roles, cookie-based auth,
Razorpay payments, and ImageKit media uploads.

### Assets we protect

- **User credentials & sessions** — passwords and the JWT session cookie.
- **Payment integrity** — the amount charged and the authenticity of a payment.
- **Seller data isolation** — one seller must not read or mutate another's products or orders.
- **Uploaded media** — only genuine images should reach the CDN.
- **Secrets** — DB URI, JWT secret, OAuth, Razorpay and SMTP credentials.

### Trust boundaries

```
Browser ──HTTPS──> Frontend (Vercel, static SPA)
Browser ──HTTPS/CORS+cookie──> API (Express on Render)
API ──> MongoDB Atlas | Razorpay | ImageKit | SMTP
```

Everything from the browser is untrusted input. The frontend is a static app and
holds no secrets; all authority checks happen server-side on the API.

### Primary threats and mitigations

| Threat                            | Mitigation                                                                                                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Password theft / reuse            | Passwords hashed with bcrypt; never returned in any response                                                                                                      |
| Session token theft (XSS)         | JWT in an **httpOnly** cookie (JS cannot read it); short (7‑day) lifetime                                                                                         |
| Session token theft (network)     | `secure` + `sameSite` cookie flags in production; HTTPS + HSTS                                                                                                    |
| Brute force / credential stuffing | Strict rate limit on `login`/`register`/`forgot`/`reset` (10 / 15 min in prod)                                                                                    |
| API flooding / DoS                | General rate limit; JSON body size limits; magic-byte + size/count upload caps                                                                                    |
| NoSQL operator injection          | `$`-prefixed keys stripped from body; `express-mongo-sanitize` on query/params; input validated                                                                   |
| HTTP parameter pollution          | `hpp` collapses duplicated params                                                                                                                                 |
| Payment tampering                 | Amount computed server-side from the cart; Razorpay signature verified with a timing-safe HMAC; the order is created **only after** verification, transactionally |
| Cross-tenant access (IDOR)        | RBAC (`buyer`/`seller`); ownership checks on product mutations; order reads scoped to the owning user; seller order view filtered to the seller's own line items  |
| Malicious file upload             | MIME **sniffing** (magic bytes, not the declared type) + 5 MB / 7-file caps                                                                                       |
| Cross-site request abuse          | CORS restricted to an env allow-list, credentialed, no wildcard in production                                                                                     |
| Clickjacking / MIME sniffing      | `helmet` (CSP, `X-Frame-Options`, `X-Content-Type-Options: nosniff`, Referrer-Policy)                                                                             |
| Secret leakage                    | Secrets are env-only and git-ignored (incl. `.env.*`); redacted from logs; none in the repo or git history                                                        |

---

## Controls in place

- **Authentication** — email/password (bcrypt) and Google OAuth; JWT issued as an
  httpOnly cookie with `secure` + `sameSite` in production and a 7-day expiry.
- **Authorization** — role-based `buyer`/`seller`; sellers can only mutate their own
  products (ownership check → 403) and only see orders containing their products;
  buyers can only read their own orders.
- **Transport & headers** — HTTPS on Render/Vercel; `helmet` sets CSP (whitelisting
  ImageKit and Razorpay), HSTS, frameguard, nosniff and Referrer-Policy.
- **Rate limiting** — strict on the sensitive auth endpoints, general elsewhere,
  returning `429` + `Retry-After`.
- **Input handling** — `express-validator` on mutating routes; NoSQL sanitization;
  `hpp`; centralized error handler that never leaks internal messages/stack in production.
- **Payments** — server-side amount calculation and timing-safe signature verification;
  orders created transactionally on verified payment only.
- **Uploads** — content sniffed by magic bytes; size and count capped.
- **Secrets & logging** — env-only secrets, structured logs with `authorization`,
  `cookie`, `password` and `token` redacted.

---

## Known limitations (honestly stated)

- **Open seller registration** — anyone can register as a seller by setting
  `isSeller` at sign-up. This is an intentional demo/product decision, not an
  oversight; a real deployment would gate the seller role behind approval or KYC.
- **Rate-limit store is in-memory** — limits are per API instance; a multi-instance
  deployment needs a shared store (e.g. Redis).
- **CSRF** — state-changing requests rely on `sameSite` cookies + the CORS allow-list
  rather than per-request CSRF tokens. Because cross-site auth uses `sameSite=None`
  in production, a dedicated CSRF token is a candidate hardening step.
- **Ownership-enforcement tests** — the RBAC/ownership rules are enforced in code;
  the integration tests that _prove_ a seller cannot touch another seller's product
  or order are added in the testing phase (Phase 4).
- **Dependency advisories** — tracked via `npm audit` and automated updates (Phase 5).
