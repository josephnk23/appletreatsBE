import type { Request, Response, CookieOptions } from 'express';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { users } from '../db/schema/index.js';
import { registerSchema, loginSchema } from '../validators/auth.js';
import { generateToken } from '../middleware/auth.js';
import { env } from '../config/env.js';

const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 1 * 24 * 60 * 60 * 1000, 
};

// ── Register ─────────────────────────────────────────────
export const register = async (req: Request, res: Response) => {
    try {
        const data = registerSchema.parse(req.body);

        // Check if user exists
        const [existing] = await db
            .select()
            .from(users)
            .where(eq(users.email, data.email))
            .limit(1);

        if (existing) {
            res.status(400).json({ success: false, message: 'Email already in use' });
            return;
        }

        // Hash password & create user
        const hashedPassword = await bcrypt.hash(data.password, 12);
        await db.insert(users).values({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword,
        });

        // Fetch the created user
        const [newUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, data.email))
            .limit(1);

        const token = generateToken({ userId: newUser.id, role: newUser.role });

        res.cookie('at_token', token, cookieOptions);

        res.status(201).json({
            success: true,
            data: {
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                role: newUser.role,
                token,
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// ── Login ────────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
    try {
        const data = loginSchema.parse(req.body);

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, data.email))
            .limit(1);

        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        const token = generateToken({ userId: user.id, role: user.role });

        res.cookie('at_token', token, cookieOptions);

        res.json({
            success: true,
            data: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                // token,
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// ── Get Current User ─────────────────────────────────────
export const getMe = async (req: Request, res: Response) => {
    try {
        const [user] = await db
            .select({
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, req.user!.userId))
            .limit(1);

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        res.json({ success: true, data: user });
    } catch {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// ── Logout ───────────────────────────────────────────────
export const logout = async (_req: Request, res: Response) => {
    res.clearCookie('at_token', {
        ...cookieOptions,
        maxAge: 0
    });
    res.json({ success: true, message: 'Logged out successfully' });
};
