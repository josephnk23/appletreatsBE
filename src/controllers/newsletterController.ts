import type { Request, Response, NextFunction } from 'express';
import { getEmmisorClient } from '../utils/emmisor.js';
import { env } from '../config/env.js';

/**
 * Subscribe to newsletter
 * POST /api/newsletter/subscribe
 */
export const subscribeToNewsletter = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, firstName, lastName } = req.body;

        // Validate required fields
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required',
            });
        }

        // Get Emmisor client
        const emmisor = getEmmisorClient();
        if (!emmisor) {
            console.error('Emmisor client not configured');
            return res.status(503).json({
                success: false,
                error: 'Newsletter service is currently unavailable',
            });
        }

        // Get service slug from env
        const serviceSlug = env.EMMISOR_SERVICE_SLUG;
        if (!serviceSlug) {
            console.error('EMMISOR_SERVICE_SLUG not configured');
            return res.status(503).json({
                success: false,
                error: 'Newsletter service is not configured',
            });
        }

        // Subscribe to newsletter
        const result = await emmisor.subscribeContact(serviceSlug, {
            email,
            firstName: firstName || 'Subscriber',
            lastName: lastName || '',
        });

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to newsletter!',
            data: result,
        });
    } catch (error: any) {
        console.error('Newsletter subscription error:', error);

        // Handle specific error codes from Emmisor
        if (error.code === 'ALREADY_SUBSCRIBED') {
            return res.status(409).json({
                success: false,
                error: 'You are already subscribed to our newsletter',
                code: 'ALREADY_SUBSCRIBED',
            });
        }

        if (error.code === 'VALIDATION_ERROR') {
            return res.status(400).json({
                success: false,
                error: 'Invalid email address',
                code: 'VALIDATION_ERROR',
            });
        }

        next(error);
    }
};

/**
 * Unsubscribe from newsletter
 * POST /api/newsletter/unsubscribe
 */
export const unsubscribeFromNewsletter = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required',
            });
        }

        const emmisor = getEmmisorClient();
        if (!emmisor) {
            return res.status(503).json({
                success: false,
                error: 'Newsletter service is currently unavailable',
            });
        }

        const serviceSlug = env.EMMISOR_SERVICE_SLUG;
        if (!serviceSlug) {
            return res.status(503).json({
                success: false,
                error: 'Newsletter service is not configured',
            });
        }

        const result = await emmisor.unsubscribeContact(serviceSlug, email);

        res.status(200).json({
            success: true,
            message: 'Successfully unsubscribed from newsletter',
            data: result,
        });
    } catch (error: any) {
        console.error('Newsletter unsubscribe error:', error);

        if (error.code === 'CONTACT_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                error: 'Email not found in our newsletter list',
                code: 'CONTACT_NOT_FOUND',
            });
        }

        next(error);
    }
};
