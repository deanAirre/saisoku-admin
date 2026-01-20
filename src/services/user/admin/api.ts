import { supabase } from "../../api";
import { logger } from "../../log/api";
import type {
  AdminLoginRequest,
  AdminProfile,
  AdminRegisterRequest,
} from "./type";

export const loginAdmin = async (credentials: AdminLoginRequest) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      await logger.error("Admin login failed", "admin_login_api", {
        email: credentials.email,
        error: error.message,
      });
      throw error;
    }

    // Update last_login...
    return { user: data.user, session: data.session };
  } catch (error: any) {
    await logger.error(
      "Admin login exception",
      "admin_login_api",
      { email: credentials.email },
      error,
    );
    throw error;
  }
};

// Logout admin
export const logoutAdmin = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;

  window.location.href = "/";
  return { message: "Logged out successfully" };
};

// Register admin by admin

export const registerAdmin = async (adminData: AdminRegisterRequest) => {
  // Check if current user is super_admin
  const currentAdmin = await fetchAdminProfile();
  if (currentAdmin.role !== "super_admin") {
    throw new Error("Unauthorized: Only super admins can add new admins");
  }

  // Create auth user
  const { data, error } = await supabase.auth.signUp({
    email: adminData.email,
    password: adminData.password,
  });

  if (error) throw error;
  if (!data.user) throw new Error("Failed to create user");

  // Create admin profile (default role is 'admin')
  const { error: profileError } = await supabase.from("admins").insert({
    id: data.user.id,
    name: adminData.name,
    email: adminData.email,
    role: "admin", // New admins are regular admins by default
  });

  if (profileError) {
    console.error("Failed to create admin profile");
    throw profileError;
  }

  return { user: data.user, session: data.session };
};
// Fetch current admin profile
export const fetchAdminProfile = async (): Promise<AdminProfile> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) throw error;
  return data;
};

// Check if Admin
export const checkIsAdmin = async (): Promise<boolean> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;
  const { data, error } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .single();

  if (error) return false;
  return !!data;
};

// Fetch all admins (admin only)
export const getAllAdmins = async (): Promise<AdminProfile[]> => {
  // First check if current user is admin
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .order("created_at", { ascending: false }); // Newest first

  if (error) throw error;

  return data || [];
};

// Helper function
export const isSuperAdmin = async (): Promise<boolean> => {
  try {
    const profile = await fetchAdminProfile();
    return profile.role === "super_admin";
  } catch {
    return false;
  }
};

// Delete admin by superadmin
export const deleteAdmin = async (adminId: string): Promise<void> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-admin`,
      {
        method: "{POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ adminId }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete admin");
    }
  } catch (error: any) {
    await logger.error(
      "Failed to delete admin",
      "admin_delete",
      { adminId },
      error,
    );
    throw error;
  }
};
