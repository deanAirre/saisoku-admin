export interface Product {
  id: string;
  name: string;
  category?: string;
  category_id?: string; //backward compatibility
  description?: string;
  description_english?: string;
  display_mode?: "grouped" | "individual";
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface Variant {
  id: string;
  product_id: string;
  sku: string;
  variant_name: string;
  size?: string;
  color?: string;
  color_hex?: string;
  price: number;
  stock: number;
  image_url?: string;
  images?: VariantImage[];
  is_active: boolean;
  created_at: string;
}

export interface VariantImage {
  id: string;
  variant_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductWithVariants extends Product {
  variants: Variant[];
}

// For creating new product
export interface CreateProductRequest {
  name: string;
  category_id: string;
  description?: string;
  description_english?: string;
  display_mode?: "grouped" | "individual";
  is_featured?: boolean;
  is_active?: boolean;
}

// For updating product
export interface UpdateProductRequest {
  name?: string;
  category_id?: string;
  description?: string;
  description_english?: string;
  display_mode?: "grouped" | "individual";
  is_featured?: boolean;
  is_active?: boolean;
}

// For creating new variant
export interface CreateVariantRequest {
  product_id: string;
  sku: string;
  variant_name: string;
  size?: string;
  color?: string;
  color_hex?: string;
  price: number;
  stock: number;
  image_url?: string;
  is_active?: boolean;
}

// For updating variant
export interface UpdateVariantRequest {
  sku?: string;
  variant_name?: string;
  size?: string;
  color?: string;
  color_hex?: string;
  price?: number;
  stock?: number;
  image_url?: string;
  is_active?: boolean;
}

// For uploading variant images
export interface UploadImageRequest {
  variant_id: string;
  file: File;
  display_order?: number;
  is_primary?: boolean;
}

// For updating image metadata
export interface UpdateImageRequest {
  display_order?: number;
  is_primary?: boolean;
}

// Product with variants for admin list
export interface ProductWithVariantsAdmin extends Product {
  variants: Variant[];
  category_name?: string;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface VariantWithProduct extends Variant {
  products: Product;
}

export interface VariantWithProductExtended extends VariantWithProduct {
  isGrouped: false;
}

export interface ProductGroup {
  product: Product;
  variants: VariantWithProduct[];
  primaryVariant: VariantWithProduct;
  priceRange: {
    min: number;
    max: number;
  };
  isGrouped: true;
}
