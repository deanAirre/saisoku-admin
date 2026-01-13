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
  Tag,
  Package,
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
import { categoryApi } from "../../services/categories";
import type {
  CategoryWithCount,
  DisplayMode,
} from "../../services/categories/type";

type SettingsTab = "categories" | "location";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("categories");

  // Location state
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationSaving, setLocationSaving] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(
    null,
  );
  const [isAddingNewLocation, setIsAddingNewLocation] = useState(false);
  const [locationFormData, setLocationFormData] = useState<
    Partial<CreateStoreLocationRequest>
  >({
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

  // Category state
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categorySaving, setCategorySaving] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState<{
    name: string;
    default_display_mode: DisplayMode;
  }>({
    name: "",
    default_display_mode: "individual",
  });

  useEffect(() => {
    loadLocations();
    loadCategories();
  }, []);

  // ========== LOCATION FUNCTIONS ==========
  const loadLocations = async () => {
    setLocationLoading(true);
    try {
      const data = await getAllStoreLocations();
      setLocations(data);
    } catch (error) {
      console.error("Failed to load locations:", error);
      alert("Failed to load locations");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleEditLocation = (location: StoreLocation) => {
    setEditingLocationId(location.id);
    setLocationFormData({
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
    setIsAddingNewLocation(false);
  };

  const handleAddNewLocation = () => {
    setIsAddingNewLocation(true);
    setEditingLocationId(null);
    setLocationFormData({
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

  const handleCancelLocation = () => {
    setEditingLocationId(null);
    setIsAddingNewLocation(false);
    setLocationFormData({
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

  const handleSaveLocation = async () => {
    if (
      !locationFormData.name ||
      !locationFormData.address ||
      !locationFormData.city ||
      !locationFormData.phone
    ) {
      alert("Please fill in all required fields (Name, Address, City, Phone)");
      return;
    }

    setLocationSaving(true);
    try {
      if (isAddingNewLocation) {
        await createStoreLocation(
          locationFormData as CreateStoreLocationRequest,
        );
        alert("Location added successfully!");
      } else if (editingLocationId) {
        await updateStoreLocation(editingLocationId, locationFormData);
        alert("Location updated successfully!");
      }

      handleCancelLocation();
      await loadLocations();
    } catch (error: any) {
      console.error("Failed to save location:", error);
      alert(error.message || "Failed to save location");
    } finally {
      setLocationSaving(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
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

  const handleSetDefaultLocation = async (id: string) => {
    try {
      await setDefaultStoreLocation(id);
      alert("Default location updated!");
      await loadLocations();
    } catch (error: any) {
      console.error("Failed to set default location:", error);
      alert(error.message || "Failed to set default location");
    }
  };

  // ========== CATEGORY FUNCTIONS ==========
  const loadCategories = async () => {
    setCategoryLoading(true);
    try {
      const data = await categoryApi.getCategoriesWithCount();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
      alert("Failed to load categories");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleEditCategory = (category: CategoryWithCount) => {
    setEditingCategoryId(category.id);
    setCategoryFormData({
      name: category.name,
      default_display_mode: category.default_display_mode,
    });
    setIsAddingNewCategory(false);
  };

  const handleAddNewCategory = () => {
    setIsAddingNewCategory(true);
    setEditingCategoryId(null);
    setCategoryFormData({
      name: "",
      default_display_mode: "individual",
    });
  };

  const handleCancelCategory = () => {
    setEditingCategoryId(null);
    setIsAddingNewCategory(false);
    setCategoryFormData({
      name: "",
      default_display_mode: "individual",
    });
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name.trim()) {
      alert("Please enter a category name");
      return;
    }

    setCategorySaving(true);
    try {
      if (isAddingNewCategory) {
        await categoryApi.createCategory({
          name: categoryFormData.name.trim(),
          default_display_mode: categoryFormData.default_display_mode,
        });
        alert("Category added successfully!");
      } else if (editingCategoryId) {
        await categoryApi.updateCategory(editingCategoryId, {
          name: categoryFormData.name.trim(),
          default_display_mode: categoryFormData.default_display_mode,
        });
        alert("Category updated successfully!");
      }

      handleCancelCategory();
      await loadCategories();
    } catch (error: any) {
      console.error("Failed to save category:", error);
      alert(error.message || "Failed to save category");
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (id: string, productCount: number) => {
    if (productCount > 0) {
      alert(
        `Cannot delete this category. It has ${productCount} product(s) assigned to it.`,
      );
      return;
    }

    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await categoryApi.deleteCategory(id);
      alert("Category deleted successfully!");
      await loadCategories();
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      alert(error.message || "Failed to delete category");
    }
  };

  if (locationLoading && activeTab === "location") {
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
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("categories")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === "categories"
                      ? "bg-[#0ABAB5] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Tag size={20} />
                  <span className="font-medium">Categories</span>
                </button>
                <button
                  onClick={() => setActiveTab("location")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === "location"
                      ? "bg-[#0ABAB5] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <MapPin size={20} />
                  <span className="font-medium">Store Location</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* CATEGORIES TAB */}
            {activeTab === "categories" && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Product Categories
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage product categories and their default display modes.
                    </p>
                  </div>
                  <button
                    onClick={handleAddNewCategory}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099490] transition"
                  >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Add Category</span>
                  </button>
                </div>

                {/* Add/Edit Form */}
                {(isAddingNewCategory || editingCategoryId) && (
                  <div className="p-6 bg-blue-50 border-b border-blue-200">
                    <h3 className="text-lg font-semibold mb-4">
                      {isAddingNewCategory
                        ? "Add New Category"
                        : "Edit Category"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          value={categoryFormData.name}
                          onChange={(e) =>
                            setCategoryFormData({
                              ...categoryFormData,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                          placeholder="e.g., Tas, Boneka, Gelang"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Default Display Mode *
                        </label>
                        <select
                          value={categoryFormData.default_display_mode}
                          onChange={(e) =>
                            setCategoryFormData({
                              ...categoryFormData,
                              default_display_mode: e.target
                                .value as DisplayMode,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5] bg-white"
                        >
                          <option value="individual">
                            Individual (Each variant shown separately)
                          </option>
                          <option value="grouped">
                            Grouped (Variants grouped by product)
                          </option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          This sets the default display mode for products in
                          this category.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSaveCategory}
                        disabled={categorySaving}
                        className="flex items-center gap-2 px-6 py-2 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099490] transition disabled:opacity-50"
                      >
                        {categorySaving ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <Save size={20} />
                        )}
                        Save Category
                      </button>
                      <button
                        onClick={handleCancelCategory}
                        disabled={categorySaving}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        <X size={20} />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Categories List */}
                <div className="p-6">
                  {categoryLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-[#0ABAB5] animate-spin" />
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-center py-12">
                      <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No categories added yet</p>
                      <button
                        onClick={handleAddNewCategory}
                        className="mt-4 px-6 py-2 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099490] transition"
                      >
                        Add Your First Category
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {category.name}
                                </h3>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    category.default_display_mode === "grouped"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {category.default_display_mode === "grouped"
                                    ? "Grouped"
                                    : "Individual"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Package size={16} />
                                <span>{category.product_count} product(s)</span>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="p-2 text-[#0ABAB5] hover:bg-teal-50 rounded-lg transition"
                                title="Edit category"
                              >
                                <Edit2 size={20} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteCategory(
                                    category.id,
                                    category.product_count,
                                  )
                                }
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={category.product_count > 0}
                                title={
                                  category.product_count > 0
                                    ? "Cannot delete category with products"
                                    : "Delete category"
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

            {/* LOCATION TAB */}
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
                    onClick={handleAddNewLocation}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099490] transition"
                  >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Add Location</span>
                  </button>
                </div>

                {(isAddingNewLocation || editingLocationId) && (
                  <div className="p-6 bg-blue-50 border-b border-blue-200">
                    <h3 className="text-lg font-semibold mb-4">
                      {isAddingNewLocation
                        ? "Add New Location"
                        : "Edit Location"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Store Name *
                        </label>
                        <input
                          type="text"
                          value={locationFormData.name || ""}
                          onChange={(e) =>
                            setLocationFormData({
                              ...locationFormData,
                              name: e.target.value,
                            })
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
                          value={locationFormData.phone || ""}
                          onChange={(e) =>
                            setLocationFormData({
                              ...locationFormData,
                              phone: e.target.value,
                            })
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
                          value={locationFormData.email || ""}
                          onChange={(e) =>
                            setLocationFormData({
                              ...locationFormData,
                              email: e.target.value,
                            })
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
                          value={locationFormData.city || ""}
                          onChange={(e) =>
                            setLocationFormData({
                              ...locationFormData,
                              city: e.target.value,
                            })
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
                          value={locationFormData.region || ""}
                          onChange={(e) =>
                            setLocationFormData({
                              ...locationFormData,
                              region: e.target.value,
                            })
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
                          value={locationFormData.district || ""}
                          onChange={(e) =>
                            setLocationFormData({
                              ...locationFormData,
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
                          value={locationFormData.postcode || ""}
                          onChange={(e) =>
                            setLocationFormData({
                              ...locationFormData,
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
                          value={locationFormData.maps_url || ""}
                          onChange={(e) =>
                            setLocationFormData({
                              ...locationFormData,
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
                          value={locationFormData.address || ""}
                          onChange={(e) =>
                            setLocationFormData({
                              ...locationFormData,
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
                        onClick={handleSaveLocation}
                        disabled={locationSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099490] transition disabled:opacity-50"
                      >
                        {locationSaving ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <Save size={20} />
                        )}
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelLocation}
                        disabled={locationSaving}
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
                        onClick={handleAddNewLocation}
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
                                  <span className="font-medium">Phone:</span>{" "}
                                  {location.phone}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              {!location.is_default && (
                                <button
                                  onClick={() =>
                                    handleSetDefaultLocation(location.id)
                                  }
                                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                                >
                                  <Star size={20} />
                                </button>
                              )}
                              <button
                                onClick={() => handleEditLocation(location)}
                                className="p-2 text-[#0ABAB5] hover:bg-teal-50 rounded-lg transition"
                              >
                                <Edit2 size={20} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteLocation(location.id)
                                }
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                disabled={location.is_default}
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
          </div>
        </div>
      </div>
    </div>
  );
}
