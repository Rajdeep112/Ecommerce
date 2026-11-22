import express from 'express';
import { getStats } from '../controllers/dashboardController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, requireAdmin, getStats);

export default router;
