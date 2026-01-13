// services/categories/type.ts

export type DisplayMode = "grouped" | "individual";

export interface Category {
  id: string;
  name: string;
  default_display_mode: DisplayMode;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  default_display_mode: DisplayMode;
}

export interface UpdateCategoryRequest {
  name?: string;
  default_display_mode?: DisplayMode;
}

export interface CategoryWithCount extends Category {
  product_count: number;
}
