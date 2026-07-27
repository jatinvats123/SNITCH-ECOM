// OpenAPI 3.1 description of the Aveniq API. Served via Swagger UI at /api/docs
// (non-production only — see app.js). Paths are relative to the /api server prefix.

const Error = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    message: { type: "string" },
    code: { type: "string", example: "NOT_FOUND" },
    details: { type: "array", items: { type: "object" }, nullable: true },
  },
  required: ["success", "message", "code"],
};

const Price = {
  type: "object",
  properties: {
    amount: { type: "number", example: 1499 },
    currency: { type: "string", example: "INR" },
  },
};

const Variant = {
  type: "object",
  properties: {
    _id: { type: "string" },
    variantId: { type: "string" },
    stock: { type: "integer", example: 12 },
    price: { $ref: "#/components/schemas/Price" },
    attributes: {
      type: "object",
      additionalProperties: { type: "string" },
      example: { Size: "M" },
    },
    images: { type: "array", items: { type: "object", properties: { url: { type: "string" } } } },
  },
};

const Product = {
  type: "object",
  properties: {
    _id: { type: "string" },
    title: { type: "string", example: "Linen Shirt" },
    description: { type: "string" },
    seller: { type: "string", description: "Seller user id" },
    price: { $ref: "#/components/schemas/Price" },
    images: { type: "array", items: { type: "object", properties: { url: { type: "string" } } } },
    variants: { type: "array", items: { $ref: "#/components/schemas/Variant" } },
    createdAt: { type: "string", format: "date-time" },
  },
};

const User = {
  type: "object",
  properties: {
    id: { type: "string" },
    email: { type: "string", format: "email" },
    contact: { type: "string" },
    fullName: { type: "string" },
    role: { type: "string", enum: ["buyer", "seller"] },
  },
};

const Order = {
  type: "object",
  properties: {
    _id: { type: "string" },
    user: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          product: { type: "string" },
          title: { type: "string" },
          label: { type: "string" },
          image: { type: "string" },
          quantity: { type: "integer" },
          price: { $ref: "#/components/schemas/Price" },
        },
      },
    },
    subtotal: { type: "integer", description: "In paise" },
    tax: { type: "integer", description: "In paise" },
    amount: { type: "integer", description: "Total charged, in paise" },
    currency: { type: "string" },
    status: { type: "string", enum: ["created", "paid", "failed"] },
    razorpayOrderId: { type: "string" },
    paidAt: { type: "string", format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
  },
};

// Common responses reused across paths.
const r = {
  unauthorized: {
    description: "Missing / invalid / expired auth cookie",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
  },
  forbidden: {
    description: "Authenticated but not permitted (wrong role or not the owner)",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
  },
  notFound: {
    description: "Resource not found",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
  },
  validation: {
    description: "Validation failed",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
  },
};

const json = (schema) => ({ "application/json": { schema } });
const ok = (description, schema) => ({ description, content: json(schema) });
const authUser = [{ cookieAuth: [] }];

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Aveniq API",
    version: "1.0.0",
    description:
      "MERN e-commerce marketplace API. Auth is a JWT in an HTTP-only cookie named `token`.",
  },
  servers: [{ url: "/api", description: "API root" }],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Products" },
    { name: "Cart" },
    { name: "Payment" },
    { name: "Orders" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: { type: "apiKey", in: "cookie", name: "token" },
    },
    schemas: { Error, Price, Variant, Product, User, Order },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Liveness probe (no DB dependency)",
        responses: { 200: ok("Process is up", { type: "object" }) },
      },
    },
    "/health/ready": {
      get: {
        tags: ["Health"],
        summary: "Readiness probe (pings MongoDB)",
        responses: {
          200: ok("Ready", { type: "object" }),
          503: ok("Database not reachable", { type: "object" }),
        },
      },
    },

    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a buyer or seller; sets the auth cookie",
        requestBody: {
          required: true,
          content: json({
            type: "object",
            required: ["email", "contact", "password", "fullname", "isSeller"],
            properties: {
              email: { type: "string", format: "email" },
              contact: { type: "string", description: "10 digits" },
              password: { type: "string", minLength: 8 },
              fullname: { type: "string" },
              isSeller: { type: "boolean" },
            },
          }),
        },
        responses: {
          200: ok("Registered", {
            type: "object",
            properties: {
              success: { type: "boolean" },
              user: { $ref: "#/components/schemas/User" },
            },
          }),
          400: r.validation,
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in with email + password; sets the auth cookie",
        requestBody: {
          required: true,
          content: json({
            type: "object",
            required: ["email", "password"],
            properties: {
              email: { type: "string", format: "email" },
              password: { type: "string" },
            },
          }),
        },
        responses: {
          200: ok("Logged in", {
            type: "object",
            properties: {
              success: { type: "boolean" },
              user: { $ref: "#/components/schemas/User" },
            },
          }),
          400: {
            description: "Invalid credentials or validation error",
            content: json({ $ref: "#/components/schemas/Error" }),
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Clear the auth cookie",
        responses: { 200: ok("Logged out", { type: "object" }) },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Send a password-reset link (always 200 — no account enumeration)",
        requestBody: {
          required: true,
          content: json({
            type: "object",
            required: ["email"],
            properties: { email: { type: "string", format: "email" } },
          }),
        },
        responses: { 200: ok("Reset link sent if the account exists", { type: "object" }) },
      },
    },
    "/auth/reset-password/{token}": {
      post: {
        tags: ["Auth"],
        summary: "Reset the password using a valid, unexpired token",
        parameters: [{ name: "token", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: json({
            type: "object",
            required: ["password"],
            properties: { password: { type: "string", minLength: 8 } },
          }),
        },
        responses: { 200: ok("Password reset", { type: "object" }), 400: r.validation },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get the current user",
        security: authUser,
        responses: {
          200: ok("Current user", {
            type: "object",
            properties: {
              success: { type: "boolean" },
              user: { $ref: "#/components/schemas/User" },
            },
          }),
          401: r.unauthorized,
        },
      },
    },
    "/auth/google": {
      get: {
        tags: ["Auth"],
        summary: "Start Google OAuth (302 redirect to Google)",
        responses: { 302: { description: "Redirect to Google" } },
      },
    },

    "/products": {
      get: {
        tags: ["Products"],
        summary: "List products (public) with search, price filter, sort and pagination",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
          {
            name: "sort",
            in: "query",
            schema: { type: "string", enum: ["newest", "price_asc", "price_desc"] },
          },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 12 } },
        ],
        responses: {
          200: ok("Product page", {
            type: "object",
            properties: {
              success: { type: "boolean" },
              products: { type: "array", items: { $ref: "#/components/schemas/Product" } },
              pagination: { type: "object" },
            },
          }),
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create a product (seller only). multipart/form-data with up to 7 images.",
        security: authUser,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["title", "description", "priceAmount", "priceCurrency"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priceAmount: { type: "number" },
                  priceCurrency: { type: "string" },
                  images: { type: "array", items: { type: "string", format: "binary" } },
                },
              },
            },
          },
        },
        responses: {
          201: ok("Created", {
            type: "object",
            properties: { product: { $ref: "#/components/schemas/Product" } },
          }),
          400: r.validation,
          401: r.unauthorized,
          403: r.forbidden,
        },
      },
    },
    "/products/seller": {
      get: {
        tags: ["Products"],
        summary: "List the authenticated seller's products",
        security: authUser,
        responses: {
          200: ok("Seller products", {
            type: "object",
            properties: {
              products: { type: "array", items: { $ref: "#/components/schemas/Product" } },
            },
          }),
          401: r.unauthorized,
          403: r.forbidden,
        },
      },
    },
    "/products/detail/{productId}": {
      get: {
        tags: ["Products"],
        summary: "Get a product by id (public)",
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: ok("Product", {
            type: "object",
            properties: { product: { $ref: "#/components/schemas/Product" } },
          }),
          404: r.notFound,
        },
      },
    },
    "/products/{productId}": {
      delete: {
        tags: ["Products"],
        summary: "Delete a product (seller + owner only)",
        security: authUser,
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: ok("Deleted", { type: "object" }),
          401: r.unauthorized,
          403: r.forbidden,
          404: r.notFound,
        },
      },
    },
    "/products/{productId}/variants": {
      post: {
        tags: ["Products"],
        summary: "Add a variant to an owned product (seller + owner). multipart/form-data.",
        security: authUser,
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          201: ok("Variant added", {
            type: "object",
            properties: { product: { $ref: "#/components/schemas/Product" } },
          }),
          400: r.validation,
          403: r.forbidden,
          404: r.notFound,
        },
      },
    },
    "/products/{productId}/variants/{variantId}": {
      delete: {
        tags: ["Products"],
        summary: "Delete a variant (seller + owner)",
        security: authUser,
        parameters: [
          { name: "productId", in: "path", required: true, schema: { type: "string" } },
          { name: "variantId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: ok("Variant deleted", { type: "object" }),
          403: r.forbidden,
          404: r.notFound,
        },
      },
    },

    "/cart": {
      get: {
        tags: ["Cart"],
        summary: "Get the current user's cart with totals",
        security: authUser,
        responses: {
          200: ok("Cart", { type: "object", properties: { cart: { type: "object" } } }),
          401: r.unauthorized,
        },
      },
    },
    "/cart/add/{productId}": {
      post: {
        tags: ["Cart"],
        summary: "Add a product/variant to the cart",
        security: authUser,
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: json({
            type: "object",
            properties: {
              variantId: { type: "string" },
              quantity: { type: "integer", default: 1 },
            },
          }),
        },
        responses: {
          200: ok("Updated cart", { type: "object" }),
          400: r.validation,
          401: r.unauthorized,
          404: r.notFound,
        },
      },
    },
    "/cart/quantity/increament/{productId}/{variantId}": {
      patch: {
        tags: ["Cart"],
        summary: "Increment a cart line item by one",
        security: authUser,
        parameters: [
          { name: "productId", in: "path", required: true, schema: { type: "string" } },
          { name: "variantId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: ok("Updated cart", { type: "object" }),
          401: r.unauthorized,
          404: r.notFound,
        },
      },
    },
    "/cart/quantity/decrement/{productId}/{variantId}": {
      patch: {
        tags: ["Cart"],
        summary: "Decrement a cart line item by one (removes it at zero)",
        security: authUser,
        parameters: [
          { name: "productId", in: "path", required: true, schema: { type: "string" } },
          { name: "variantId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: ok("Updated cart", { type: "object" }),
          401: r.unauthorized,
          404: r.notFound,
        },
      },
    },
    "/cart/remove/{productId}/{variantId}": {
      delete: {
        tags: ["Cart"],
        summary: "Remove a line item from the cart",
        security: authUser,
        parameters: [
          { name: "productId", in: "path", required: true, schema: { type: "string" } },
          { name: "variantId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: ok("Updated cart", { type: "object" }),
          401: r.unauthorized,
          404: r.notFound,
        },
      },
    },

    "/payment/create-order": {
      post: {
        tags: ["Payment"],
        summary: "Create a Razorpay order from the cart (amount computed server-side)",
        security: authUser,
        responses: {
          201: ok("Razorpay order created", {
            type: "object",
            properties: {
              key: { type: "string", description: "Razorpay publishable key" },
              razorpayOrderId: { type: "string" },
              amount: { type: "integer", description: "In paise" },
              currency: { type: "string" },
            },
          }),
          400: { description: "Empty cart", content: json({ $ref: "#/components/schemas/Error" }) },
          401: r.unauthorized,
        },
      },
    },
    "/payment/verify": {
      post: {
        tags: ["Payment"],
        summary: "Verify the Razorpay signature; creates the paid order transactionally",
        security: authUser,
        requestBody: {
          required: true,
          content: json({
            type: "object",
            required: ["razorpay_order_id", "razorpay_payment_id", "razorpay_signature"],
            properties: {
              razorpay_order_id: { type: "string" },
              razorpay_payment_id: { type: "string" },
              razorpay_signature: { type: "string" },
            },
          }),
        },
        responses: {
          200: ok("Verified; order created", {
            type: "object",
            properties: { orderId: { type: "string" } },
          }),
          400: {
            description: "Missing fields or invalid signature",
            content: json({ $ref: "#/components/schemas/Error" }),
          },
          401: r.unauthorized,
        },
      },
    },
    "/payment/failure": {
      post: {
        tags: ["Payment"],
        summary: "Record a failed / cancelled payment attempt",
        security: authUser,
        responses: { 200: ok("Recorded", { type: "object" }), 401: r.unauthorized },
      },
    },

    "/orders": {
      get: {
        tags: ["Orders"],
        summary: "The authenticated buyer's order history",
        security: authUser,
        responses: {
          200: ok("Orders", {
            type: "object",
            properties: {
              orders: { type: "array", items: { $ref: "#/components/schemas/Order" } },
            },
          }),
          401: r.unauthorized,
        },
      },
    },
    "/orders/seller": {
      get: {
        tags: ["Orders"],
        summary: "Orders containing the seller's products (items filtered to their own)",
        security: authUser,
        responses: {
          200: ok("Seller orders", {
            type: "object",
            properties: {
              orders: { type: "array", items: { $ref: "#/components/schemas/Order" } },
            },
          }),
          401: r.unauthorized,
          403: r.forbidden,
        },
      },
    },
    "/orders/{orderId}": {
      get: {
        tags: ["Orders"],
        summary: "A single order owned by the buyer",
        security: authUser,
        parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: ok("Order", {
            type: "object",
            properties: { order: { $ref: "#/components/schemas/Order" } },
          }),
          400: r.validation,
          401: r.unauthorized,
          404: r.notFound,
        },
      },
    },
  },
};

export default openApiSpec;
