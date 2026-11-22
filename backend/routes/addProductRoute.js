import express from 'express';
import { addProduct, uploadProductImg } from '../controllers/addProductController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/addproduct', protect, uploadProductImg.single('image'), addProduct);

export default router;
