import { Router } from 'express';
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getHeroSlides,
    createHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    getPromoBanners,
    createPromoBanner,
    updatePromoBanner,
    deletePromoBanner,
    getCustomers,
    getOrders,
    updateOrderStatus,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// Apply protection to all admin routes
router.use(protect);
router.use(adminOnly);

// ── Products ──
router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// ── Categories ──
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// ── Hero Slides ──
router.get('/hero-slides', getHeroSlides);
router.post('/hero-slides', createHeroSlide);
router.put('/hero-slides/:id', updateHeroSlide);
router.delete('/hero-slides/:id', deleteHeroSlide);

// ── Promo Banners ──
router.get('/promo-banners', getPromoBanners);
router.post('/promo-banners', createPromoBanner);
router.put('/promo-banners/:id', updatePromoBanner);
router.delete('/promo-banners/:id', deletePromoBanner);

// ── Customers ──
router.get('/customers', getCustomers);

// ── Orders ──
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;
