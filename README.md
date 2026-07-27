Aveniq
A full-stack e-commerce marketplace where sellers list products with variants and buyers check out through Razorpay.

     

Live demo →  ·  API docs →




Overview
Aveniq is a MERN marketplace with two distinct user journeys. Sellers register, list products with multiple variants (size, colour, price) and up to seven images per product served from a CDN. Buyers browse the catalog, add specific variants to a cart, and complete payment through Razorpay with server-side signature verification.

The backend is deliberately layered. Routes stay thin, validation runs before controllers, business logic sits in services, and all database access is isolated behind a data-access layer. Each concern can change without touching the others — the payment provider could be swapped without editing a single controller.

Authentication uses JWTs delivered as HTTP-only cookies rather than localStorage, which removes an entire class of XSS token-theft attacks. Google OAuth 2.0 is supported alongside email/password.


Features
Authentication & authorization

Email/password registration with server-side validation
Google OAuth 2.0 sign-in via Passport
JWT issued as an HTTP-only, secure, sameSite cookie
Forgot-password and token-based reset over SMTP
Role-based access control separating buyer and seller capabilities
Ownership enforcement — a seller cannot read or mutate another seller's resources

Seller

Create products with up to 7 images per upload
Add and remove variants with independent pricing
Manage own listings and view orders containing own products

Buyer

Browse catalog with filtering and pagination
Variant-level cart with increment, decrement, and remove
Razorpay checkout with signature verification and payment-failure handling
Order history and order detail

Production

Helmet, rate limiting, request sanitisation, CORS allow-list
Centralised error handling with consistent error envelopes
Structured JSON logging with per-request correlation IDs
Health and readiness endpoints
40+ integration tests running in CI


Tech stack
Layer
Technologies
Frontend
React 19, Redux Toolkit, React Router 7, Tailwind CSS 4, Vite, Axios
Backend
Node.js 20, Express 5, MongoDB, Mongoose
Auth
JWT, bcryptjs, Passport (Google OAuth 2.0), express-validator
Payments
Razorpay
Media
Multer, ImageKit CDN
Email
Nodemailer over SMTP
Testing
Jest, Supertest, mongodb-memory-server
Ops
Docker, Docker Compose, GitHub Actions, Pino



Architecture
                    ┌──────────────┐

   Browser ───────► │  React SPA   │  Redux Toolkit · feature-sliced

                    └──────┬───────┘

                           │ HTTPS · HTTP-only cookie

                           ▼

                    ┌──────────────┐

                    │  Express API │

                    └──────┬───────┘

                           │

   ┌───────────────────────┼───────────────────────┐

   │                       │                       │

   ▼                       ▼                       ▼

routes/              middleware/              validator/

thin routing      JWT + role checks       express-validator

   │                       │                       │

   └───────────────────────┼───────────────────────┘

                           ▼

                     controller/          orchestration, response shaping

                           ▼

                  services/  ·  dao/       integrations · database access

                           ▼

                       models/             Mongoose schemas

                           ▼

                    ┌──────────────┐

                    │   MongoDB    │

                    └──────────────┘

External: ImageKit (media) · Razorpay (payments) · SMTP (email)

A request passes validation and authentication before reaching a controller, so controllers can assume a valid, authorised request. Errors thrown anywhere bubble to a single error middleware.


Folder structure
aveniq/

├── backend/

│   ├── server.js                 # process entry, signal handling

│   └── src/

│       ├── app.js                # express app assembly, middleware chain

│       ├── config/               # env validation, db, razorpay, logger

│       ├── routes/               # thin route definitions

│       ├── validator/            # express-validator rule sets

│       ├── middleware/           # auth, rbac, error handler, rate limits

│       ├── controller/           # request orchestration

│       ├── services/             # business logic, external integrations

│       ├── dao/                  # database access, tenant/owner scoping

│       ├── models/               # mongoose schemas + indexes

│       └── utils/                # AppError, asyncHandler, mailer

│   └── tests/                    # integration + unit tests

│

├── frontend/

│   └── src/

│       ├── app/                  # App shell, routes, store

│       ├── components/           # shared presentational components

│       └── features/

│           ├── auth/             # pages, hooks, services, slice

│           ├── cart/

│           ├── orders/

│           └── products/

│

├── docs/

│   ├── adr/                      # architecture decision records

│   ├── screenshots/

│   └── PRODUCTION-READINESS.md

├── .github/workflows/ci.yml

├── docker-compose.yml

└── README.md


Setup
Prerequisites: Node.js 20+, MongoDB 6+ (or Docker), npm 10+

git clone https://github.com/jatinvats123/aveniq.git

cd aveniq

# Option A — Docker (recommended)

cp backend/.env.example backend/.env      # fill in values

cp frontend/.env.example frontend/.env

docker compose up --build                 # app on http://localhost:5173

# Option B — local

npm install                               # installs both workspaces

npm run dev                               # api :3000, web :5173

Common scripts

npm run dev            # both packages in watch mode

npm run test           # full test suite

npm run test:coverage  # with coverage report

npm run lint           # eslint + prettier check

npm run build          # production build


Environment variables
backend/.env

Variable
Required
Description
PORT
no
API port. Defaults to 3000
NODE_ENV
yes
development | production | test
MONGODB_URI
yes
MongoDB connection string
JWT_SECRET
yes
Signing secret. Use 32+ random bytes
JWT_EXPIRES_IN
no
Token lifetime. Defaults to 7d
CLIENT_ORIGIN
yes
Comma-separated CORS allow-list
GOOGLE_CLIENT_ID
yes
Google OAuth client ID
GOOGLE_CLIENT_SECRET
yes
Google OAuth client secret
GOOGLE_CALLBACK_URL
yes
OAuth redirect URI
RAZORPAY_KEY_ID
yes
Razorpay public key
RAZORPAY_KEY_SECRET
yes
Razorpay secret — server only
IMAGEKIT_PUBLIC_KEY
yes
ImageKit public key
IMAGEKIT_PRIVATE_KEY
yes
ImageKit private key
IMAGEKIT_URL_ENDPOINT
yes
ImageKit delivery URL
SMTP_HOST / SMTP_PORT
yes
Mail transport
SMTP_USER / SMTP_PASS
yes
Mail credentials
LOG_LEVEL
no
Pino level. Defaults to info


frontend/.env

Variable
Required
Description
VITE_API_BASE_URL
yes
API base URL
VITE_RAZORPAY_KEY_ID
yes
Razorpay public key (safe client-side)


Never commit .env. Only .env.example is tracked.


Screenshots






Catalog with filtering


Variant selection


Variant-level cart


Razorpay checkout


Seller listings


Buyer order history



Future improvements
Product search backed by a proper text index or a dedicated search service
Seller payouts and settlement reporting
Inventory reservation during checkout to prevent overselling
Review and rating system with verified-purchase gating
Refund and return workflow through the Razorpay refunds API
Redis caching for the catalog with event-driven invalidation
Migration of the order domain to a state machine with an audit trail


License
Released under the MIT License. See LICENSE.


Contact
Jatin Vats — Full Stack Developer, Delhi, India Email · LinkedIn · GitHub

