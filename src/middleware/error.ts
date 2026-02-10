import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        success: false,
        message: `Not found — ${req.originalUrl}`,
    });
};

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error('❌ Error:', {
        message: err.message,
        method: req.method,
        url: req.originalUrl,
        stack: err.stack
    });

    // Zod validation errors
    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.flatten().fieldErrors,
        });
        return;
    }

    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
