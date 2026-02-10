import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JwtPayload {
    userId: string;
    role: string;
}

// Extend Express Request to include user info
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    // Check for token in cookies (preferred) or Authorization header
    if (req.cookies?.at_token) {
        token = req.cookies.at_token;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
        return;
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as {
            userId: string;
            role: 'admin' | 'customer';
        };
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
};

export const generateToken = (payload: any): string => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
};
