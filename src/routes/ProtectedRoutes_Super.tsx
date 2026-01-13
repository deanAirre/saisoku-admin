import { Navigate } from "react-router-dom";
import { useAdmin } from "../context/admin-context";
import { Loader2 } from "lucide-react";

interface ProtectedSuperAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedSuperAdminRoute({
  children,
}: ProtectedSuperAdminRouteProps) {
  const { admin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#0ABAB5] animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (admin.role !== "super_admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You need super admin privileges to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099490] transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
