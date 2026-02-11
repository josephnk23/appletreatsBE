import type { Request, Response, CookieOptions } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { users, addresses } from '../db/schema/index.js';
import { registerSchema, loginSchema } from '../validators/auth.js';
import { generateToken } from '../middleware/auth.js';
import { env } from '../config/env.js';

const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
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

        await db
            .update(users)
            .set({ lastActiveAt: new Date() })
            .where(eq(users.id, user.id));

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
                phoneNumber: users.phoneNumber,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, req.user!.userId))
            .limit(1);

        const [shippingAddress] = await db
            .select()
            .from(addresses)
            .where(and(eq(addresses.userId, req.user!.userId), eq(addresses.isDefault, true)))
            .limit(1);

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        res.json({
            success: true,
            data: {
                ...user,
                shippingAddress: shippingAddress
                    ? {
                        address: shippingAddress.address,
                        city: shippingAddress.city,
                        region: shippingAddress.region,
                        zipCode: shippingAddress.zipCode,
                        country: shippingAddress.country,
                    }
                    : null,
            }
        });
    } catch {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// ── Update Current User ─────────────────────────────────
export const updateMe = async (req: Request, res: Response) => {
    try {
        const { email, firstName, lastName, phoneNumber, shippingAddress } = req.body || {};

        if (email) {
            const [existing] = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);

            if (existing && existing.id !== req.user!.userId) {
                res.status(400).json({ success: false, message: 'Email already in use' });
                return;
            }
        }

        await db
            .update(users)
            .set({
                email: email || undefined,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                phoneNumber: phoneNumber || undefined,
            })
            .where(eq(users.id, req.user!.userId));

        if (shippingAddress) {
            if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.region || !shippingAddress.zipCode || !shippingAddress.country) {
                res.status(400).json({ success: false, message: 'Invalid shipping address' });
                return;
            }

            await db
                .update(addresses)
                .set({ isDefault: false })
                .where(eq(addresses.userId, req.user!.userId));

            await db.insert(addresses).values({
                id: crypto.randomUUID(),
                userId: req.user!.userId,
                address: shippingAddress.address,
                city: shippingAddress.city,
                region: shippingAddress.region,
                zipCode: shippingAddress.zipCode,
                country: shippingAddress.country,
                isDefault: true,
            });
        }

        const [updatedUser] = await db
            .select({
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
                phoneNumber: users.phoneNumber,
            })
            .from(users)
            .where(eq(users.id, req.user!.userId))
            .limit(1);

        const [updatedAddress] = await db
            .select()
            .from(addresses)
            .where(and(eq(addresses.userId, req.user!.userId), eq(addresses.isDefault, true)))
            .limit(1);

        res.json({
            success: true,
            data: {
                ...updatedUser,
                shippingAddress: updatedAddress
                    ? {
                        address: updatedAddress.address,
                        city: updatedAddress.city,
                        region: updatedAddress.region,
                        zipCode: updatedAddress.zipCode,
                        country: updatedAddress.country,
                    }
                    : null,
            },
        });
    } catch (error: any) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Failed to update user' });
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

// ── Deactivate Account ───────────────────────────────────
export const deactivateAccount = async (req: Request, res: Response) => {
    try {
        await db
            .update(users)
            .set({ status: 'Inactive' })
            .where(eq(users.id, req.user!.userId));

        res.clearCookie('at_token', {
            ...cookieOptions,
            maxAge: 0,
        });

        res.json({ success: true, message: 'Account deactivated successfully' });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to deactivate account' });
    }
};
