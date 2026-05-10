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
    const { title, description, priceAmount, priceCurrency, size, color, stock } = req.body;
    const seller = req.user;

    const product = await productModel.findById(productId);
    if(!product){
      return res.status(404).json({
        message:"Product not found",
        success:false
      })
    }

    // Verify seller owns this product
    if(product.seller.toString() !== seller._id.toString()){
      return res.status(403).json({
        message:"You are not authorized to add variants to this product",
        success:false
      })
    }

    // Upload variant images
    const images = await Promise.all(req.files.map(async (file) => {
      const uploaded = await uploadFile({
        buffer: file.buffer,
        fileName: file.originalname,
      });
      return { url: uploaded.url };
    }));

    // Add variant to product
    const variant = {
      title: title || product.title,
      description: description || product.description,
      price: {
        amount: priceAmount || product.price.amount,
        currency: priceCurrency || product.price.currency
      },
      images,
      size,
      color,
      stock: stock || 0
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
    res.status(500).json({
      message:"Error adding variant",
      success:false,
      error: error.message
    })
  }
}