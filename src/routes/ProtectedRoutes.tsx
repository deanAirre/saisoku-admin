import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "../context/admin-context";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { authUser, isAdmin, loading } = useAdmin();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0ABAB5] mx-auto mb-4"></div>
          <div
            className="text-lg text-gray-600"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Verifying admin access...
          </div>
        </div>
      </div>
    );
  }

  // Not logged in at all - redirect to admin login
  if (!authUser) {
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in but not an admin - redirect to admin login with error
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // All checks passed - render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
