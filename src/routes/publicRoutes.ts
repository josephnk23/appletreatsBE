import { Router } from 'express';
import { getLandingPageData, getCategories, getProducts, getProductById } from '../controllers/publicController.js';

const router = Router();

router.get('/landing-page', getLandingPageData);
router.get('/categories', getCategories);
router.get('/products', getProducts);
router.get('/products/:id', getProductById);

export default router;
