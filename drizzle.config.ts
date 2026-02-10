import type { Config } from 'drizzle-kit';

export default {
    schema: './src/db/schema/index.ts',
    out: './drizzle',
    dialect: 'mysql',
    dbCredentials: {
        host: process.env.DATABASE_HOST!,
        port: Number(process.env.DATABASE_PORT) || 3306,
        user: process.env.DATABASE_USER!,
        password: process.env.DATABASE_PASSWORD!,
        database: process.env.DATABASE_NAME!,
    },
} satisfies Config;
