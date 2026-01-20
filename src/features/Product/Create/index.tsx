import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, X, Loader2, ArrowLeft, Upload, AlertCircle } from "lucide-react";
import { productAdminApi } from "../../../services/products/api";
import { categoryApi } from "../../../services/categories";
import type { Category } from "../../../services/categories/type";
import type {
  CreateProductRequest,
  CreateVariantRequest,
} from "../../../services/products/type";
import { createVariantSlug } from "../../../utils/slug";
import { useToast } from "../../../context/toast-context";

export default function AdminCreateProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [_categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const { showToast } = useToast();
  // Product form data
  const [productData, setProductData] = useState<CreateProductRequest>({
    name: "",
    category_id: "",
    description: "",
    description_english: "",
    display_mode: "individual",
    is_featured: false,
    is_active: true,
  });

  // First variant form data (required)
  const [variantData, setVariantData] = useState({
    sku: "",
    slug: "",
    variant_name: "",
    size: "",
    color: "",
    color_hex: "",
    price: 0,
    stock: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await categoryApi.getAllCategories();
      setCategories(data);

      // Auto-select first category and set display_mode
      if (data.length > 0) {
        setProductData((prev) => ({
          ...prev,
          category_id: data[0].id,
          display_mode: data[0].default_display_mode,
        }));
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      showToast({
        message: "Failed to load categories",
        type: "error",
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    setProductData({
      ...productData,
      category_id: categoryId,
      display_mode: category?.default_display_mode || "individual",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation with toasts
    if (!productData.name.trim()) {
      showToast({ message: "Product name is required", type: "error" });
      return;
    }
    if (!productData.category_id) {
      showToast({ message: "Please select a category", type: "error" });
      return;
    }
    if (!variantData.sku.trim()) {
      showToast({ message: "Variant SKU is required", type: "error" });
      return;
    }
    if (!variantData.variant_name.trim()) {
      showToast({ message: "Variant name is required", type: "error" });
      return;
    }
    if (variantData.price <= 0) {
      showToast({ message: "Price must be greater than 0", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const product = await productAdminApi.createProduct(productData);

      const variantRequest: CreateVariantRequest = {
        product_id: product.id,
        sku: variantData.sku.trim(),
        slug: variantData.slug.trim(),
        variant_name: variantData.variant_name.trim(),
        size: variantData.size || undefined,
        color: variantData.color || undefined,
        color_hex: variantData.color_hex || undefined,
        price: variantData.price,
        stock: variantData.stock,
        is_active: true,
      };

      const createdVariant =
        await productAdminApi.createVariant(variantRequest);

      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map((file, index) =>
          productAdminApi.uploadVariantImage(
            createdVariant.id,
            file,
            index,
            index === 0,
          ),
        );
        await Promise.all(uploadPromises);
      }

      showToast({
        message: "Product created successfully!",
        type: "success",
      });

      navigate(`/admin/products/${product.id}/edit`);
    } catch (error: any) {
      console.error("Failed to create product:", error);
      showToast({
        message: error.message || "Failed to create product",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/products")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Products
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Product
          </h1>
          <p className="text-gray-600">
            Add product details and create the first variant
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Product Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={productData.name}
                  onChange={(e) =>
                    setProductData({ ...productData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                  placeholder="e.g., Mickey Mouse Doll"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={productData.category_id}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5] bg-white"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Mode
                  </label>
                  <select
                    value={productData.display_mode}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        display_mode: e.target.value as
                          | "grouped"
                          | "individual",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5] bg-white"
                  >
                    <option value="individual">Individual</option>
                    <option value="grouped">Grouped</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-filled from category default
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={productData.description}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                  rows={3}
                  placeholder="Product description in Indonesian"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (English)
                </label>
                <textarea
                  value={productData.description_english}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      description_english: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                  rows={3}
                  placeholder="Product description in English"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={productData.is_featured}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        is_featured: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#0ABAB5] border-gray-300 rounded focus:ring-[#0ABAB5]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Featured Product
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={productData.is_active}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        is_active: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#0ABAB5] border-gray-300 rounded focus:ring-[#0ABAB5]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* First Variant */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              First Variant *
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              You can add more variants and images after creating the product.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU *
                </label>
                <input
                  type="text"
                  value={variantData.sku}
                  onChange={(e) =>
                    setVariantData({ ...variantData, sku: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                  placeholder="e.g., MICKEY-XL-RED"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variant Name *
                </label>
                <input
                  type="text"
                  value={variantData.variant_name}
                  onChange={(e) =>
                    setVariantData({
                      ...variantData,
                      variant_name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                  placeholder="e.g., Mickey Mouse Doll - XL Red"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={variantData.slug}
                  onChange={(e) =>
                    setVariantData({ ...variantData, slug: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                  placeholder="e.g., mickey-mouse-xl-red"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-generated from variant name, color, and size. You can
                  customize it.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const generated = await createVariantSlug(
                      variantData.variant_name,
                      variantData.color,
                      variantData.size,
                    );
                    setVariantData({ ...variantData, slug: generated });
                  }}
                  className="mt-1 text-sm text-[#0ABAB5] hover:underline"
                >
                  Auto-generate slug
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size
                </label>
                <input
                  type="text"
                  value={variantData.size}
                  onChange={(e) =>
                    setVariantData({ ...variantData, size: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                  placeholder="e.g., XL, L, M"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  value={variantData.color}
                  onChange={(e) =>
                    setVariantData({ ...variantData, color: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                  placeholder="e.g., Red, Blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color Hex
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={variantData.color_hex}
                    onChange={(e) =>
                      setVariantData({
                        ...variantData,
                        color_hex: e.target.value,
                      })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                    placeholder="#FF0000"
                  />
                  <input
                    type="color"
                    value={variantData.color_hex || "#000000"}
                    onChange={(e) =>
                      setVariantData({
                        ...variantData,
                        color_hex: e.target.value,
                      })
                    }
                    className="w-12 h-10 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (IDR) *
                </label>
                <input
                  type="number"
                  value={variantData.price}
                  onChange={(e) =>
                    setVariantData({
                      ...variantData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                  placeholder="150000"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  value={variantData.stock}
                  onChange={(e) =>
                    setVariantData({
                      ...variantData,
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                  placeholder="10"
                  min="0"
                  required
                />
              </div>
              {/* Image Upload Section */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-[#0ABAB5] transition">
                  <input
                    type="file"
                    id="product-images"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/heif,image/heic"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        setSelectedImages(Array.from(e.target.files));
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="product-images"
                    className="cursor-pointer block"
                  >
                    <div className="text-center py-4">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 font-medium">
                        Click to upload images
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, WebP up to 10MB each
                      </p>
                      <p className="text-xs text-yellow-600 mt-1 flex items-center justify-center gap-1">
                        <AlertCircle size={14} />
                        Some type of images may not display correctly in all
                        browsers, consult IT if it happens
                      </p>
                    </div>
                  </label>

                  {/* Image Previews */}
                  {selectedImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">
                        {selectedImages.length} image(s) selected
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {selectedImages.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded border-2 border-gray-200"
                            />
                            {index === 0 && (
                              <span className="absolute top-1 left-1 bg-yellow-400 text-xs font-semibold px-2 py-0.5 rounded">
                                Primary
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedImages(
                                  selectedImages.filter((_, i) => i !== index),
                                );
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099490] transition font-semibold disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Create Product
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              <X size={20} />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
