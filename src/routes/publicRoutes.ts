import { Router } from 'express';
import { getLandingPageData, getCategories, getProducts, getProductById } from '../controllers/publicController.js';
import { getOrderTracking } from '../controllers/orderController.js';

const router = Router();

router.get('/landing-page', getLandingPageData);
router.get('/categories', getCategories);
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.get('/orders/:id', getOrderTracking);

export default router;
