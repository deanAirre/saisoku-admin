export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
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
}

// App admin interface (mapped from API)
export interface Admin {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mapper function
export function mapApiAdminToAdmin(profile: AdminProfile): Admin {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    createdAt: new Date(profile.created_at),
    updatedAt: new Date(profile.updated_at),
  };
}
