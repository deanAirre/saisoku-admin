import { supabase } from "../api";
import type {
  ProductFilters,
  ProductGroup,
  ProductWithVariants,
  Variant,
  VariantImage,
  VariantWithProduct,
  VariantWithProductExtended,
} from "./type";

const CATEGORY_DISPLAY_RULES: Record<string, "grouped" | "individual"> = {
  Tas: "grouped",
  Boneka: "individual",
  Gelang: "grouped",
  Gantungan: "individual",
  // Add more categories as needed
};

export const productApi = {
  // Get all products with their variants
  async getAllProducts(
    filters?: ProductFilters,
  ): Promise<ProductWithVariants[]> {
    let query = supabase
      .from("products")
      .select(
        `
        *,
        variants (*)
      `,
      )
      .eq("is_active", true);

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    return data || [];
  },

  // Get single product by ID with all its variants
  async getProductById(id: string): Promise<ProductWithVariants | null> {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
      *,
      variants (
        *,
        images:variant_images(*)
      )
    `,
      )
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      throw error;
    }

    // Sort images for each variant
    if (data && data.variants) {
      data.variants.forEach((variant: Variant) => {
        if (variant.images && Array.isArray(variant.images)) {
          (variant.images as VariantImage[]).sort(
            (a: VariantImage, b: VariantImage) =>
              a.display_order - b.display_order,
          );
        }
      });
    }

    return data;
  },

  // Get product by variant ID (for detail pages)
  // Get product by variant ID (for detail pages)
  async getProductByVariantId(
    variantId: string,
  ): Promise<ProductWithVariants | null> {
    // First get the variant to find product_id
    const { data: variant, error: variantError } = await supabase
      .from("variants")
      .select("product_id")
      .eq("id", variantId)
      .single();

    if (variantError || !variant) {
      console.error("Error fetching variant:", variantError);
      throw variantError;
    }

    // Then get the full product with all variants AND their images
    const { data, error } = await supabase
      .from("products")
      .select(
        `
      *,
      variants (
        *,
        images:variant_images(*)
      )
    `,
      )
      .eq("id", variant.product_id)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      throw error;
    }

    // Sort images for each variant
    if (data && data.variants) {
      data.variants.forEach((v: any) => {
        if (v.images && Array.isArray(v.images)) {
          v.images.sort((a: any, b: any) => a.display_order - b.display_order);
        }
      });
    }

    return data;
  },

  // Get product by SKU
  async getProductBySku(sku: string): Promise<ProductWithVariants | null> {
    const { data, error } = await supabase
      .from("variants")
      .select(
        `
        *,
        products (
          *,
          variants (*)
        )
      `,
      )
      .eq("sku", sku)
      .single();

    if (error) {
      console.error("Error fetching product by SKU:", error);
      throw error;
    }

    return data?.products || null;
  },

  // Get products by category
  async getProductsByCategory(
    category: string,
  ): Promise<ProductWithVariants[]> {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        variants (*)
      `,
      )
      .eq("category", category)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }

    return data || [];
  },

  // Get all variants for a product
  async getVariantsByProductId(productId: string): Promise<Variant[]> {
    const { data, error } = await supabase
      .from("variants")
      .select("*")
      .eq("product_id", productId)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching variants:", error);
      throw error;
    }

    return data || [];
  },

  // Update variant stock
  async updateVariantStock(
    variantId: string,
    quantity: number,
  ): Promise<Variant | null> {
    const { data, error } = await supabase
      .from("variants")
      .update({ stock: quantity })
      .eq("id", variantId)
      .select()
      .single();

    if (error) {
      console.error("Error updating stock:", error);
      throw error;
    }

    return data;
  },

  // Decrease variant stock (for purchases)
  async decreaseVariantStock(
    variantId: string,
    quantity: number,
  ): Promise<Variant | null> {
    const { data: variant, error: fetchError } = await supabase
      .from("variants")
      .select("stock")
      .eq("id", variantId)
      .single();

    if (fetchError) {
      console.error("Error fetching variant stock:", fetchError);
      throw fetchError;
    }

    const newStock = Math.max(0, variant.stock - quantity);

    const { data, error } = await supabase
      .from("variants")
      .update({ stock: newStock })
      .eq("id", variantId)
      .select()
      .single();

    if (error) {
      console.error("Error decreasing stock:", error);
      throw error;
    }

    return data;
  },

  // Get all categories
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from("products")
      .select("category")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }

    const categories = [
      ...new Set(data?.map((p) => p.category).filter(Boolean)),
    ];
    return categories as string[];
  },

  // Search products
  async searchProducts(searchTerm: string): Promise<ProductWithVariants[]> {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        variants (*)
      `,
      )
      .ilike("name", `%${searchTerm}%`)
      .eq("is_active", true);

    if (error) {
      console.error("Error searching products:", error);
      throw error;
    }

    return data || [];
  },

  // Get paginated variants (for product listing pages)
  async getVariantsPaginated(options: {
    page: number;
    size: number;
    category?: string;
    sortBy?: "name" | "price-low" | "price-high" | "newest";
    search?: string;
    featured?: boolean;
  }): Promise<{ data: VariantWithProduct[]; total: number }> {
    const { page, size, category, sortBy, search, featured } = options;

    let query = supabase
      .from("variants")
      .select(
        `
        *,
        products!inner (*),
        images:variant_images(*)
      `,
        { count: "exact" },
      )
      .eq("is_active", true)
      .eq("products.is_active", true);

    if (category && category !== "all") {
      query = query.eq("products.category", category);
    }

    if (search) {
      query = query.ilike("variant_name", `%${search}%`);
    }

    if (featured) {
      query = query.eq("products.is_featured", true);
    }

    switch (sortBy) {
      case "price-low":
        query = query.order("price", { ascending: true });
        break;
      case "price-high":
        query = query.order("price", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "name":
      default:
        query = query.order("variant_name", { ascending: true });
        break;
    }

    const from = page * size;
    const to = from + size - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching variants:", error);
      throw error;
    }

    // Sort images for each variant
    const transformedData = (data || []).map((item: any) => {
      if (item.images && Array.isArray(item.images)) {
        (item.images as VariantImage[]).sort(
          (a: VariantImage, b: VariantImage) =>
            a.display_order - b.display_order,
        );
      }
      return {
        ...item,
        products: Array.isArray(item.products)
          ? item.products[0]
          : item.products,
      };
    }) as VariantWithProduct[];

    return {
      data: transformedData,
      total: count || 0,
    };
  },
  async getProductsGroupedPaginated(options: {
    page: number;
    size: number;
    category?: string;
    sortBy?: "name" | "price-low" | "price-high" | "newest";
    search?: string;
    featured?: boolean;
  }): Promise<{
    data: (VariantWithProductExtended | ProductGroup)[];
    total: number;
    displayMode: "mixed" | "grouped" | "individual";
  }> {
    const { page, size, category, sortBy } = options;

    // Get all variants first
    const { data: allVariants } = await this.getVariantsPaginated({
      ...options,
      page: 0,
      size: 1000,
    });

    // Determine if we're in mixed mode (all categories) or single category
    const isMixedMode = !category || category === "all";
    const singleCategoryMode =
      category && category !== "all"
        ? CATEGORY_DISPLAY_RULES[category] || "individual"
        : null;

    // If single category with individual mode, return as-is
    if (singleCategoryMode === "individual") {
      const from = page * size;
      const to = from + size;
      const paginatedVariants = allVariants.slice(from, to).map((v) => ({
        ...v,
        isGrouped: false as const,
      }));

      return {
        data: paginatedVariants,
        total: allVariants.length,
        displayMode: "individual",
      };
    }

    // Process grouping (either mixed mode or single grouped category)
    const mixedItems: (VariantWithProductExtended | ProductGroup)[] = [];
    const processedProductIds = new Set<string>();

    allVariants.forEach((variant) => {
      const productId = variant.product_id;

      // Skip if we already processed this product
      if (processedProductIds.has(productId)) {
        return;
      }

      const productData = Array.isArray(variant.products)
        ? variant.products[0]
        : variant.products;

      // Check display_mode from database first, fallback to category rules
      const shouldGroup = productData?.display_mode
        ? productData.display_mode === "grouped"
        : CATEGORY_DISPLAY_RULES[productData?.category || ""] === "grouped";

      if (shouldGroup) {
        // Group all variants of this product
        const productVariants = allVariants.filter(
          (v) => v.product_id === productId,
        );
        const prices = productVariants.map((v) => v.price);

        mixedItems.push({
          product: productData,
          variants: productVariants,
          primaryVariant: productVariants[0],
          priceRange: {
            min: Math.min(...prices),
            max: Math.max(...prices),
          },
          isGrouped: true as const,
        });

        processedProductIds.add(productId);
      } else {
        // Add individual variant
        mixedItems.push({
          ...variant,
          isGrouped: false as const,
        });

        processedProductIds.add(productId);
      }
    });

    // Sort mixed items
    mixedItems.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      if (sortBy === "price-low" || sortBy === "price-high") {
        aValue = a.isGrouped ? a.priceRange.min : a.price;
        bValue = b.isGrouped ? b.priceRange.min : b.price;
        return sortBy === "price-low" ? aValue - bValue : bValue - aValue;
      } else if (sortBy === "newest") {
        aValue = a.isGrouped ? a.primaryVariant.created_at : a.created_at;
        bValue = b.isGrouped ? b.primaryVariant.created_at : b.created_at;
        return new Date(bValue).getTime() - new Date(aValue).getTime();
      } else {
        // name
        aValue = a.isGrouped ? a.product.name : a.variant_name;
        bValue = b.isGrouped ? b.product.name : b.variant_name;
        return aValue.localeCompare(bValue);
      }
    });

    // Paginate
    const from = page * size;
    const to = from + size;
    const paginatedItems = mixedItems.slice(from, to);

    return {
      data: paginatedItems,
      total: mixedItems.length,
      displayMode: isMixedMode
        ? "mixed"
        : singleCategoryMode === "grouped"
          ? "grouped"
          : "individual",
    };
  },
};

export default productApi;
