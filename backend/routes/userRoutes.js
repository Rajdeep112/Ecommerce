import express from 'express';
import multer from 'multer';
import { getUserById, getAllUsers, createUser, updateUser, deleteUserById } from '../controllers/userController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`),
});
const upload = multer({ storage });

router.post('/getuser', protect, getUserById);
router.get('/getalluser', protect, requireAdmin, getAllUsers);
router.post('/createuser', protect, requireAdmin, upload.single('userimg'), createUser);
router.put('/updateuser/:id', protect, requireAdmin, upload.single('userimg'), updateUser);
router.delete('/deleteuser/:id', protect, requireAdmin, deleteUserById);

export default router;
