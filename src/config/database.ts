import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from './env.js';

const pool = mysql.createPool({
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

import * as schema from '../db/schema/index.js';

export const db = drizzle(pool, { schema, mode: 'default', logger: true });

// Test connection on startup
pool
    .getConnection()
    .then((conn) => {
        console.log('✅ Database connected successfully');
        conn.release();
    })
    .catch((err) => {
        console.error('❌ Database connection failed:', err.message);
    });
