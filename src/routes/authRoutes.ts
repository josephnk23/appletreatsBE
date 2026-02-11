import { Router } from 'express';
import { register, login, getMe, logout, updateMe, deactivateAccount } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.delete('/me', protect, deactivateAccount);

export default router;
