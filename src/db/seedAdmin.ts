import { db } from '../config/database.js';
import * as schema from './schema/index.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
    console.log('🌱 Seeding admin user...');

    try {
        const adminEmail = 'admin@appletreats.com';
        const hashedPassword = await bcrypt.hash('TestG@300', 10);

        // Check if admin already exists
        const [existing] = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, adminEmail))
            .limit(1);

        if (existing) {
            console.log('ℹ Admin user already exists. Updating password...');
            await db
                .update(schema.users)
                .set({ password: hashedPassword })
                .where(eq(schema.users.email, adminEmail));
        } else {
            console.log('👤 Creating new admin user...');
            await db.insert(schema.users).values({
                firstName: 'Apple',
                lastName: 'Treats',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                status: 'Active',
            });
        }

        console.log(' Admin seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error(' Admin seeding failed:', error);
        process.exit(1);
    }
}

seedAdmin();
