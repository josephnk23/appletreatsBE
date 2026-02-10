import { db } from '../config/database.js';
import * as schema from './schema/index.js';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
    console.log('🌱 Seeding database...');

    try {
        // ── Clear existing data ───────────────────────────────────────────
        console.log('🧹 Clearing existing data...');
        await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0;`);
        await db.execute(sql`TRUNCATE TABLE promo_banners;`);
        await db.execute(sql`TRUNCATE TABLE hero_slides;`);
        await db.execute(sql`TRUNCATE TABLE order_items;`);
        await db.execute(sql`TRUNCATE TABLE orders;`);
        await db.execute(sql`TRUNCATE TABLE products;`);
        await db.execute(sql`TRUNCATE TABLE categories;`);
        await db.execute(sql`TRUNCATE TABLE addresses;`);
        await db.execute(sql`TRUNCATE TABLE users;`);
        await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1;`);

        // ── Seed Categories ───────────────────────────────────────────────
        console.log('📁 Seeding categories...');
        const categories = [
            { name: 'Mac', slug: 'mac', image: 'https://cdn11.bigcommerce.com/s-xt5en0q8kf/images/stencil/500x659/products/11511/27405/MBP-16-L19-SPACE_GRAY__42017.1659635778.jpg?c=2', href: '/category/mac' },
            { name: 'iPhone', slug: 'iphone', image: 'https://res.cloudinary.com/dc6svbdh9/image/upload/v1744188809/products/agkmo8qveetfbkt36m9v.png', href: '/category/iphone' },
            { name: 'iPad', slug: 'ipad', image: 'https://res.cloudinary.com/dc6svbdh9/image/upload/v1744194678/products/ulprc1ztllvgexgucrlo.png', href: '/category/ipad' },
            { name: 'Watch', slug: 'watch', image: 'https://cdn11.bigcommerce.com/s-xt5en0q8kf/images/stencil/500x659/products/11890/27949/AW-S8-ALUM-MIDNIGHT__08334.1669061684.jpg?c=2', href: '/category/watch' },
            { name: 'Accessories', slug: 'accessories', image: 'https://res.cloudinary.com/dc6svbdh9/image/upload/v1744188809/products/agkmo8qveetfbkt36m9v.png', href: '/category/accessories' },
        ];

        for (const cat of categories) {
            await db.insert(schema.categories).values(cat);
        }

        const insertedCategories = await db.select().from(schema.categories);
        const categoryMap = Object.fromEntries(insertedCategories.map(c => [c.name, c.id]));

        // ── Seed Products ────────────────────────────────────────────────
        console.log('📦 Seeding products...');
        const products = [
            {
                id: '1',
                name: 'iPhone 15 Pro Max',
                price: '1199',
                originalPrice: '1399',
                image: 'https://cdn11.bigcommerce.com/s-xt5en0q8kf/images/stencil/500x659/products/12966/31173/iphone16pm__81339.1735920582.jpg?c=2',
                categoryId: categoryMap['iPhone'],
                condition: 'New' as const,
                isNew: true,
                isBestSeller: true,
                isFeatured: true,
                isActive: true,
                stock: 50,
                colors: [
                    { name: 'Natural Titanium', value: '#bdbbb7' },
                    { name: 'Blue Titanium', value: '#3c4651' },
                    { name: 'White Titanium', value: '#f2f1ed' },
                    { name: 'Black Titanium', value: '#434344' },
                ],
                storageOptions: [
                    { size: '256GB', priceBump: 0 },
                    { size: '512GB', priceBump: 200 },
                    { size: '1TB', priceBump: 400 },
                ],
                specs: [
                    { label: 'Display', value: '6.7-inch Super Retina XDR' },
                    { label: 'Chip', value: 'A17 Pro chip' },
                    { label: 'Camera', value: '48MP Main | Ultra Wide | Telephoto' },
                    { label: 'Battery', value: 'Up to 29 hours video playback' },
                ],
                description: 'The iPhone 15 Pro Max features a strong and light aerospace-grade titanium design with a textured matte-glass back. It also features a Ceramic Shield front that’s tougher than any smartphone glass.',
            },
            {
                id: '2',
                name: 'MacBook Air M2',
                price: '999',
                originalPrice: '1199',
                image: 'https://cdn11.bigcommerce.com/s-xt5en0q8kf/images/stencil/1280x1280/products/11509/26553/mbp-16__97050.1655733399.jpg?c=2',
                categoryId: categoryMap['Mac'],
                condition: 'Refurbished' as const,
                isNew: false,
                isBestSeller: true,
                isFeatured: true,
                isActive: true,
                stock: 50,
                grades: [
                    { name: 'Excellent', priceBump: 50 },
                    { name: 'Very Good', priceBump: 20 },
                    { name: 'Good', priceBump: 0 },
                ],
                storageOptions: [
                    { size: '256GB', priceBump: 0 },
                    { size: '512GB', priceBump: 150 },
                ],
                memoryOptions: [
                    { size: '8GB', priceBump: 0 },
                    { size: '16GB', priceBump: 200 },
                    { size: '24GB', priceBump: 400 },
                ],
                colors: [
                    { name: 'Midnight', value: '#2e3641' },
                    { name: 'Starlight', value: '#f0e4d3' },
                    { name: 'Space Gray', value: '#5d5d5d' },
                    { name: 'Silver', value: '#e3e4e5' },
                ],
                specs: [
                    { label: 'Chip', value: 'Apple M2 chip' },
                    { label: 'Memory', value: '8GB or 16GB' },
                    { label: 'Display', value: '13.6-inch Liquid Retina' },
                    { label: 'Battery', value: 'Up to 18 hours' },
                ],
                description: 'The redesigned MacBook Air is more portable than ever and comes in four gorgeous finishes. Its amazingly capable laptop that lets you work, play or create just about anything — anywhere.',
            },
            {
                id: '3',
                name: 'iPad Pro',
                price: '799',
                originalPrice: '1099',
                image: 'https://cdn11.bigcommerce.com/s-xt5en0q8kf/images/stencil/500x659/products/11376/27306/IPAD9-SG__55806.1659552757.jpg?c=2',
                categoryId: categoryMap['iPad'],
                condition: 'Refurbished' as const,
                isNew: false,
                isBestSeller: false,
                isFeatured: true,
                isActive: true,
                stock: 50,
                grades: [
                    { name: 'Excellent', priceBump: 40 },
                    { name: 'Very Good', priceBump: 15 },
                ],
                storageOptions: [
                    { size: '128GB', priceBump: 0 },
                    { size: '256GB', priceBump: 100 },
                ],
                specs: [
                    { label: 'Chip', value: 'Apple M2 chip' },
                    { label: 'Display', value: '11-inch Liquid Retina' },
                    { label: 'Connectivity', value: 'Wi-Fi 6E and 5G' },
                ],
                colors: [
                    { name: 'Space Gray', value: '#5d5d5d' },
                    { name: 'Silver', value: '#e3e4e5' },
                ],
            },
            {
                id: '4',
                name: 'Apple Watch Ultra 2',
                price: '749',
                originalPrice: '799',
                image: 'https://cdn11.bigcommerce.com/s-xt5en0q8kf/images/stencil/500x659/products/11890/27949/AW-S8-ALUM-MIDNIGHT__08334.1669061684.jpg?c=2',
                categoryId: categoryMap['Watch'],
                condition: 'New' as const,
                isNew: true,
                isBestSeller: true,
                isFeatured: true,
                isActive: true,
                stock: 50,
                specs: [
                    { label: 'Case', value: '49mm Titanium' },
                    { label: 'Display', value: 'Always-On Retina' },
                    { label: 'Water Resistance', value: '100m' },
                ],
            },
            {
                id: '5',
                name: 'AirPods Max',
                price: '449',
                originalPrice: '549',
                image: 'https://res.cloudinary.com/dc6svbdh9/image/upload/v1744188809/products/agkmo8qveetfbkt36m9v.png',
                categoryId: categoryMap['Accessories'],
                condition: 'Refurbished' as const,
                isNew: false,
                isBestSeller: true,
                isFeatured: false,
                isActive: true,
                stock: 50,
                colors: [
                    { name: 'Space Gray', value: '#5d5d5d' },
                    { name: 'Silver', value: '#e3e4e5' },
                    { name: 'Sky Blue', value: '#cfdce5' },
                    { name: 'Green', value: '#d1d9cf' },
                    { name: 'Pink', value: '#e9d6d3' },
                ],
            },
            {
                id: '6',
                name: 'MacBook Pro 16" M3',
                price: '2499',
                originalPrice: '2699',
                image: 'https://cdn11.bigcommerce.com/s-xt5en0q8kf/images/stencil/500x659/products/11511/27405/MBP-16-L19-SPACE_GRAY__42017.1659635778.jpg?c=2',
                categoryId: categoryMap['Mac'],
                condition: 'New' as const,
                isNew: true,
                isBestSeller: false,
                isFeatured: false,
                isActive: true,
                stock: 50,
                memoryOptions: [
                    { size: '16GB', priceBump: 0 },
                    { size: '32GB', priceBump: 400 },
                    { size: '64GB', priceBump: 800 },
                ],
                colors: [
                    { name: 'Space Black', value: '#1d1d1f' },
                    { name: 'Silver', value: '#e3e4e5' },
                ],
            },
        ];

        for (const prod of products) {
            await db.insert(schema.products).values(prod);
        }

        // ── Seed Users ──────────────────────────────────────────────────
        console.log('👤 Seeding users...');
        const hashedPassword = await bcrypt.hash('TestG@300', 10);

        const mockUsers = [
            {
                id: 'usr_1',
                firstName: 'Joseph',
                lastName: 'Nkrumah',
                email: 'joseph@example.com',
                password: hashedPassword,
                phoneNumber: '+233 24 123 4567',
                role: 'admin' as const,
                status: 'Active' as const,
            },
            {
                id: 'usr_2',
                firstName: 'Sarah',
                lastName: 'Mensah',
                email: 'sarah.m@example.com',
                password: hashedPassword,
                phoneNumber: '+233 50 987 6543',
                role: 'customer' as const,
                status: 'Active' as const,
            }
        ];

        for (const user of mockUsers) {
            await db.insert(schema.users).values(user);
        }

        // ── Seed Addresses ──────────────────────────────────────────────
        console.log('🏠 Seeding addresses...');
        const mockAddresses = [
            {
                userId: 'usr_1',
                address: '123 Apple Street, East Legon',
                city: 'Accra',
                region: 'Greater Accra',
                zipCode: '00233',
                country: 'Ghana',
                isDefault: true,
            },
            {
                userId: 'usr_2',
                address: '45 Independence Ave',
                city: 'Kumasi',
                region: 'Ashanti',
                zipCode: '00233',
                country: 'Ghana',
                isDefault: true,
            }
        ];

        for (const addr of mockAddresses) {
            await db.insert(schema.addresses).values(addr);
        }

        // ── Seed CMS content ──────────────────────────────────────────────
        console.log('✨ Seeding CMS content...');

        const heroSlides = [
            {
                content: '<h2>Titanium Power.</h2><p>iPhone 15 Pro. Lighter. Stronger.</p>',
                image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1920&q=80',
                cta: 'Shop iPhone',
                href: '/category/iphone',
                sortOrder: 1,
                isActive: true,
            },
            {
                content: '<h2>Mind-blowing. Head-turning.</h2><p>MacBook Pro with M3 chips.</p>',
                image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1920&q=80',
                cta: 'Shop Mac',
                href: '/category/mac',
                sortOrder: 2,
                isActive: true,
            }
        ];

        for (const slide of heroSlides) {
            await db.insert(schema.heroSlides).values(slide);
        }

        const promoBanners = [
            {
                content: '<span class="label">New Arrival</span><h3>iPhone 15 Pro.<br/>Titanium.</h3><p>The most powerful iPhone ever created. Now in Titanium.</p>',
                ctaText: 'Buy Now',
                ctaLink: '/category/iphone',
                bgColor: '#f5f5f7',
                image: 'https://cdn11.bigcommerce.com/s-xt5en0q8kf/images/stencil/500x659/products/12966/31173/iphone16pm__81339.1735920582.jpg?c=2',
                sortOrder: 1,
                isActive: true,
            },
            {
                content: '<span class="label">Apple Watch Series 9</span><h3>Smarter. Brighter.<br/>Mightier.</h3><p>Starting from ₵2,999</p>',
                ctaText: 'Explore Now',
                ctaLink: '/category/watch',
                bgColor: '#f5f5f7',
                image: 'https://cdn11.bigcommerce.com/s-xt5en0q8kf/images/stencil/500x659/products/11890/27949/AW-S8-ALUM-MIDNIGHT__08334.1669061684.jpg?c=2',
                sortOrder: 2,
                isActive: true,
            },
            {
                content: '<span class="label">Apple Watch Ultra</span><h3>Up to 40% off</h3><p>The aerospace-grade titanium case strikes the perfect balance of everything.</p>',
                ctaText: 'Grab the deal',
                ctaLink: '/category/watch',
                bgColor: '#f5f5f7',
                image: 'https://res.cloudinary.com/dc6svbdh9/image/upload/v1744194350/products/rzyqchhbvjpgjbky1phw.png',
                sortOrder: 3,
                isActive: true,
            }
        ];

        for (const banner of promoBanners) {
            await db.insert(schema.promoBanners).values(banner);
        }

        console.log('✅ Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
