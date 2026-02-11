import type { Request, Response } from 'express';
import { db } from '../config/database.js';
import * as schema from '../db/schema/index.js';
import { desc, eq, inArray } from 'drizzle-orm';
import crypto from 'node:crypto';
import { getEmmisorClient } from '../utils/emmisor.js';
import { buildOrderConfirmationEmail } from '../utils/emailTemplates.js';

const toNumber = (val: any) => {
    if (val === null || val === undefined) return 0;
    const asNumber = Number(val);
    return Number.isNaN(asNumber) ? 0 : asNumber;
};

const formatDate = (value: any) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const mapOrder = (order: any, user: any, address: any, items: any[]) => {
    return {
        id: order.id,
        customerId: order.customerId,
        customerName: user ? `${user.firstName} ${user.lastName}` : 'Customer',
        customerEmail: user?.email || '',
        date: formatDate(order.createdAt),
        createdAt: order.createdAt,
        total: toNumber(order.total),
        subtotal: toNumber(order.subtotal),
        tax: toNumber(order.tax),
        shippingCost: toNumber(order.shippingCost),
        status: order.status,
        paymentStatus: order.paymentStatus,
        items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: toNumber(item.price),
            quantity: item.quantity,
            image: item.image,
            selectedOptions: item.selectedOptions || [],
        })),
        shippingAddress: address
            ? {
                address: address.address,
                city: address.city,
                region: address.region,
                zipCode: address.zipCode,
                country: address.country,
            }
            : null,
        trackingNumber: order.trackingNumber,
    };
};

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { items, shippingAddress, phoneNumber } = req.body || {};

        if (!Array.isArray(items) || items.length === 0) {
            res.status(400).json({ success: false, message: 'Order items are required' });
            return;
        }

        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.region || !shippingAddress.zipCode || !shippingAddress.country) {
            res.status(400).json({ success: false, message: 'Shipping address is required' });
            return;
        }

        const invalidItem = items.find((item: any) => !item.productId || !item.name || item.price === undefined || item.price === null);
        if (invalidItem) {
            res.status(400).json({ success: false, message: 'Invalid order items' });
            return;
        }

        const subtotal = items.reduce((sum: number, item: any) => {
            const price = toNumber(item.price);
            const qty = Number(item.quantity || 1);
            return sum + price * qty;
        }, 0);

        const total = subtotal;

        // Generate a unique short order ID with collision check
        const generateOrderId = () => {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let code = '';
            for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
            return `AT-${code}`;
        };

        let orderId = generateOrderId();
        for (let attempt = 0; attempt < 5; attempt++) {
            const [existing] = await db
                .select({ id: schema.orders.id })
                .from(schema.orders)
                .where(eq(schema.orders.id, orderId))
                .limit(1);
            if (!existing) break;
            orderId = generateOrderId();
        }

        await db.transaction(async (tx) => {
            // Update contact info if provided
            if (phoneNumber) {
                await tx
                    .update(schema.users)
                    .set({ phoneNumber })
                    .where(eq(schema.users.id, req.user!.userId));
            }

            // Reset defaults and create new default address
            await tx
                .update(schema.addresses)
                .set({ isDefault: false })
                .where(eq(schema.addresses.userId, req.user!.userId));

            const addressId = crypto.randomUUID();
            await tx.insert(schema.addresses).values({
                id: addressId,
                userId: req.user!.userId,
                address: shippingAddress.address,
                city: shippingAddress.city,
                region: shippingAddress.region,
                zipCode: shippingAddress.zipCode,
                country: shippingAddress.country,
                isDefault: true,
            });

            await tx.insert(schema.orders).values({
                id: orderId,
                customerId: req.user!.userId,
                shippingAddressId: addressId,
                subtotal: subtotal.toFixed(2),
                tax: '0.00',
                shippingCost: '0.00',
                total: total.toFixed(2),
                status: 'Processing',
                paymentStatus: 'Paid',
            });

            await tx.insert(schema.orderItems).values(
                items.map((item: any) => ({
                    orderId,
                    productId: item.productId,
                    name: item.name,
                    price: toNumber(item.price).toFixed(2),
                    quantity: Number(item.quantity || 1),
                    image: item.image,
                    selectedOptions: item.selectedOptions || [],
                }))
            );
        });

        // Send order confirmation email (non-blocking)
        const emmisor = getEmmisorClient();
        if (emmisor) {
            console.log('Fetching user for order confirmation email...');
            const [user] = await db
                .select({ firstName: schema.users.firstName, lastName: schema.users.lastName, email: schema.users.email })
                .from(schema.users)
                .where(eq(schema.users.id, req.user!.userId))
                .limit(1);

            if (user) {
                const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const { subject, html } = buildOrderConfirmationEmail({
                    orderId,
                    customerName: `${user.firstName} ${user.lastName}`,
                    customerEmail: user.email,
                    date: formatDate(new Date()),
                    items: items.map((item: any) => ({
                        name: item.name,
                        quantity: Number(item.quantity || 1),
                        price: toNumber(item.price),
                        selectedOptions: item.selectedOptions,
                    })),
                    subtotal,
                    shippingCost: 0,
                    tax: 0,
                    total,
                    shippingAddress,
                });

                emmisor.sendEmail({ to: user.email, subject, html }).catch((err) => {
                    console.error('Failed to send order confirmation email:', err);
                });
            }
        }

        res.status(201).json({ success: true, data: { id: orderId, total } });
    } catch (error: any) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Failed to create order' });
    }
};

export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const rows = await db
            .select({
                order: schema.orders,
                user: schema.users,
                address: schema.addresses,
            })
            .from(schema.orders)
            .leftJoin(schema.users, eq(schema.orders.customerId, schema.users.id))
            .leftJoin(schema.addresses, eq(schema.orders.shippingAddressId, schema.addresses.id))
            .where(eq(schema.orders.customerId, req.user!.userId))
            .orderBy(desc(schema.orders.createdAt));

        if (rows.length === 0) {
            res.json({ success: true, data: [] });
            return;
        }

        const orderIds = rows.map((row) => row.order.id);
        const items = await db
            .select()
            .from(schema.orderItems)
            .where(inArray(schema.orderItems.orderId, orderIds));

        const itemsByOrder = new Map<string, any[]>();
        for (const item of items) {
            const list = itemsByOrder.get(item.orderId) || [];
            list.push(item);
            itemsByOrder.set(item.orderId, list);
        }

        const data = rows.map((row) =>
            mapOrder(row.order, row.user, row.address, itemsByOrder.get(row.order.id) || [])
        );

        res.json({ success: true, data });
    } catch (error: any) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
};

export const getMyOrderById = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);

        const rows = await db
            .select({
                order: schema.orders,
                user: schema.users,
                address: schema.addresses,
            })
            .from(schema.orders)
            .leftJoin(schema.users, eq(schema.orders.customerId, schema.users.id))
            .leftJoin(schema.addresses, eq(schema.orders.shippingAddressId, schema.addresses.id))
            .where(eq(schema.orders.id, id))
            .limit(1);

        if (rows.length === 0 || rows[0].order.customerId !== req.user!.userId) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }

        const orderItems = await db
            .select()
            .from(schema.orderItems)
            .where(eq(schema.orderItems.orderId, id));

        const data = mapOrder(rows[0].order, rows[0].user, rows[0].address, orderItems);
        res.json({ success: true, data });
    } catch (error: any) {
        console.error('Error fetching order:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch order' });
    }
};

export const getOrderTracking = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);

        const [order] = await db
            .select({
                id: schema.orders.id,
                status: schema.orders.status,
                paymentStatus: schema.orders.paymentStatus,
                trackingNumber: schema.orders.trackingNumber,
                createdAt: schema.orders.createdAt,
            })
            .from(schema.orders)
            .where(eq(schema.orders.id, id))
            .limit(1);

        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }

        res.json({
            success: true,
            data: {
                id: order.id,
                status: order.status,
                paymentStatus: order.paymentStatus,
                trackingNumber: order.trackingNumber,
                createdAt: order.createdAt,
                date: formatDate(order.createdAt),
            },
        });
    } catch (error: any) {
        console.error('Error fetching order tracking:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch order tracking' });
    }
};
