import mongoose from "mongoose";
import productModel from "../models/productModel.js";
import { uploadFile } from "../services/storage.service.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

// Throw 403 unless the product belongs to the given seller. Centralises the
// ownership check that used to be copy-pasted across three handlers.
function assertOwnership(product, seller, action) {
  const productSellerId = String(product.seller?._id ?? product.seller);
  const currentSellerId = String(seller?._id ?? seller);
  if (productSellerId !== currentSellerId) {
    throw AppError.forbidden(`You are not authorized to ${action}`, "NOT_OWNER");
  }
}

async function uploadImages(files = []) {
  return Promise.all(
    files.map(async (file) => {
      const uploaded = await uploadFile({ buffer: file.buffer, fileName: file.originalname });
      return { url: uploaded.url };
    }),
  );
}

export const createProduct = asyncHandler(async (req, res) => {
  const { title, description, priceAmount, priceCurrency } = req.body;
  const seller = req.user;

  const images = await uploadImages(req.files || []);

  const product = await productModel.create({
    title,
    description,
    price: { amount: priceAmount, currency: priceCurrency || "INR" },
    images,
    seller: seller._id,
  });
  return sendSuccess(res, 201, "Product created successfully", { product });
});

export const getSellerProducts = asyncHandler(async (req, res) => {
  const products = await productModel.find({ seller: req.user._id });
  return sendSuccess(res, 200, "Products fetched successfully", { products });
});

const SORT_OPTIONS = {
  price_asc: { "price.amount": 1 },
  price_desc: { "price.amount": -1 },
  newest: { createdAt: -1 },
};

export const getAllProducts = asyncHandler(async (req, res) => {
  const { q, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

  const filter = {};
  if (q) {
    const regex = new RegExp(q.trim(), "i");
    filter.$or = [{ title: regex }, { description: regex }];
  }
  if (minPrice || maxPrice) {
    filter["price.amount"] = {};
    if (minPrice) filter["price.amount"].$gte = Number(minPrice);
    if (maxPrice) filter["price.amount"].$lte = Number(maxPrice);
  }

  const sortOption = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 12);

  const [products, total] = await Promise.all([
    productModel
      .find(filter)
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    productModel.countDocuments(filter),
  ]);

  return sendSuccess(res, 200, "Products fetched successfully", {
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.max(1, Math.ceil(total / limitNum)),
    },
  });
});

export const getProductDetail = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await productModel.findById(productId);
  if (!product) {
    throw AppError.notFound("Product not found", "PRODUCT_NOT_FOUND");
  }
  return sendSuccess(res, 200, "Product fetched successfully", { product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await productModel.findById(productId);
  if (!product) {
    throw AppError.notFound("Product not found", "PRODUCT_NOT_FOUND");
  }
  assertOwnership(product, req.user, "delete this product");

  await productModel.findByIdAndDelete(productId);
  return sendSuccess(res, 200, "Product deleted successfully");
});

export const addProductVariant = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { title, description, stock } = req.body;
  let { attributes } = req.body;
  const priceAmount =
    req.body.price?.amount ?? req.body["price.amount"] ?? req.body["price[amount]"];
  const priceCurrency =
    req.body.price?.currency ?? req.body["price.currency"] ?? req.body["price[currency]"];

  // Parse attributes if it's a JSON string.
  if (typeof attributes === "string") {
    try {
      attributes = JSON.parse(attributes);
    } catch {
      throw AppError.badRequest("Invalid attributes JSON", "INVALID_ATTRIBUTES");
    }
  }

  const product = await productModel.findById(productId);
  if (!product) {
    throw AppError.notFound("Product not found", "PRODUCT_NOT_FOUND");
  }
  assertOwnership(product, req.user, "add variants to this product");

  const images = req.files && req.files.length > 0 ? await uploadImages(req.files) : [];

  const variant = {
    title: title || product.title,
    description: description || product.description,
    price: {
      amount: Number(priceAmount ?? product.price.amount),
      currency: priceCurrency || product.price.currency,
    },
    images,
    attributes: attributes || {},
    stock: Number(stock) || 0,
    variantId: new mongoose.Types.ObjectId(),
  };

  product.variants = product.variants || [];
  product.variants.push(variant);
  await product.save();

  return sendSuccess(res, 201, "Variant added successfully", { product });
});

export const deleteVariant = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;

  const product = await productModel.findById(productId);
  if (!product) {
    throw AppError.notFound("Product not found", "PRODUCT_NOT_FOUND");
  }
  assertOwnership(product, req.user, "delete variants from this product");

  const variantIndex = product.variants.findIndex((v) => v._id.toString() === variantId);
  if (variantIndex === -1) {
    throw AppError.notFound("Variant not found", "VARIANT_NOT_FOUND");
  }

  product.variants.splice(variantIndex, 1);
  await product.save();

  return sendSuccess(res, 200, "Variant deleted successfully", { product });
});
