import type { Request, Response } from 'express';
import { eq, desc, and } from 'drizzle-orm';
import { db } from '../config/database.js';
import * as schema from '../db/schema/index.js';
import { parseProductJSON } from '../utils/productUtils.js';

// ── Products ─────────────────────────────────────────────

export const getProducts = async (_req: Request, res: Response) => {
    try {
        const results = await db
            .select({
                product: schema.products,
                category: schema.categories,
            })
            .from(schema.products)
            .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
            .orderBy(desc(schema.products.createdAt));

        // Format the results to match the expected frontend structure
        const products = results.map((row) => ({
            ...parseProductJSON(row.product),
            category: row.category,
        }));

        res.json({ success: true, data: products });

    } catch (error: any) {
        console.error('❌ Error in getProducts:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const productData = { ...req.body };

        // Handle category mapping
        if (productData.category) {
            if (typeof productData.category === 'string') {
                const [category] = await db
                    .select()
                    .from(schema.categories)
                    .where(eq(schema.categories.name, productData.category))
                    .limit(1);
                if (category) {
                    productData.categoryId = category.id;
                }
            } else if (typeof productData.category === 'object' && productData.category.id) {
                productData.categoryId = productData.category.id;
            }
            delete productData.category;
        }

        // Remove ID and timestamps if they somehow crept in
        delete productData.id;
        delete productData.createdAt;
        delete productData.updatedAt;

        const [result] = await db.insert(schema.products).values({
            ...productData,
            images: JSON.stringify(productData.images || []),
            colors: JSON.stringify(productData.colors || []),
            storageOptions: JSON.stringify(productData.storageOptions || []),
            memoryOptions: JSON.stringify(productData.memoryOptions || []),
            grades: JSON.stringify(productData.grades || []),
            specs: JSON.stringify(productData.specs || []),
        });

        res.status(201).json({ success: true, data: { id: result.insertId } });
    } catch (error: any) {
        console.error('❌ Error in createProduct:', error);
        res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const productData = { ...req.body };

        // Handle category mapping
        if (productData.category) {
            if (typeof productData.category === 'string') {
                const [category] = await db
                    .select()
                    .from(schema.categories)
                    .where(eq(schema.categories.name, productData.category))
                    .limit(1);
                if (category) {
                    productData.categoryId = category.id;
                }
            } else if (typeof productData.category === 'object' && productData.category.id) {
                productData.categoryId = productData.category.id;
            }
            delete productData.category;
        }

        // Remove non-updatable or problematic fields
        delete productData.id;
        delete productData.createdAt;
        delete productData.updatedAt;

        const [result] = await db
            .update(schema.products)
            .set({
                ...productData,
                images: productData.images ? JSON.stringify(productData.images) : undefined,
                colors: productData.colors ? JSON.stringify(productData.colors) : undefined,
                storageOptions: productData.storageOptions ? JSON.stringify(productData.storageOptions) : undefined,
                memoryOptions: productData.memoryOptions ? JSON.stringify(productData.memoryOptions) : undefined,
                grades: productData.grades ? JSON.stringify(productData.grades) : undefined,
                specs: productData.specs ? JSON.stringify(productData.specs) : undefined,
            })
            .where(eq(schema.products.id, id));

        console.log(`✅ Updated product ID: ${id}, rows affected: ${result.affectedRows}`);
        res.json({ success: true, message: 'Product updated successfully' });
    } catch (error: any) {
        console.error('❌ Error in updateProduct:', error);
        res.status(500).json({ success: false, message: 'Failed to update product', error: error.message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        await db.delete(schema.products).where(eq(schema.products.id, id));

        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error: any) {
        console.error('❌ Error in deleteProduct:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product', error: error.message });
    }
};

// ── Categories ───────────────────────────────────────────

export const getCategories = async (_req: Request, res: Response) => {
    try {
        const categories = await db.query.categories.findMany({
            orderBy: [desc(schema.categories.sortOrder)],
        });

        res.json({ success: true, data: categories });
    } catch (error: any) {
        console.error('❌ Error in getCategories:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const categoryData = req.body;
        const [result] = await db.insert(schema.categories).values(categoryData);

        res.status(201).json({ success: true, data: { id: result.insertId } });
    } catch (error: any) {
        console.error('❌ Error in createCategory:', error);
        res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const categoryData = req.body;

        await db
            .update(schema.categories)
            .set(categoryData)
            .where(eq(schema.categories.id, id));

        res.json({ success: true, message: 'Category updated successfully' });
    } catch (error: any) {
        console.error('❌ Error in updateCategory:', error);
        res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        // Check if there are products in this category
        const [product] = await db
            .select()
            .from(schema.products)
            .where(eq(schema.products.categoryId, id))
            .limit(1);

        if (product) {
            res.status(400).json({ success: false, message: 'Cannot delete category with products' });
            return;
        }

        await db.delete(schema.categories).where(eq(schema.categories.id, id));

        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error: any) {
        console.error('❌ Error in deleteCategory:', error);
        res.status(500).json({ success: false, message: 'Failed to delete category', error: error.message });
    }
};

// ── Hero Slides ──────────────────────────────────────────

export const getHeroSlides = async (_req: Request, res: Response) => {
    try {
        const slides = await db.select().from(schema.heroSlides).orderBy(schema.heroSlides.sortOrder);
        res.json({ success: true, data: slides });
    } catch (error: any) {
        console.error('❌ Error in getHeroSlides:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch hero slides' });
    }
};

export const createHeroSlide = async (req: Request, res: Response) => {
    try {
        const slideData = { ...req.body };
        delete slideData.id;
        const [result] = await db.insert(schema.heroSlides).values(slideData);
        console.log(`✅ Created hero slide with ID: ${result.insertId}`);
        res.status(201).json({ success: true, data: { id: result.insertId } });
    } catch (error: any) {
        console.error('❌ Error in createHeroSlide:', error);
        res.status(500).json({ success: false, message: 'Failed to create hero slide' });
    }
};

export const updateHeroSlide = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const slideData = { ...req.body };
        delete slideData.id;

        await db.update(schema.heroSlides).set(slideData).where(eq(schema.heroSlides.id, id));
        console.log(`✅ Updated hero slide ID: ${id}`);
        res.json({ success: true, message: 'Hero slide updated successfully' });
    } catch (error: any) {
        console.error('❌ Error in updateHeroSlide:', error);
        res.status(500).json({ success: false, message: 'Failed to update hero slide' });
    }
};

export const deleteHeroSlide = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await db.delete(schema.heroSlides).where(eq(schema.heroSlides.id, id));
        res.json({ success: true, message: 'Hero slide deleted successfully' });
    } catch (error: any) {
        console.error('❌ Error in deleteHeroSlide:', error);
        res.status(500).json({ success: false, message: 'Failed to delete hero slide' });
    }
};

// ── Promo Banners ────────────────────────────────────────

export const getPromoBanners = async (_req: Request, res: Response) => {
    try {
        const banners = await db.select().from(schema.promoBanners).orderBy(schema.promoBanners.sortOrder);
        res.json({ success: true, data: banners });
    } catch (error: any) {
        console.error('❌ Error in getPromoBanners:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch promo banners' });
    }
};

export const createPromoBanner = async (req: Request, res: Response) => {
    try {
        const bannerData = { ...req.body };
        delete bannerData.id;
        const [result] = await db.insert(schema.promoBanners).values(bannerData);
        console.log(`✅ Created promo banner with ID: ${result.insertId}`);
        res.status(201).json({ success: true, data: { id: result.insertId } });
    } catch (error: any) {
        console.error('❌ Error in createPromoBanner:', error);
        res.status(500).json({ success: false, message: 'Failed to create promo banner' });
    }
};

export const updatePromoBanner = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const bannerData = { ...req.body };
        delete bannerData.id;

        await db.update(schema.promoBanners).set(bannerData).where(eq(schema.promoBanners.id, id));
        console.log(`✅ Updated promo banner ID: ${id}`);
        res.json({ success: true, message: 'Promo banner updated successfully' });
    } catch (error: any) {
        console.error('❌ Error in updatePromoBanner:', error);
        res.status(500).json({ success: false, message: 'Failed to update promo banner' });
    }
};

export const deletePromoBanner = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await db.delete(schema.promoBanners).where(eq(schema.promoBanners.id, id));
        res.json({ success: true, message: 'Promo banner deleted successfully' });
    } catch (error: any) {
        console.error('❌ Error in deletePromoBanner:', error);
        res.status(500).json({ success: false, message: 'Failed to delete promo banner' });
    }
};
