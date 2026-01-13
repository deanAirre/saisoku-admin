export type AdminRole = "super_admin" | "admin";

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  created_at: string;
  updated_at: string;
  lastLogin?: string;
}

// Request types
export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminRegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: AdminRole;
}

// App admin interface (mapped from API)
export interface Admin {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  role: AdminRole;
  lastLogin?: Date;
}

// Mapper function
export function mapApiAdminToAdmin(profile: AdminProfile): Admin {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    createdAt: new Date(profile.created_at),
    updatedAt: new Date(profile.updated_at),
    lastLogin: profile.lastLogin ? new Date(profile.lastLogin) : undefined,
  };
}
