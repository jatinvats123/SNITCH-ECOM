# Aveniq

A full-stack e-commerce marketplace with buyer and seller roles, product variants, cart management, and live payments.

**Live demo → [aveniq-sooty.vercel.app](https://aveniq-sooty.vercel.app)**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?logo=redux&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?logo=razorpay&logoColor=white)

---

## Overview

Aveniq is a MERN marketplace where sellers list products with multiple variants and images, and buyers browse, add to cart, and check out through Razorpay. Authentication supports both email/password and Google OAuth, with role-based access separating buyer and seller capabilities.

The backend is deliberately layered — routes stay thin, validation runs before controllers, business logic sits in services, and database access is isolated in a DAO layer — so that each concern can change without touching the others.

---

## Features

### Authentication
- Email and password registration with server-side validation
- Google OAuth 2.0 sign-in via Passport
- JWT issued as an HTTP-only cookie
- Forgot-password and token-based reset flows delivered over SMTP
- Role-based access control with `buyer` and `seller` roles

### Seller
- Create products with up to 7 images per upload
- Add and remove product variants (size, colour, pricing)
- View and manage own product listings
- Images uploaded through Multer and served from the ImageKit CDN

### Buyer
- Browse the full catalog and view product detail pages
- Add items to cart at the variant level
- Increment, decrement, and remove cart items
- Checkout with Razorpay, including server-side signature verification and payment-failure handling

---

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Redux Toolkit, React Router 7, Tailwind CSS 4, Axios, Vite |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Auth | JWT, bcryptjs, Passport (Google OAuth 2.0), express-validator |
| Payments | Razorpay |
| Media | Multer, ImageKit |
| Email | Nodemailer over SMTP |

---

## Architecture

```
Request
   │
   ▼
routes/         thin routing, no logic
   │
   ▼
validator/      express-validator rules, rejects bad input early
   │
   ▼
middleware/     authenticateUser / authenticateSeller — JWT + role checks
   │
   ▼
controller/     orchestrates the request, shapes the response
   │
   ▼
services/ dao/  external integrations (ImageKit, mailer) and DB access
   │
   ▼
models/         Mongoose schemas
```

Each request passes validation and authentication before reaching a controller, so controllers can assume a valid, authorised request.

---

## API reference

Base URL: `/api`

### Auth — `/api/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a new account |
| POST | `/login` | Public | Log in and receive a JWT cookie |
| POST | `/logout` | Public | Clear the session cookie |
| GET | `/google` | Public | Start Google OAuth flow |
| GET | `/google/callback` | Public | OAuth callback handler |
| GET | `/me` | Private | Get the current authenticated user |
| POST | `/forgot-password` | Public | Send a password-reset email |
| POST | `/reset-password/:token` | Public | Reset password using an emailed token |

### Products — `/api/products`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List all products |
| GET | `/detail/:productId` | Public | Get a single product |
| POST | `/` | Seller | Create a product with images |
| GET | `/seller` | Seller | List the seller's own products |
| DELETE | `/:productId` | Seller | Delete a product |
| POST | `/:productId/variants` | Seller | Add a variant |
| DELETE | `/:productId/variants/:variantId` | Seller | Delete a variant |

### Cart — `/api/cart`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Private | Get the current user's cart |
| POST | `/add/:productId` | Private | Add an item to the cart |
| PATCH | `/quantity/increament/:productId/:variantId` | Private | Increase quantity |
| PATCH | `/quantity/decrement/:productId/:variantId` | Private | Decrease quantity |
| DELETE | `/remove/:productId/:variantId` | Private | Remove an item |

### Payment — `/api/payment`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/create-order` | Private | Create a Razorpay order |
| POST | `/verify` | Private | Verify the payment signature |
| POST | `/failure` | Private | Record a failed payment |

---

## Getting started

### Prerequisites
- Node.js 18 or higher
- A MongoDB instance (local or Atlas)
- Razorpay, ImageKit, Google OAuth, and SMTP credentials

### Setup

```bash
git clone https://github.com/jatinvats123/aveniq.git
cd aveniq
```

**Backend**

```bash
cd backend
npm install
npm run dev          # starts on the configured PORT
```

Create `backend/.env`:

```env
MONGO_URI=
JWT_SECRET=
CLIENT_URL=http://localhost:5173
NODE_ENV=development

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

IMAGEKIT_PRIVATE_KEY=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

**Frontend**

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

> `.env` files are gitignored. Never commit real credentials.

---

## Project structure

```
aveniq/
├── backend/
│   └── src/
│       ├── config/        db, razorpay, and env configuration
│       ├── routes/        auth, product, cart, payment
│       ├── validator/     express-validator rule sets
│       ├── middleware/    JWT and role guards
│       ├── controller/    request handlers
│       ├── services/      ImageKit storage service
│       ├── dao/           product and cart data access
│       ├── models/        user, product, cart, order schemas
│       └── utils/         mailer
└── frontend/
    └── src/
        ├── app/           Redux store
        ├── features/      auth, products, cart slices
        └── components/    shared UI
```

---

## Roadmap

- Order history and buyer-facing order tracking
- Product search, filtering, and pagination
- Seller analytics dashboard
- Automated test coverage for auth and payment flows
- Rate limiting on authentication endpoints

---

## Author

**Jatin Vats** — [GitHub](https://github.com/jatinvats123) · [LinkedIn](https://linkedin.com/in/jatin-vats-dev)
