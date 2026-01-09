import { supabase } from "../api";
import type {
  StoreLocation,
  CreateStoreLocationRequest,
  UpdateStoreLocationRequest,
} from "./type";
import { validateStoreLocation } from "./type";

/**
 * Get the default store location
 */
export const getDefaultStoreLocation = async (): Promise<StoreLocation> => {
  const { data, error } = await supabase
    .from("store_locations")
    .select("*")
    .eq("is_default", true)
    .eq("is_active", true)
    .single();

  if (error) throw error;
  if (!data) throw new Error("No default store location found");

  return data;
};

/**
 * Get all store locations
 */
export const getAllStoreLocations = async (): Promise<StoreLocation[]> => {
  const { data, error } = await supabase
    .from("store_locations")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get a single store location by ID
 */
export const getStoreLocationById = async (
  id: string,
): Promise<StoreLocation> => {
  const { data, error } = await supabase
    .from("store_locations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Store location not found");

  return data;
};

/**
 * Create a new store location
 * If this is the first location, it will automatically become default
 */
export const createStoreLocation = async (
  location: CreateStoreLocationRequest,
): Promise<StoreLocation> => {
  // Validate input
  const validation = validateStoreLocation(location);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
  }

  // Check if this is the first location
  const { count } = await supabase
    .from("store_locations")
    .select("*", { count: "exact", head: true });

  const isFirstLocation = count === 0;

  const { data, error } = await supabase
    .from("store_locations")
    .insert({
      ...location,
      is_active: location.is_active ?? true,
      is_default: isFirstLocation, // First location is always default
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update a store location
 * Handles is_default logic: only one location can be default
 */
export const updateStoreLocation = async (
  id: string,
  updates: UpdateStoreLocationRequest,
): Promise<StoreLocation> => {
  // If setting as default, unset all other defaults first
  if (updates.is_default === true) {
    const { error: unsetError } = await supabase
      .from("store_locations")
      .update({ is_default: false })
      .neq("id", id);

    if (unsetError) throw unsetError;
  }

  // Perform the update
  const { data, error } = await supabase
    .from("store_locations")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("Store location not found");

  return data;
};

/**
 * Delete a store location
 * Prevents deletion if it's the last location or the default location
 */
export const deleteStoreLocation = async (id: string): Promise<void> => {
  // Check total count
  const { count } = await supabase
    .from("store_locations")
    .select("*", { count: "exact", head: true });

  if (count === 1) {
    throw new Error("Cannot delete the last store location");
  }

  // Check if this is the default location
  const { data: location } = await supabase
    .from("store_locations")
    .select("is_default")
    .eq("id", id)
    .single();

  if (location?.is_default) {
    throw new Error(
      "Cannot delete the default store location. Please set another location as default first.",
    );
  }

  // Proceed with deletion
  const { error } = await supabase
    .from("store_locations")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

/**
 * Set a store location as default
 * Helper function that wraps updateStoreLocation
 */
export const setDefaultStoreLocation = async (
  id: string,
): Promise<StoreLocation> => {
  return updateStoreLocation(id, { is_default: true });
};

/**
 * Toggle store location active status
 */
export const toggleStoreLocationActive = async (
  id: string,
  isActive: boolean,
): Promise<StoreLocation> => {
  // Prevent deactivating the default location
  const { data: location } = await supabase
    .from("store_locations")
    .select("is_default")
    .eq("id", id)
    .single();

  if (location?.is_default && !isActive) {
    throw new Error("Cannot deactivate the default store location");
  }

  return updateStoreLocation(id, { is_active: isActive });
};
