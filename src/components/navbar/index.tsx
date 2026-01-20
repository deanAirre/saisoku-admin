// ========== src/components/admin/AdminSidebar.tsx ==========
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAdmin } from "../../context/admin-context";
import saisoku_logo from "../../assets/logo-gabadak-transparent.png";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: "/admin", label: "Dashboard", icon: <Home size={20} /> },
  { path: "/admin/orders", label: "Orders", icon: <ShoppingBag size={20} /> },
  { path: "/admin/products", label: "Products", icon: <Package size={20} /> },
  { path: "/admin/admins", label: "Admins", icon: <Users size={20} /> },
  { path: "/admin/settings", label: "Settings", icon: <Settings size={20} /> },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, signOut } = useAdmin();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await signOut();
      navigate("/");
    }
  };

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        <img src={saisoku_logo} alt="Logo" className="h-20" />
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 transition-all duration-300
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-center border-b border-gray-200 px-4">
          {!isCollapsed ? (
            <img src={saisoku_logo} alt="Logo" className="h-30" />
          ) : (
            <div className="w-12 h-12 bg-[#0ABAB5] rounded-lg flex items-center justify-center text-white font-bold text-lg">
              {" "}
              S
            </div>
          )}
        </div>

        {/* Admin Info */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0ABAB5] rounded-full flex items-center justify-center text-white font-semibold">
                {admin?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {admin?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500 truncate">{admin?.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors no-underline
                ${
                  isActive(item.path)
                    ? "bg-[#0ABAB5] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }
                ${isCollapsed ? "justify-center" : ""}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors
              ${isCollapsed ? "justify-center" : ""}
            `}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut size={20} />
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>

        {/* Collapse Toggle (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-24 w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition shadow-sm"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>

      {/* Main Content Spacer */}
      <div
        className={`
          ${isCollapsed ? "lg:ml-20" : "lg:ml-64"}
          pt-16 lg:pt-0 transition-all duration-300
        `}
      >
        {/* Your page content goes here */}
      </div>
    </>
  );
}
