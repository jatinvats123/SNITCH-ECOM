import express from 'express';
import { authenticateSeller } from '../middleware/auth.middleware.js';
import { createProduct, addProductVariant } from '../controller/product.controller.js';
import { createProductValidator, createVariantValidator } from '../validator/product.validator.js';
import { getSellerProducts } from '../controller/product.controller.js';
import { getAllProducts } from '../controller/product.controller.js';
import { getProductDetail } from '../controller/product.controller.js';
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
// @route GET /api/products
// desc Get all products
// access Public
router.get("/",getAllProducts)
 




// @route GET /api/products/detail/:id
// desc Get product details by ID
// access Public
router.get("/detail/:productId",getProductDetail)



// @route post /api/products/:productId/variants
// @desc Add a new variant to a product
// @access Private (sellers only)

router.post("/:productId/variants",authenticateSeller,upload.array('images',7),
createVariantValidator,addProductVariant)

export default router;