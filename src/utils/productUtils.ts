export const parseProductJSON = (product: any) => {
    if (!product) return null;

    const safeParse = (val: any) => {
        if (typeof val === 'string') {
            try {
                return JSON.parse(val);
            } catch (e) {
                return [];
            }
        }
        return val || [];
    };

    return {
        ...product,
        colors: safeParse(product.colors),
        storageOptions: safeParse(product.storageOptions),
        memoryOptions: safeParse(product.memoryOptions),
        grades: safeParse(product.grades),
        specs: safeParse(product.specs),
        images: safeParse(product.images),
    };
};
