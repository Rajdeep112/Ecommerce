import express from 'express';
import {
  checkout,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/checkout', protect, checkout);
router.get('/my', protect, getMyOrders);
router.get('/', protect, requireAdmin, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, requireAdmin, updateOrderStatus);

export default router;
