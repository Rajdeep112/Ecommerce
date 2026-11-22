import express from 'express';
import {getAllProducts, getProductById ,deleteProduct,updateProduct,filterProducts } from '../controllers/productController.js';
import multer from 'multer';
import path from 'path';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Setup Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'products/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.get("/allproducts",getAllProducts)
router.get('/product/:id', getProductById);
router.delete('/product/:id', protect, requireAdmin, deleteProduct);
router.put('/updateproduct/:id', protect, requireAdmin, upload.single('image'), updateProduct);
router.get('/filter-products', filterProducts);


export default router;
