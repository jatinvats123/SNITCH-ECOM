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