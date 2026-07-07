import mongoose from "mongoose";
import productModel from "../models/productModel.js";
import { uploadFile } from "../services/storage.service.js";

export async function createProduct(req, res) {
    const {title, description, priceAmount,priceCurrency} = req.body;
    const seller = req.user;

  const images = await Promise.all(req.files.map(async (file) => {
    const uploaded = await uploadFile({
      buffer: file.buffer,
      fileName: file.originalname,
    });

    return { url: uploaded.url };
  }));

  const product = await productModel.create({
    title,
    description,
    price:{
        amount: priceAmount,
        currency: priceCurrency || "INR"
    },
    images,
    seller: seller._id
  })
  res.status(201).json(
  {message:"Product created successfully", 
      success:true,
      product})
}

export async function getSellerProducts(req,res){
  const seller = req.user;
  const products = await productModel.find({ seller: seller._id });

  res.status(200).json({
    message: "Products fetched successfully",
    success: true,
    products,
  });
}

export async function getAllProducts(req,res){
  const products = await productModel.find()
  res.status(200).json({
    message: "Products fetched successfully",
    success: true,
    products,
  });
}
export async function getProductDetail(req,res){
  const {productId}=req.params;
  const product = await productModel.findById(productId)
  if(!product){
    return res.status(404).json({
      message:"Product not found",
      success:false
    })
  }
  res.status(200).json({
    message:"Product fetched successfully",
    success:true,
    product
  })
}

export async function addProductVariant(req,res){

  try{
    const { productId } = req.params;
    let { title, description, stock, attributes } = req.body;
    const priceAmount = req.body.price?.amount ?? req.body["price.amount"] ?? req.body["price[amount]"];
    const priceCurrency = req.body.price?.currency ?? req.body["price.currency"] ?? req.body["price[currency]"];
    const seller = req.user;

    // Parse attributes if it's a JSON string
    if (typeof attributes === 'string') {
      attributes = JSON.parse(attributes);
    }

    const product = await productModel.findById(productId);
    if(!product){
      return res.status(404).json({
        message:"Product not found",
        success:false
      })
    }

    // Verify seller owns this product
    const productSellerId = String(product.seller?._id ?? product.seller);
    const currentSellerId = String(seller?._id ?? seller);
    if(productSellerId !== currentSellerId){
      return res.status(403).json({
        message:"You are not authorized to add variants to this product",
        success:false
      })
    }

    // Upload variant images
    let images = [];
    if(req.files && req.files.length > 0) {
      images = await Promise.all(req.files.map(async (file) => {
        const uploaded = await uploadFile({
          buffer: file.buffer,
          fileName: file.originalname,
        });
        return { url: uploaded.url };
      }));
    }

    // Add variant to product
    const variant = {
      title: title || product.title,
      description: description || product.description,
      price: {
        amount: Number(priceAmount ?? product.price.amount),
        currency: priceCurrency || product.price.currency
      },
      images,
      attributes: attributes || {},
      stock: Number(stock) || 0,
      variantId: new mongoose.Types.ObjectId()
    };

    product.variants = product.variants || [];
    product.variants.push(variant);
    await product.save();

    res.status(201).json({
      message:"Variant added successfully",
      success:true,
      product
    })
  }catch(error){
    console.error("Error adding variant:", error);
    res.status(500).json({
      message:"Error adding variant",
      success:false,
      error: error.message
    })
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
        success: false
      });
    }

    // Verify seller owns this product
    const productSellerId = String(product.seller?._id ?? product.seller);
    const currentSellerId = String(seller?._id ?? seller);
    if (productSellerId !== currentSellerId) {
      return res.status(403).json({
        message: "You are not authorized to delete variants from this product",
        success: false
      });
    }

    // Find and remove the variant
    const variantIndex = product.variants.findIndex(v => v._id.toString() === variantId);
    if (variantIndex === -1) {
      return res.status(404).json({
        message: "Variant not found",
        success: false
      });
    }

    product.variants.splice(variantIndex, 1);
    await product.save();

    res.status(200).json({
      message: "Variant deleted successfully",
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting variant",
      success: false,
      error: error.message
    });
  }
}