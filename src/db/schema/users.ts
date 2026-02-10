import {
    mysqlTable,
    varchar,
    timestamp,
    mysqlEnum,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const users = mysqlTable('users', {
    id: varchar('id', { length: 36 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    phoneNumber: varchar('phone_number', { length: 30 }),
    profileImage: varchar('profile_image', { length: 500 }),
    role: mysqlEnum('role', ['admin', 'customer']).notNull().default('customer'),
    status: mysqlEnum('status', ['Active', 'Inactive', 'Blocked']).notNull().default('Active'),
    lastActiveAt: timestamp('last_active_at'),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
});
