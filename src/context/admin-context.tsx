import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  mapApiAdminToAdmin,
  type Admin,
  type AdminRegisterRequest,
} from "../services/user/admin/type";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  fetchAdminProfile,
  logoutAdmin,
  registerAdmin,
} from "../services/user/admin/api";
import { supabase } from "../services/api";

interface AdminContextType {
  admin: Admin | null;
  authUser: SupabaseUser | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  refetchAdmin: () => Promise<void>;
  createNewAdmin: (adminData: AdminRegisterRequest) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);
export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Fetch admin profile from database
  const fetchAdmin = useCallback(async () => {
    if (!authUser) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profile = await fetchAdminProfile();
      const mappedAdmin = mapApiAdminToAdmin(profile);
      setAdmin(mappedAdmin);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch admin profile";
      setError(errorMessage);
      console.error("Admin fetch error:", err);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  // Create new Admin (only by existing admin)
  const createNewAdmin = useCallback(
    async (adminData: AdminRegisterRequest) => {
      if (!admin) {
        throw new Error("Only admin can create new Admin");
      }

      setError(null);
      try {
        await registerAdmin(adminData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create admin";
        setError(errorMessage);
        console.error("Create admin error:", err);
        throw err;
      }
    },
    [admin],
  );

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await logoutAdmin();
      setAdmin(null);
      setAuthUser(null);
    } catch (err) {
      console.error("Sign out error:", err);
      throw err;
    }
  }, []);

  // Listen for auth changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (authUser) {
      fetchAdmin();
    } else {
      setAdmin(null);
      setLoading(false);
    }
  }, [authUser, authLoading, fetchAdmin]);

  const value: AdminContextType = {
    admin,
    authUser,
    loading: authLoading || loading,
    error,
    isAdmin: !!admin,
    refetchAdmin: fetchAdmin,
    createNewAdmin,
    signOut,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

// Custom hook
export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
