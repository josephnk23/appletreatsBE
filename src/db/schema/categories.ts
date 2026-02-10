import {
    mysqlTable,
    int,
    varchar,
} from 'drizzle-orm/mysql-core';

export const categories = mysqlTable('categories', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    image: varchar('image', { length: 500 }),
    href: varchar('href', { length: 255 }),
    sortOrder: int('sort_order').notNull().default(0),
});
