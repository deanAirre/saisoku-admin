// services/products/admin-api.ts

import { supabase } from "../api";
import type {
  CreateProductRequest,
  UpdateProductRequest,
  CreateVariantRequest,
  UpdateVariantRequest,
  UpdateImageRequest,
  ProductWithVariantsAdmin,
} from "./type";
import type { Product, Variant, VariantImage } from "./type";

export const productAdminApi = {
  // ========== PRODUCT CRUD ==========

  // Get all products for admin (with variants and category name)
  async getAllProductsAdmin(): Promise<ProductWithVariantsAdmin[]> {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        variants (*),
        categories!category_id (
          name
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    return (data || []).map((item: any) => ({
      ...item,
      category_name: item.categories?.name || null,
    }));
  },

  // Create new product
  async createProduct(request: CreateProductRequest): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: request.name,
        category_id: request.category_id,
        description: request.description,
        description_english: request.description_english,
        display_mode: request.display_mode || "individual",
        is_featured: request.is_featured || false,
        is_active: request.is_active !== undefined ? request.is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      throw error;
    }

    return data;
  },

  // Update product
  async updateProduct(
    productId: string,
    request: UpdateProductRequest,
  ): Promise<Product> {
    const updateData: any = {};

    if (request.name !== undefined) updateData.name = request.name;
    if (request.category_id !== undefined)
      updateData.category_id = request.category_id;
    if (request.description !== undefined)
      updateData.description = request.description;
    if (request.description_english !== undefined)
      updateData.description_english = request.description_english;
    if (request.display_mode !== undefined)
      updateData.display_mode = request.display_mode;
    if (request.is_featured !== undefined)
      updateData.is_featured = request.is_featured;
    if (request.is_active !== undefined)
      updateData.is_active = request.is_active;

    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      throw error;
    }

    return data;
  },

  // Delete product (will cascade delete variants and images if FK is set up)
  async deleteProduct(productId: string): Promise<void> {
    // Check if product has variants
    const { count } = await supabase
      .from("variants")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId);

    if (count && count > 0) {
      throw new Error(
        `Cannot delete product. It has ${count} variant(s). Delete variants first.`,
      );
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  // ========== VARIANT CRUD ==========

  // Create new variant
  async createVariant(request: CreateVariantRequest): Promise<Variant> {
    const { data, error } = await supabase
      .from("variants")
      .insert({
        product_id: request.product_id,
        sku: request.sku,
        variant_name: request.variant_name,
        size: request.size,
        color: request.color,
        color_hex: request.color_hex,
        price: request.price,
        stock: request.stock,
        image_url: request.image_url,
        is_active: request.is_active !== undefined ? request.is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating variant:", error);
      throw error;
    }

    return data;
  },

  // Update variant
  async updateVariant(
    variantId: string,
    request: UpdateVariantRequest,
  ): Promise<Variant> {
    const updateData: any = {};

    if (request.sku !== undefined) updateData.sku = request.sku;
    if (request.variant_name !== undefined)
      updateData.variant_name = request.variant_name;
    if (request.size !== undefined) updateData.size = request.size;
    if (request.color !== undefined) updateData.color = request.color;
    if (request.color_hex !== undefined)
      updateData.color_hex = request.color_hex;
    if (request.price !== undefined) updateData.price = request.price;
    if (request.stock !== undefined) updateData.stock = request.stock;
    if (request.image_url !== undefined)
      updateData.image_url = request.image_url;
    if (request.is_active !== undefined)
      updateData.is_active = request.is_active;

    const { data, error } = await supabase
      .from("variants")
      .update(updateData)
      .eq("id", variantId)
      .select()
      .single();

    if (error) {
      console.error("Error updating variant:", error);
      throw error;
    }

    return data;
  },

  // Delete variant
  async deleteVariant(variantId: string): Promise<void> {
    // First delete variant images
    const { error: imageError } = await supabase
      .from("variant_images")
      .delete()
      .eq("variant_id", variantId);

    if (imageError) {
      console.error("Error deleting variant images:", imageError);
    }

    // Then delete variant
    const { error } = await supabase
      .from("variants")
      .delete()
      .eq("id", variantId);

    if (error) {
      console.error("Error deleting variant:", error);
      throw error;
    }
  },

  // ========== VARIANT IMAGES ==========

  // Upload image to Supabase Storage and create DB record
  async uploadVariantImage(
    variantId: string,
    file: File,
    displayOrder: number = 0,
    isPrimary: boolean = false,
  ): Promise<VariantImage> {
    // 1. Upload to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${variantId}/${Date.now()}.${fileExt}`;
    const filePath = `variant-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("saisokuphotos")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw uploadError;
    }

    // 2. Get public URL
    const { data: urlData, error: urlError } = await supabase.storage
      .from("saisokuphotos")
      .createSignedUrl(filePath, 315360000); // 10 years expiry

    if (urlError) {
      console.error("Error creating signed URL:", urlError);
      throw urlError;
    }

    if (isPrimary) {
      // Unset all existing primary flags first
      await supabase
        .from("variant_images")
        .update({ is_primary: false })
        .eq("variant_id", variantId);
    }

    // 3. Create DB record
    const { data, error } = await supabase
      .from("variant_images")
      .insert({
        variant_id: variantId,
        image_url: urlData.signedUrl,
        display_order: displayOrder,
        is_primary: isPrimary,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating image record:", error);
      throw error;
    }

    if (isPrimary) {
      await supabase
        .from("variants")
        .update({ image_url: urlData.signedUrl })
        .eq("id", variantId);
    }

    return data;
  },

  // Update image metadata (order, primary status)
  async updateVariantImage(
    imageId: string,
    request: UpdateImageRequest,
  ): Promise<VariantImage> {
    const updateData: any = {};

    if (request.display_order !== undefined)
      updateData.display_order = request.display_order;
    if (request.is_primary !== undefined)
      updateData.is_primary = request.is_primary;

    const { data, error } = await supabase
      .from("variant_images")
      .update(updateData)
      .eq("id", imageId)
      .select()
      .single();

    if (error) {
      console.error("Error updating image:", error);
      throw error;
    }

    return data;
  },

  // Set image as primary (unsets others)
  async setPrimaryImage(imageId: string, variantId: string): Promise<void> {
    // Unset all primary flags
    await supabase
      .from("variant_images")
      .update({ is_primary: false })
      .eq("variant_id", variantId);

    // Set this image as primary
    const { data: imageData, error } = await supabase
      .from("variant_images")
      .update({ is_primary: true })
      .eq("id", imageId)
      .select("image_url")
      .single();

    if (error) {
      console.error("Error setting primary image:", error);
      throw error;
    }

    // UPDATE: Sync to variants.image_url
    await supabase
      .from("variants")
      .update({ image_url: imageData.image_url })
      .eq("id", variantId);
  },

  // Delete variant image
  async deleteVariantImage(
    imageId: string,
    imageUrl: string,
    variantId: string,
  ): Promise<void> {
    // 1. Check if this is the primary image
    const { data: imageData } = await supabase
      .from("variant_images")
      .select("is_primary")
      .eq("id", imageId)
      .single();

    // 2. Delete from storage
    try {
      const pathMatch = imageUrl.match(/variant-images\/.+?(?=\?)/); // Extract path before ?token
      if (pathMatch) {
        await supabase.storage.from("saisokuphotos").remove([pathMatch[0]]);
      }
    } catch (error) {
      console.error("Error deleting from storage:", error);
    }

    // 3. Delete DB record
    const { error } = await supabase
      .from("variant_images")
      .delete()
      .eq("id", imageId);

    if (error) throw error;

    // 4. If was primary, update variant.image_url to next available image
    if (imageData?.is_primary) {
      const { data: remainingImages } = await supabase
        .from("variant_images")
        .select("image_url")
        .eq("variant_id", variantId)
        .order("display_order")
        .limit(1);

      await supabase
        .from("variants")
        .update({ image_url: remainingImages?.[0]?.image_url || null })
        .eq("id", variantId);
    }
  },
  // Get all images for a variant
  async getVariantImages(variantId: string): Promise<VariantImage[]> {
    const { data, error } = await supabase
      .from("variant_images")
      .select("*")
      .eq("variant_id", variantId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching variant images:", error);
      throw error;
    }

    return data || [];
  },

  async getProductStats(): Promise<{
    total_products: number;
    low_stock_count: number;
    out_of_stock_count: number;
    total_variants: number;
  }> {
    // Get all variants with product info
    const { data: variants, error } = await supabase
      .from("variants")
      .select("stock, product_id")
      .eq("is_active", true);

    if (error) throw error;

    // Get unique products count
    const uniqueProducts = new Set(variants?.map((v) => v.product_id) || []);

    // Count low stock and out of stock
    const lowStock =
      variants?.filter((v) => v.stock > 0 && v.stock < 10).length || 0;
    const outOfStock = variants?.filter((v) => v.stock === 0).length || 0;

    return {
      total_products: uniqueProducts.size,
      low_stock_count: lowStock,
      out_of_stock_count: outOfStock,
      total_variants: variants?.length || 0,
    };
  },
};

export default productAdminApi;
