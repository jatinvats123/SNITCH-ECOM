import express from 'express';
import { authenticateSeller } from '../middleware/auth.middleware.js';
import { createProduct } from '../controller/product.controller.js';
import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 
})



const router = express.Router();


router.post("/",authenticateSeller,upload.array('images',7),createProduct)

export default router;