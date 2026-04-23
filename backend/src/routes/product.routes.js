import express from 'express';
import { authenticateSeller } from '../middleware/auth.middleware.js';
import { createProduct } from '../controller/product.controller.js';
import { createProductValidator } from '../validator/product.validator.js';
import { getSellerProducts } from '../controller/product.controller.js';
import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 
})



const router = express.Router();
// @route POST /api/products
// Only authenticated sellers can create products
// Validate the request body and handle file uploads (up to 7 images)
// The images will be processed in the controller, where they will be uploaded to a storage service and their URLs will be saved in the database
router.post("/",authenticateSeller,upload.array('images',7),createProductValidator,createProduct)
//  @route GET /api/products/seller
// desc Get all products of the authenticated seller
// access Private (sellers only)
router.get("/seller",authenticateSeller,getSellerProducts)
export default router;