# 2. Store the auth token in an HTTP-only cookie, not localStorage

- **Date:** 2026-07-27
- **Status:** Accepted

## Context

The SPA authenticates API requests with a JWT. The token can live either in
`localStorage`/`sessionStorage` (read by JavaScript and attached manually to each
request) or in an HTTP-only cookie (attached automatically by the browser).

## Decision

Issue the JWT in an **HTTP-only** cookie: `httpOnly: true`, `secure: true` +
`sameSite: "none"` in production (the frontend and API are on different hosts),
`sameSite: "lax"` and non-secure in local dev, with `maxAge` derived from
`JWT_EXPIRES_DAYS`.

## Consequences

- **XSS token theft is mitigated.** JavaScript cannot read an HTTP-only cookie, so
  an injected script cannot exfiltrate the token. Anything in `localStorage` is fully
  readable by any script running on the page.
- The browser attaches the cookie automatically; the frontend code never touches the
  token. Cross-site sending is governed by `withCredentials: true` plus a CORS
  origin allow-list (no wildcard in production).
- Cookies add CSRF surface. This is mitigated today by `SameSite` and the explicit
  CORS allow-list; a dedicated CSRF token for state-changing requests is a sensible
  future hardening.
- Token lifetime was shortened from 100 days to 7 to limit the exposure window of a
  stolen cookie, since there is no refresh/rotation mechanism yet.
