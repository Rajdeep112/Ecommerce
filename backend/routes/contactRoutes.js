import express from 'express';
import { createMessage, getAllMessages, markAsRead, deleteMessage } from '../controllers/contactController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createMessage);
router.get('/', protect, requireAdmin, getAllMessages);
router.put('/:id/read', protect, requireAdmin, markAsRead);
router.delete('/:id', protect, requireAdmin, deleteMessage);

export default router;
