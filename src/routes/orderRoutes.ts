import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { createOrder, getMyOrders, getMyOrderById } from '../controllers/orderController.js';

const router = Router();

router.use(protect);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getMyOrderById);

export default router;
