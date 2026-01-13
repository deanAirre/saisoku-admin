// services/categories/api.ts

import { supabase } from "../api";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryWithCount,
} from "./type";

export const categoryApi = {
  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }

    return data || [];
  },

  // Get all categories with product count
  async getCategoriesWithCount(): Promise<CategoryWithCount[]> {
    const { data, error } = await supabase
      .from("categories")
      .select(
        `
        *,
        products!category_id(count)
      `,
      )
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories with count:", error);
      throw error;
    }

    // Transform the data to include product_count
    const transformed = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      default_display_mode: item.default_display_mode,
      created_at: item.created_at,
      updated_at: item.updated_at,
      product_count: item.products?.[0]?.count || 0,
    }));

    return transformed;
  },

  // Get single category by ID
  async getCategoryById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching category:", error);
      throw error;
    }

    return data;
  },

  // Create new category
  async createCategory(request: CreateCategoryRequest): Promise<Category> {
    // Check if category name already exists
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .ilike("name", request.name)
      .single();

    if (existing) {
      throw new Error(`Category "${request.name}" already exists`);
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: request.name.trim(),
        default_display_mode: request.default_display_mode,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      throw error;
    }

    return data;
  },

  // Update category
  async updateCategory(
    id: string,
    request: UpdateCategoryRequest,
  ): Promise<Category> {
    // If updating name, check for duplicates
    if (request.name) {
      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .ilike("name", request.name)
        .neq("id", id)
        .single();

      if (existing) {
        throw new Error(`Category "${request.name}" already exists`);
      }
    }

    const updateData: any = {};
    if (request.name !== undefined) {
      updateData.name = request.name.trim();
    }
    if (request.default_display_mode !== undefined) {
      updateData.default_display_mode = request.default_display_mode;
    }

    const { data, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating category:", error);
      throw error;
    }

    return data;
  },

  // Delete category (only if no products)
  async deleteCategory(id: string): Promise<void> {
    // Check if category has products
    const { count, error: countError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    if (countError) {
      console.error("Error checking category usage:", countError);
      throw countError;
    }

    if (count && count > 0) {
      throw new Error(
        `Cannot delete category. It has ${count} product(s) assigned to it.`,
      );
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },
};

export default categoryApi;
