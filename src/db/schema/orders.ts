import {
    mysqlTable,
    varchar,
    decimal,
    int,
    json,
    timestamp,
    mysqlEnum,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { users } from './users.js';
import { addresses } from './addresses.js';
import { products } from './products.js';

export const orders = mysqlTable('orders', {
    id: varchar('id', { length: 36 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    customerId: varchar('customer_id', { length: 36 })
        .notNull()
        .references(() => users.id),
    shippingAddressId: varchar('shipping_address_id', { length: 36 })
        .references(() => addresses.id),
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
    tax: decimal('tax', { precision: 10, scale: 2 }).notNull().default('0'),
    shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }).notNull().default('0'),
    total: decimal('total', { precision: 10, scale: 2 }).notNull(),
    status: mysqlEnum('status', [
        'Processing',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Refunded',
    ]).notNull().default('Processing'),
    paymentStatus: mysqlEnum('payment_status', [
        'Paid',
        'Pending',
        'Failed',
        'Refunded',
    ]).notNull().default('Pending'),
    trackingNumber: varchar('tracking_number', { length: 100 }),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
});

export const orderItems = mysqlTable('order_items', {
    id: varchar('id', { length: 36 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    orderId: varchar('order_id', { length: 36 })
        .notNull()
        .references(() => orders.id, { onDelete: 'cascade' }),
    productId: varchar('product_id', { length: 36 })
        .notNull()
        .references(() => products.id),
    // Snapshot fields — denormalized at order time so they survive product edits
    name: varchar('name', { length: 255 }).notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    quantity: int('quantity').notNull().default(1),
    image: varchar('image', { length: 500 }).notNull(),
    // e.g. ["256GB", "Space Gray"]
    selectedOptions: json('selected_options').$type<string[]>(),
});
