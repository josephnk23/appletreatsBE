import {
    mysqlTable,
    int,
    varchar,
    text,
    boolean,
} from 'drizzle-orm/mysql-core';

export const heroSlides = mysqlTable('hero_slides', {
    id: int('id').primaryKey().autoincrement(),
    content: text('content').notNull(),       // Rich text HTML
    image: varchar('image', { length: 500 }).notNull(),
    cta: varchar('cta', { length: 100 }).notNull(),
    href: varchar('href', { length: 255 }).notNull(),
    sortOrder: int('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
});

export const promoBanners = mysqlTable('promo_banners', {
    id: int('id').primaryKey().autoincrement(),
    content: text('content').notNull(),       // Rich text HTML
    ctaText: varchar('cta_text', { length: 100 }).notNull(),
    ctaLink: varchar('cta_link', { length: 255 }).notNull(),
    bgColor: varchar('bg_color', { length: 20 }).notNull().default('#f5f5f7'),
    image: varchar('image', { length: 500 }).notNull(),
    sortOrder: int('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
});
