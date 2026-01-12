import { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  Star,
} from "lucide-react";
import {
  getAllStoreLocations,
  createStoreLocation,
  updateStoreLocation,
  deleteStoreLocation,
  setDefaultStoreLocation,
} from "../../services/location/api";
import type {
  StoreLocation,
  CreateStoreLocationRequest,
} from "../../services/location/type";

type SettingsTab = "location" | "payment" | "shipping" | "general";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("location");
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateStoreLocationRequest>>(
    {
      name: "",
      address: "",
      city: "",
      region: "",
      district: "",
      postcode: "",
      phone: "",
      email: "",
      maps_url: "",
      is_active: true,
    },
  );

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const data = await getAllStoreLocations();
      setLocations(data);
    } catch (error) {
      console.error("Failed to load locations:", error);
      alert("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (location: StoreLocation) => {
    setEditingId(location.id);
    setFormData({
      name: location.name,
      address: location.address,
      city: location.city,
      region: location.region || "",
      district: location.district || "",
      postcode: location.postcode || "",
      phone: location.phone,
      email: location.email || "",
      maps_url: location.maps_url || "",
      is_active: location.is_active,
    });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingId(null);
    setFormData({
      name: "",
      address: "",
      city: "",
      region: "",
      district: "",
      postcode: "",
      phone: "",
      email: "",
      maps_url: "",
      is_active: true,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setFormData({
      name: "",
      address: "",
      city: "",
      region: "",
      district: "",
      postcode: "",
      phone: "",
      email: "",
      maps_url: "",
      is_active: true,
    });
  };

  const handleSave = async () => {
    if (
      !formData.name ||
      !formData.address ||
      !formData.city ||
      !formData.phone
    ) {
      alert("Please fill in all required fields (Name, Address, City, Phone)");
      return;
    }

    setSaving(true);
    try {
      if (isAddingNew) {
        await createStoreLocation(formData as CreateStoreLocationRequest);
        alert("Location added successfully!");
      } else if (editingId) {
        await updateStoreLocation(editingId, formData);
        alert("Location updated successfully!");
      }

      handleCancel();
      await loadLocations();
    } catch (error: any) {
      console.error("Failed to save location:", error);
      alert(error.message || "Failed to save location");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    try {
      await deleteStoreLocation(id);
      alert("Location deleted successfully!");
      await loadLocations();
    } catch (error: any) {
      console.error("Failed to delete location:", error);
      alert(error.message || "Failed to delete location");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultStoreLocation(id);
      alert("Default location updated!");
      await loadLocations();
    } catch (error: any) {
      console.error("Failed to set default location:", error);
      alert(error.message || "Failed to set default location");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#0ABAB5] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your store configuration</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("location")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === "location"
                      ? "bg-[#0ABAB5] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <MapPin size={20} />
                  <span className="font-medium">Location</span>
                </button>
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === "location" && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Store Locations
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage your store locations. The default location is used
                      for courier calculations.
                    </p>
                  </div>
                  <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099490] transition"
                  >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Add Location</span>
                  </button>
                </div>

                {(isAddingNew || editingId) && (
                  <div className="p-6 bg-blue-50 border-b border-blue-200">
                    <h3 className="text-lg font-semibold mb-4">
                      {isAddingNew ? "Add New Location" : "Edit Location"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Store Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                          placeholder="Main Store"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={formData.phone || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                          placeholder="+628123456789"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                          placeholder="store@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          value={formData.city || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                          placeholder="Jakarta"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Region/Province
                        </label>
                        <input
                          type="text"
                          value={formData.region || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, region: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                          placeholder="DKI Jakarta"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          District
                        </label>
                        <input
                          type="text"
                          value={formData.district || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              district: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                          placeholder="Menteng"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={formData.postcode || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              postcode: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                          placeholder="10310"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Google Maps URL
                        </label>
                        <input
                          type="url"
                          value={formData.maps_url || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maps_url: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                          placeholder="https://maps.google.com/..."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address *
                        </label>
                        <textarea
                          value={formData.address || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                          rows={2}
                          placeholder="Jl. Merdeka No. 123"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099490] transition disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <Save size={20} />
                        )}
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        <X size={20} />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {locations.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No locations added yet</p>
                      <button
                        onClick={handleAddNew}
                        className="mt-4 px-6 py-2 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099490] transition"
                      >
                        Add Your First Location
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {locations.map((location) => (
                        <div
                          key={location.id}
                          className={`border rounded-lg p-4 ${
                            location.is_default
                              ? "border-[#0ABAB5] bg-teal-50"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {location.name}
                                </h3>
                                {location.is_default && (
                                  <span className="flex items-center gap-1 px-2 py-1 bg-[#0ABAB5] text-white text-xs rounded-full">
                                    <Star size={12} />
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Address:</span>{" "}
                                  {location.address}
                                </div>
                                <div>
                                  <span className="font-medium">City:</span>{" "}
                                  {location.city}
                                </div>
                                <div>
                                  <span className="font-medium">District:</span>{" "}
                                  {location.district || "-"}
                                </div>
                                <div>
                                  <span className="font-medium">Phone:</span>{" "}
                                  {location.phone}
                                </div>
                                <div>
                                  <span className="font-medium">Email:</span>{" "}
                                  {location.email || "-"}
                                </div>
                                <div>
                                  <span className="font-medium">Postcode:</span>{" "}
                                  {location.postcode || "-"}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              {!location.is_default && (
                                <button
                                  onClick={() => handleSetDefault(location.id)}
                                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                                  title="Set as default"
                                >
                                  <Star size={20} />
                                </button>
                              )}
                              <button
                                onClick={() => handleEdit(location)}
                                className="p-2 text-[#0ABAB5] hover:bg-teal-50 rounded-lg transition"
                              >
                                <Edit2 size={20} />
                              </button>
                              <button
                                onClick={() => handleDelete(location.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={location.is_default}
                                title={
                                  location.is_default
                                    ? "Cannot delete default location"
                                    : "Delete"
                                }
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab !== "location" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-gray-600">
                  TODO: Implement {activeTab} settings
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
