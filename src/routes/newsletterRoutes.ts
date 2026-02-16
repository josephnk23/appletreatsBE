import { Router } from 'express';
import {
    subscribeToNewsletter,
    unsubscribeFromNewsletter,
} from '../controllers/newsletterController.js';

const router = Router();

// Public routes - no authentication required
router.post('/subscribe', subscribeToNewsletter);
router.post('/unsubscribe', unsubscribeFromNewsletter);

export default router;
