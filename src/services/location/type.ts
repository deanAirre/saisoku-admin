// API Response from database
export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string | null;
  district: string | null;
  postcode: string | null;
  phone: string;
  email: string | null;
  maps_url: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Request types
export interface CreateStoreLocationRequest {
  name: string;
  address: string;
  city: string;
  region?: string;
  district?: string;
  postcode?: string;
  phone: string;
  email?: string;
  maps_url?: string;
  is_active?: boolean;
}

export interface UpdateStoreLocationRequest {
  name?: string;
  address?: string;
  city?: string;
  region?: string;
  district?: string;
  postcode?: string;
  phone?: string;
  email?: string;
  maps_url?: string;
  is_default?: boolean;
  is_active?: boolean;
}

// Validation helper
export function validateStoreLocation(location: CreateStoreLocationRequest): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!location.name?.trim()) errors.push("Name is required");
  if (!location.address?.trim()) errors.push("Address is required");
  if (!location.city?.trim()) errors.push("City is required");
  if (!location.phone?.trim()) errors.push("Phone is required");

  return {
    valid: errors.length === 0,
    errors,
  };
}
