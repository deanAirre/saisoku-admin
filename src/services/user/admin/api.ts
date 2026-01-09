import { supabase } from "../../api";
import type {
  AdminLoginRequest,
  AdminProfile,
  AdminRegisterRequest,
} from "./type";

export const loginAdmin = async (credentials: AdminLoginRequest) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) throw error;

  return { user: data.user, session: data.session };
};

// Logout admin
export const logoutAdmin = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;

  window.location.href = "/admin/login";

  return { message: "Logged out successfully" };
};

// Register admin by admin
export const registerAdmin = async (adminData: AdminRegisterRequest) => {
  // Create auth user
  const { data, error } = await supabase.auth.signUp({
    email: adminData.email,
    password: adminData.password,
  });

  if (error) throw error;
  if (!data.user) throw new Error("Failed to create user");

  // Create admin profile
  const { error: profileError } = await supabase.from("admins").insert({
    id: data.user.id,
    name: adminData.name,
    email: adminData.email,
  });

  if (profileError) {
    // Try delete the auth user if profile creation fails to avoid duplcation
    console.error(
      "Failed to create admin profile, user may need manual cleanup",
    );
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
