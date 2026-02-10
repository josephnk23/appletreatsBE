import { Request, Response } from 'express';
import { db } from '../config/database.js';
import * as schema from '../db/schema/index.js';
import { eq, desc, sql, inArray } from 'drizzle-orm';
import { parseProductJSON } from '../utils/productUtils.js';

export const getLandingPageData = async (_req: Request, res: Response) => {
    try {
        const [heroSlides, products, promoBanners] = await Promise.all([
            // Active Hero Slides
            db.select().from(schema.heroSlides)
                .where(eq(schema.heroSlides.isActive, true))
                .orderBy(schema.heroSlides.sortOrder),

            // All Active Products with Category names
            db.select({
                id: schema.products.id,
                name: schema.products.name,
                price: schema.products.price,
                originalPrice: schema.products.originalPrice,
                image: schema.products.image,
                category: schema.categories.name,
                condition: schema.products.condition,
                isNew: schema.products.isNew,
                isBestSeller: schema.products.isBestSeller,
                isFeatured: schema.products.isFeatured,
                colors: schema.products.colors,
                storageOptions: schema.products.storageOptions,
                grades: schema.products.grades,
                memoryOptions: schema.products.memoryOptions,
                specs: schema.products.specs,
                description: schema.products.description,
                isActive: schema.products.isActive,
                stock: schema.products.stock,
            })
                .from(schema.products)
                .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
                .where(eq(schema.products.isActive, true)),

            // Active Promo Banners
            db.select().from(schema.promoBanners)
                .where(eq(schema.promoBanners.isActive, true))
                .orderBy(schema.promoBanners.sortOrder),
        ]);

        // Convert strings to numbers for price fields (decimal returns string)
        const typedProducts = products.map(p => {
            const parsed = parseProductJSON(p);
            return {
                ...parsed,
                price: Number(p.price),
                originalPrice: Number(p.originalPrice),
            };
        });

        // Process products into categories similar to front-end Home logic
        const featuredProducts = typedProducts.filter(p => p.isFeatured).slice(0, 4);
        const bestSellers = typedProducts.filter(p => p.isBestSeller).slice(0, 4);
        const latestProducts = typedProducts.filter(p => p.isNew).slice(0, 4);

        res.json({
            heroSlides,
            featuredProducts,
            bestSellers,
            latestProducts,
            promoBanners,
        });
    } catch (error) {
        console.error('Error fetching landing page data:', error);
        res.status(500).json({ message: 'Error fetching landing page data' });
    }
};

export const getCategories = async (_req: Request, res: Response) => {
    try {
        const categories = await db.select().from(schema.categories).orderBy(schema.categories.sortOrder);
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { category, q, condition, minPrice, maxPrice, sort } = req.query;

        let query = db.select({
            id: schema.products.id,
            name: schema.products.name,
            price: schema.products.price,
            originalPrice: schema.products.originalPrice,
            image: schema.products.image,
            category: schema.categories.name,
            categorySlug: schema.categories.slug,
            condition: schema.products.condition,
            isNew: schema.products.isNew,
            isBestSeller: schema.products.isBestSeller,
            isActive: schema.products.isActive,
            stock: schema.products.stock,
            description: schema.products.description,
        })
            .from(schema.products)
            .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
            .where(eq(schema.products.isActive, true))
            .$dynamic();

        const filters: any[] = [];

        if (category && category !== 'all') {
            filters.push(eq(schema.categories.slug, category as string));
        }

        if (q) {
            const searchTerm = `%${q}%`;
            filters.push(sql`(${schema.products.name} LIKE ${searchTerm} OR ${schema.products.description} LIKE ${searchTerm})`);
        }

        if (condition) {
            const conditions = (condition as string).split(',');
            filters.push(inArray(schema.products.condition, conditions as any));
        }

        if (minPrice) {
            filters.push(sql`${schema.products.price} >= ${minPrice}`);
        }

        if (maxPrice) {
            filters.push(sql`${schema.products.price} <= ${maxPrice}`);
        }

        if (filters.length > 0) {
            query = query.where(sql`${sql.join(filters, sql` AND `)}`);
        }

        // Sorting
        if (sort === 'price-low') {
            query = query.orderBy(schema.products.price);
        } else if (sort === 'price-high') {
            query = query.orderBy(desc(schema.products.price));
        } else if (sort === 'a-z') {
            query = query.orderBy(schema.products.name);
        } else {
            query = query.orderBy(desc(schema.products.createdAt));
        }

        const products = await query;

        // Convert decimal strings to numbers
        const typedProducts = products.map(p => {
            const parsed = parseProductJSON(p);
            return {
                ...parsed,
                price: Number(p.price),
                originalPrice: Number(p.originalPrice),
            };
        });

        res.json(typedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await db.select({
            id: schema.products.id,
            name: schema.products.name,
            price: schema.products.price,
            originalPrice: schema.products.originalPrice,
            image: schema.products.image,
            category: schema.categories.name,
            condition: schema.products.condition,
            isNew: schema.products.isNew,
            isBestSeller: schema.products.isBestSeller,
            colors: schema.products.colors,
            storageOptions: schema.products.storageOptions,
            grades: schema.products.grades,
            memoryOptions: schema.products.memoryOptions,
            specs: schema.products.specs,
            description: schema.products.description,
            stock: schema.products.stock,
        })
            .from(schema.products)
            .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
            .where(eq(schema.products.id, id as string))
            .limit(1);

        if (result.length === 0) {
            return void res.status(404).json({ message: 'Product not found' });
        }

        const product = {
            ...parseProductJSON(result[0]),
            price: Number(result[0].price),
            originalPrice: Number(result[0].originalPrice),
        };

        res.json(product);
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: 'Error fetching product' });
    }
};
