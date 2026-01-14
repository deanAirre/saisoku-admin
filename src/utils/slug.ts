import { supabase } from "../services/api";

// Convert a string to URL-friendly slug

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

//Generate slug from variant details

export const generateSlugFromVariant = (
  variantName: string,
  color?: string,
  size?: string,
): string => {
  const parts = [variantName, color, size].filter(Boolean);
  return slugify(parts.join(" "));
};

//Check if slug already exists (excluding current variant)

export const checkSlugExists = async (
  slug: string,
  excludeVariantId?: string,
): Promise<boolean> => {
  let query = supabase.from("variants").select("id").eq("slug", slug);

  if (excludeVariantId) {
    query = query.neq("id", excludeVariantId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error checking slug:", error);
    return false;
  }

  return data && data.length > 0;
};

//Generate unique slug by appending numbers if needed

export const generateUniqueSlug = async (
  baseSlug: string,
  excludeVariantId?: string,
): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;

  while (await checkSlugExists(slug, excludeVariantId)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

//Main function: Generate and ensure unique slug for variant

export const createVariantSlug = async (
  variantName: string,
  color?: string,
  size?: string,
  excludeVariantId?: string,
): Promise<string> => {
  const baseSlug = generateSlugFromVariant(variantName, color, size);
  return await generateUniqueSlug(baseSlug, excludeVariantId);
};
