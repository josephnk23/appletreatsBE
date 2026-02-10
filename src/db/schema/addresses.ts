import {
    mysqlTable,
    varchar,
    boolean,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { users } from './users.js';

export const addresses = mysqlTable('addresses', {
    id: varchar('id', { length: 36 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: varchar('user_id', { length: 36 })
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    address: varchar('address', { length: 500 }).notNull(),
    city: varchar('city', { length: 255 }).notNull(),
    region: varchar('region', { length: 255 }).notNull(),
    zipCode: varchar('zip_code', { length: 20 }).notNull(),
    country: varchar('country', { length: 100 }).notNull(),
    isDefault: boolean('is_default').notNull().default(false),
});
