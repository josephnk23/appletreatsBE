import { relations } from 'drizzle-orm';
import { products } from './products.js';
import { categories } from './categories.js';

export * from './users.js';
export * from './addresses.js';
export * from './categories.js';
export * from './products.js';
export * from './orders.js';
export * from './cms.js';

export const productRelations = relations(products, ({ one }) => ({
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
    products: many(products),
}));

