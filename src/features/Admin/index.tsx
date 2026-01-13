import { useState, useEffect } from "react";
import { Users, Plus, Shield, Clock, Loader2, Trash2 } from "lucide-react";
import type { AdminProfile } from "../../services/user/admin/type";
import {
  deleteAdmin,
  getAllAdmins,
  isSuperAdmin,
  registerAdmin,
} from "../../services/user/admin/api";

type AdminTab = "list" | "add";

export default function AdminManagement() {
  const [activeTab, setActiveTab] = useState<AdminTab>("list");
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminProfile | null>(null);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin" as "admin" | "super_admin",
  });

  useEffect(() => {
    loadAdmins();
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    const result = await isSuperAdmin();
    setIsSuperAdminUser(result);
  };

  const formatLastLogin = (lastLogin?: Date) => {
    if (!lastLogin) return "Never";

    const now = new Date();
    const diffMs = now.getTime() - lastLogin.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return lastLogin.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const data = await getAllAdmins();
      // Sort by last login (most recent first)
      const sorted = data.sort((a, b) => {
        if (!a.lastLogin) return 1;
        if (!b.lastLogin) return -1;
        return (
          new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime()
        );
      });
      setAdmins(sorted);
    } catch (error: any) {
      console.error("Failed to load admins:", error);
      alert(error.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminForm.name || !newAdminForm.email || !newAdminForm.password) {
      alert("Please fill in all fields");
      return;
    }

    if (newAdminForm.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setAddingAdmin(true);
    try {
      await registerAdmin({
        name: newAdminForm.name,
        email: newAdminForm.email,
        password: newAdminForm.password,
        role: newAdminForm.role,
      });

      alert("Admin added successfully!");
      setNewAdminForm({ name: "", email: "", password: "", role: "admin" });
      setActiveTab("list");
      await loadAdmins();
    } catch (error: any) {
      console.error("Failed to add admin:", error);
      alert(error.message || "Failed to add admin");
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, adminName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete admin "${adminName}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await deleteAdmin(adminId);
      alert("Admin deleted successfully!");
      setSelectedAdmin(null);
      await loadAdmins();
    } catch (error: any) {
      console.error("Failed to delete admin:", error);
      alert(error.message || "Failed to delete admin");
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Management
          </h1>
          <p className="text-gray-600">
            Manage administrator accounts and permissions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab("list");
                    setSelectedAdmin(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === "list"
                      ? "bg-[#0ABAB5] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Users size={20} />
                  <span className="font-medium">Admin List</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("add");
                    setSelectedAdmin(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === "add"
                      ? "bg-[#0ABAB5] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Plus size={20} />
                  <span className="font-medium">Add Admin</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Admin List */}
            {activeTab === "list" && !selectedAdmin && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Administrator List
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Click on an admin to view details
                  </p>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-[#0ABAB5] animate-spin" />
                    </div>
                  ) : admins.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No administrators found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {admins.map((admin) => (
                        <button
                          key={admin.id}
                          onClick={() => setSelectedAdmin(admin)}
                          className="w-full text-left border border-gray-200 rounded-lg p-4 hover:border-[#0ABAB5] hover:bg-teal-50 transition"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#0ABAB5] rounded-full flex items-center justify-center text-white font-semibold">
                                {admin.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-gray-900">
                                    {admin.name}
                                  </h3>
                                  {admin.role === "super_admin" && (
                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full font-semibold">
                                      SUPER
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {admin.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock size={16} />
                              {admin.lastLogin
                                ? formatLastLogin(new Date(admin.lastLogin))
                                : "Never"}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin Detail View */}
            {activeTab === "list" && selectedAdmin && (
              <div className="bg-white rounded-lg shadow-sm">
                {/* ... existing code ... */}

                <div className="p-6">
                  {/* ... existing info grid ... */}

                  {/* Delete Button */}
                  {isSuperAdminUser && selectedAdmin.role !== "super_admin" && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <button
                        onClick={() =>
                          handleDeleteAdmin(
                            selectedAdmin.id,
                            selectedAdmin.name,
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <Trash2 size={20} />
                        Delete Admin
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        This action cannot be undone. The admin will lose all
                        access immediately.
                      </p>
                    </div>
                  )}

                  {selectedAdmin.role === "super_admin" && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Super admins cannot be deleted for security reasons.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add Admin Form */}
            {activeTab === "add" && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="text-[#0ABAB5]" size={24} />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Add New Administrator
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    {isSuperAdminUser
                      ? "Create a new admin account with system access"
                      : "Only super admins can add new administrators"}
                  </p>
                </div>

                <div className="p-6">
                  {!isSuperAdminUser ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800">
                        You don't have permission to add new admins. Contact a
                        super administrator.
                      </p>
                    </div>
                  ) : (
                    <div className="max-w-2xl">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={newAdminForm.name}
                            onChange={(e) =>
                              setNewAdminForm({
                                ...newAdminForm,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent"
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={newAdminForm.email}
                            onChange={(e) =>
                              setNewAdminForm({
                                ...newAdminForm,
                                email: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent"
                            placeholder="admin@example.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password *
                          </label>
                          <input
                            type="password"
                            value={newAdminForm.password}
                            onChange={(e) =>
                              setNewAdminForm({
                                ...newAdminForm,
                                password: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent"
                            placeholder="Minimum 6 characters"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Must be at least 6 characters long
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role *
                          </label>
                          <select
                            value={newAdminForm.role}
                            onChange={(e) =>
                              setNewAdminForm({
                                ...newAdminForm,
                                role: e.target.value as "admin" | "super_admin",
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent bg-white"
                          >
                            <option value="admin">
                              Admin (Standard access)
                            </option>
                            <option value="super_admin">
                              Super Admin (Can manage admins)
                            </option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            Super admins can add/remove other admins
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={handleAddAdmin}
                          disabled={addingAdmin}
                          className="flex items-center gap-2 px-6 py-3 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099490] transition disabled:opacity-50 font-semibold"
                        >
                          {addingAdmin ? (
                            <>
                              <Loader2 size={20} className="animate-spin" />
                              Adding Admin...
                            </>
                          ) : (
                            <>
                              <Plus size={20} />
                              Add Administrator
                            </>
                          )}
                        </button>
                        <button
                          onClick={() =>
                            setNewAdminForm({
                              name: "",
                              email: "",
                              password: "",
                              role: "admin",
                            })
                          }
                          disabled={addingAdmin}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                        >
                          Clear Form
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
