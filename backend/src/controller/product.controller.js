import mongoose from "mongoose";
import productModel from "../models/productModel.js";
import { uploadFile } from "../services/storage.service.js";

export async function createProduct(req, res) {
  try {
    const { title, description, priceAmount, priceCurrency } = req.body;
    const seller = req.user;

    const files = req.files || [];
    const images = await Promise.all(
      files.map(async (file) => {
        const uploaded = await uploadFile({
          buffer: file.buffer,
          fileName: file.originalname,
        });

        return { url: uploaded.url };
      }),
    );

    const product = await productModel.create({
      title,
      description,
      price: {
        amount: priceAmount,
        currency: priceCurrency || "INR",
      },
      images,
      seller: seller._id,
    });
    res.status(201).json({ message: "Product created successfully", success: true, product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      message: error.message || "Error creating product",
      success: false,
    });
  }
}

export async function getSellerProducts(req, res) {
  const seller = req.user;
  const products = await productModel.find({ seller: seller._id });

  res.status(200).json({
    message: "Products fetched successfully",
    success: true,
    products,
  });
}

const SORT_OPTIONS = {
  price_asc: { "price.amount": 1 },
  price_desc: { "price.amount": -1 },
  newest: { createdAt: -1 },
};

export async function getAllProducts(req, res) {
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

  res.status(200).json({
    message: "Products fetched successfully",
    success: true,
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.max(1, Math.ceil(total / limitNum)),
    },
  });
}
export async function getProductDetail(req, res) {
  const { productId } = req.params;
  const product = await productModel.findById(productId);
  if (!product) {
    return res.status(404).json({
      message: "Product not found",
      success: false,
    });
  }
  res.status(200).json({
    message: "Product fetched successfully",
    success: true,
    product,
  });
}

export async function deleteProduct(req, res) {
  try {
    const { productId } = req.params;
    const seller = req.user;

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    const productSellerId = String(product.seller?._id ?? product.seller);
    const currentSellerId = String(seller?._id ?? seller);
    if (productSellerId !== currentSellerId) {
      return res.status(403).json({
        message: "You are not authorized to delete this product",
        success: false,
      });
    }

    await productModel.findByIdAndDelete(productId);

    res.status(200).json({
      message: "Product deleted successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting product",
      success: false,
      error: error.message,
    });
  }
}

export async function addProductVariant(req, res) {
  try {
    const { productId } = req.params;
    const { title, description, stock } = req.body;
    let { attributes } = req.body;
    const priceAmount =
      req.body.price?.amount ?? req.body["price.amount"] ?? req.body["price[amount]"];
    const priceCurrency =
      req.body.price?.currency ?? req.body["price.currency"] ?? req.body["price[currency]"];
    const seller = req.user;

    // Parse attributes if it's a JSON string
    if (typeof attributes === "string") {
      attributes = JSON.parse(attributes);
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    // Verify seller owns this product
    const productSellerId = String(product.seller?._id ?? product.seller);
    const currentSellerId = String(seller?._id ?? seller);
    if (productSellerId !== currentSellerId) {
      return res.status(403).json({
        message: "You are not authorized to add variants to this product",
        success: false,
      });
    }

    // Upload variant images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = await Promise.all(
        req.files.map(async (file) => {
          const uploaded = await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname,
          });
          return { url: uploaded.url };
        }),
      );
    }

    // Add variant to product
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

    res.status(201).json({
      message: "Variant added successfully",
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error adding variant:", error);
    res.status(500).json({
      message: "Error adding variant",
      success: false,
      error: error.message,
    });
  }
}

export async function deleteVariant(req, res) {
  try {
    const { productId, variantId } = req.params;
    const seller = req.user;

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    // Verify seller owns this product
    const productSellerId = String(product.seller?._id ?? product.seller);
    const currentSellerId = String(seller?._id ?? seller);
    if (productSellerId !== currentSellerId) {
      return res.status(403).json({
        message: "You are not authorized to delete variants from this product",
        success: false,
      });
    }

    // Find and remove the variant
    const variantIndex = product.variants.findIndex((v) => v._id.toString() === variantId);
    if (variantIndex === -1) {
      return res.status(404).json({
        message: "Variant not found",
        success: false,
      });
    }

    product.variants.splice(variantIndex, 1);
    await product.save();

    res.status(200).json({
      message: "Variant deleted successfully",
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting variant",
      success: false,
      error: error.message,
    });
  }
}
