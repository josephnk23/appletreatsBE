import {
    mysqlTable,
    varchar,
    decimal,
    int,
    boolean,
    text,
    json,
    timestamp,
    mysqlEnum,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { categories } from './categories.js';

export const products = mysqlTable('products', {
    id: varchar('id', { length: 36 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 255 }).notNull(),
    categoryId: int('category_id')
        .notNull()
        .references(() => categories.id),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    originalPrice: decimal('original_price', { precision: 10, scale: 2 }).notNull(),
    image: varchar('image', { length: 500 }).notNull(),
    condition: mysqlEnum('condition', ['New', 'Refurbished']).notNull().default('New'),
    isNew: boolean('is_new').notNull().default(false),
    isBestSeller: boolean('is_best_seller').notNull().default(false),
    isFeatured: boolean('is_featured').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    stock: int('stock').notNull().default(0),

    // Variant options stored as JSON
    // colors: [{ name: string, value: string }]
    colors: json('colors').$type<{ name: string; value: string }[]>(),
    // storageOptions: [{ size: string, priceBump: number }]
    storageOptions: json('storage_options').$type<{ size: string; priceBump: number }[]>(),
    // grades: [{ name: string, priceBump: number }]
    grades: json('grades').$type<{ name: string; priceBump: number }[]>(),
    // memoryOptions: [{ size: string, priceBump: number }]
    memoryOptions: json('memory_options').$type<{ size: string; priceBump: number }[]>(),
    // specs: [{ label: string, value: string }]
    specs: json('specs').$type<{ label: string; value: string }[]>(),

    description: text('description'),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
});
