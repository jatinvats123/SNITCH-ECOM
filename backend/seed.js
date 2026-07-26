// Idempotent demo seed: creates a demo seller/buyer and a small catalog if the
// database has no products yet. Used by the docker-compose "seed" service so a
// reviewer running `docker compose up` sees a working, populated app.
import dotenv from "dotenv";
import mongoose from "mongoose";
import userModel from "./src/models/user.model.js";
import productModel from "./src/models/productModel.js";

dotenv.config();

const DEMO_PRODUCTS = [
  {
    title: "Aveniq Linen Shirt",
    description: "Breathable pure-linen shirt with a relaxed fit.",
    amount: 1899,
    image: "https://picsum.photos/seed/aveniq-shirt/600/800",
  },
  {
    title: "Merino Wool Sweater",
    description: "Lightweight merino sweater for layered warmth.",
    amount: 3499,
    image: "https://picsum.photos/seed/aveniq-sweater/600/800",
  },
  {
    title: "Tailored Chino Trousers",
    description: "Stretch-cotton chinos with a clean, tapered leg.",
    amount: 2499,
    image: "https://picsum.photos/seed/aveniq-chinos/600/800",
  },
  {
    title: "Canvas Weekender Bag",
    description: "Waxed-canvas holdall with leather trims.",
    amount: 5999,
    image: "https://picsum.photos/seed/aveniq-bag/600/800",
  },
];

async function ensureUser(email, contact, fullName, role) {
  const existing = await userModel.findOne({ email });
  if (existing) return existing;
  // create() (not updateOne) so the password-hashing pre-save hook runs.
  return userModel.create({ email, contact, password: "password123", fullName, role });
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const productCount = await productModel.countDocuments();
  if (productCount > 0) {
    console.log(`Seed skipped: ${productCount} product(s) already present.`);
    return mongoose.disconnect();
  }

  const seller = await ensureUser("seller@aveniq.demo", "9000000001", "Demo Seller", "seller");
  await ensureUser("buyer@aveniq.demo", "9000000002", "Demo Buyer", "buyer");

  await productModel.insertMany(
    DEMO_PRODUCTS.map((p) => ({
      title: p.title,
      description: p.description,
      seller: seller._id,
      price: { amount: p.amount, currency: "INR" },
      images: [{ url: p.image }],
    })),
  );

  console.log(
    `Seeded ${DEMO_PRODUCTS.length} products. Demo logins (password123): ` +
      `seller@aveniq.demo, buyer@aveniq.demo`,
  );
  return mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
