import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Upload,
  AlertCircle,
} from "lucide-react";
import { productAdminApi } from "../../../services/products/api";
import productApi from "../../../services/products/productsapi";
import { categoryApi } from "../../../services/categories";
import type { Category } from "../../../services/categories/type";
import type {
  ProductWithVariants,
  Variant,
} from "../../../services/products/type";
import { createVariantSlug } from "../../../utils/slug";
import { useToast } from "../../../context/toast-context";

export default function AdminEditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductWithVariants | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Edit states
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [variantFormData, setVariantFormData] = useState({
    sku: "",
    slug: "",
    variant_name: "",
    size: "",
    color: "",
    color_hex: "",
    price: 0,
    stock: 0,
  });
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  const [productFormData, setProductFormData] = useState({
    name: "",
    category_id: "",
    description: "",
    description_english: "",
    display_mode: "individual" as "grouped" | "individual",
    is_featured: false,
    is_active: true,
  });

  const variantFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [productData, categoriesData] = await Promise.all([
        productApi.getProductById(id),
        categoryApi.getAllCategories(),
      ]);

      if (productData) {
        setProduct(productData);
        setProductFormData({
          name: productData.name,
          category_id: productData.category_id || "",
          description: productData.description || "",
          description_english: productData.description_english || "",
          display_mode: productData.display_mode || "individual",
          is_featured: productData.is_featured,
          is_active: productData.is_active,
        });
      }
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load data:", error);
      showToast({
        message: "Failed to load product",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await productAdminApi.updateProduct(id, productFormData);
      showToast({
        message: "Product updated successfully!",
        type: "success",
      });
      loadData();
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to update product",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddVariant = () => {
    setIsAddingVariant(true);
    setEditingVariantId(null);
    setVariantFormData({
      sku: "",
      slug: "",
      variant_name: "",
      size: "",
      color: "",
      color_hex: "",
      price: 0,
      stock: 0,
    });

    setTimeout(() => {
      variantFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleEditVariant = (variant: Variant) => {
    setEditingVariantId(variant.id);
    setIsAddingVariant(false);
    setVariantFormData({
      sku: variant.sku,
      slug: variant.slug,
      variant_name: variant.variant_name,
      size: variant.size || "",
      color: variant.color || "",
      color_hex: variant.color_hex || "",
      price: variant.price,
      stock: variant.stock,
    });

    setTimeout(() => {
      variantFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleSaveVariant = async () => {
    if (!id) return;
    setSaving(true);
    try {
      if (isAddingVariant) {
        await productAdminApi.createVariant({
          product_id: id,
          ...variantFormData,
        });
        showToast({ message: "Variant added successfully!", type: "success" });
      } else if (editingVariantId) {
        await productAdminApi.updateVariant(editingVariantId, variantFormData);
        showToast({
          message: "Variant updated successfully!",
          type: "success",
        });
      }
      setIsAddingVariant(false);
      setEditingVariantId(null);
      loadData();
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to save variant",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm("Delete this variant?")) return;
    try {
      await productAdminApi.deleteVariant(variantId);
      showToast({
        message: "Variant deleted successfully!",
        type: "success",
      });
      loadData();
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to delete variant",
        type: "error",
      });
    }
  };

  const handleImageUpload = async (variantId: string, files: FileList) => {
    setUploadingImage(variantId);
    try {
      // Check if variant already has images
      const existingImages = await productAdminApi.getVariantImages(variantId);
      const hasExistingImages = existingImages.length > 0;

      // Upload all files
      const uploads = Array.from(files).map((file, index) =>
        productAdminApi.uploadVariantImage(
          variantId,
          file,
          existingImages.length + index, // Continue display order
          !hasExistingImages && index === 0, // Only set primary if NO existing images
        ),
      );
      await Promise.all(uploads);
      showToast({
        message: `${files.length} image(s) uploaded successfully!`,
        type: "success",
      });
      loadData();
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to upload images",
        type: "error",
      });
    } finally {
      setUploadingImage(null);
    }
  };

  const handleDeleteImage = async (
    imageId: string,
    imageUrl: string,
    variantId: string,
  ) => {
    if (!confirm("Delete this image?")) return;
    try {
      await productAdminApi.deleteVariantImage(imageId, imageUrl, variantId);
      showToast({
        message: "Image deleted successfully!",
        type: "success",
      });

      loadData();
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to delete image",
        type: "error",
      });
    }
  };

  const handleSetPrimaryImage = async (imageId: string, variantId: string) => {
    try {
      await productAdminApi.setPrimaryImage(imageId, variantId);
      showToast({
        message: "Primary image updated!",
        type: "success",
      });
      loadData();
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to set primary image",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#0ABAB5] animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Product not found</p>
          <button
            onClick={() => navigate("/admin/products")}
            className="mt-4 text-[#0ABAB5] hover:underline"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/products")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Products
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Product
          </h1>
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Product Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={productFormData.name}
                onChange={(e) =>
                  setProductFormData({
                    ...productFormData,
                    name: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={productFormData.category_id}
                onChange={(e) =>
                  setProductFormData({
                    ...productFormData,
                    category_id: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5] bg-white"
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
                value={productFormData.display_mode}
                onChange={(e) =>
                  setProductFormData({
                    ...productFormData,
                    display_mode: e.target.value as "grouped" | "individual",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5] bg-white"
              >
                <option value="individual">Individual</option>
                <option value="grouped">Grouped</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={productFormData.description}
                onChange={(e) =>
                  setProductFormData({
                    ...productFormData,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5]"
                rows={3}
              />
            </div>

            <div className="md:col-span-2 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={productFormData.is_featured}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      is_featured: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-[#0ABAB5] border-gray-300 rounded"
                />
                Featured
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={productFormData.is_active}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      is_active: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-[#0ABAB5] border-gray-300 rounded"
                />
                Active
              </label>
            </div>
          </div>
          <button
            onClick={handleSaveProduct}
            disabled={saving}
            className="mt-4 flex items-center gap-2 px-6 py-2 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099490] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            Save Product
          </button>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Variants ({product.variants.length})
            </h2>
            <button
              onClick={handleAddVariant}
              className="flex items-center gap-2 px-4 py-2 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099490]"
            >
              <Plus size={20} />
              Add Variant
            </button>
          </div>

          {/* Variant Form */}
          {(isAddingVariant || editingVariantId) && (
            <div
              ref={variantFormRef}
              className="bg-blue-50 rounded-lg p-4 mb-4"
            >
              <h3 className="font-semibold mb-3">
                {isAddingVariant ? "Add New Variant" : "Edit Variant"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={variantFormData.sku}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        sku: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={variantFormData.variant_name}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        variant_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={variantFormData.slug}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        slug: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., mickey-mouse-xl-red"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const generated = await createVariantSlug(
                        variantFormData.variant_name,
                        variantFormData.color,
                        variantFormData.size,
                        editingVariantId || undefined,
                      );
                      setVariantFormData({
                        ...variantFormData,
                        slug: generated,
                      });
                    }}
                    className="mt-1 text-sm text-[#0ABAB5] hover:underline"
                  >
                    Auto-generate slug
                  </button>
                </div>

                {/* Color Name (Optional) */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Color Name
                  </label>
                  <input
                    type="text"
                    value={variantFormData.color}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        color: e.target.value,
                      })
                    }
                    placeholder="e.g., Purple, Red, Blue"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                {/* Color HEX */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Color HEX
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={variantFormData.color_hex || "#000000"}
                      onChange={(e) =>
                        setVariantFormData({
                          ...variantFormData,
                          color_hex: e.target.value,
                        })
                      }
                      className="w-12 h-10 border rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={variantFormData.color_hex}
                      onChange={(e) =>
                        setVariantFormData({
                          ...variantFormData,
                          color_hex: e.target.value,
                        })
                      }
                      placeholder="#000000"
                      className="flex-1 px-3 py-2 border rounded-lg font-mono"
                      maxLength={7}
                    />
                  </div>
                </div>

                {/* Size (Optional) */}
                <div>
                  <label className="block text-sm font-medium mb-1">Size</label>
                  <input
                    type="text"
                    value={variantFormData.size}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        size: e.target.value,
                      })
                    }
                    placeholder="e.g., S, M, L, XL"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    value={variantFormData.price}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={variantFormData.stock}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSaveVariant}
                  disabled={saving}
                  className="px-4 py-2 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099490] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Variant"}
                </button>
                <button
                  onClick={() => {
                    setIsAddingVariant(false);
                    setEditingVariantId(null);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {/* Variants List */}
          <div className="space-y-3">
            {product.variants.map((variant) => (
              <div key={variant.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{variant.variant_name}</h4>
                    <p className="text-sm text-gray-600">SKU: {variant.sku}</p>
                    <p className="text-sm">
                      Price: Rp {variant.price.toLocaleString()} | Stock:{" "}
                      {variant.stock}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditVariant(variant)}
                      className="p-2 text-[#0ABAB5] hover:bg-teal-50 rounded-lg"
                      title="Edit variant"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteVariant(variant.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete variant"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="mb-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer w-fit">
                    {uploadingImage === variant.id ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Upload Images
                      </>
                    )}
                    <div>
                      <input
                        type="file"
                        id={`upload-${variant.id}`}
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/heif,image/heic"
                        multiple
                        className="hidden"
                        disabled={uploadingImage === variant.id}
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            handleImageUpload(variant.id, files);
                          }
                        }}
                      />
                      <label
                        htmlFor={`upload-${variant.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer w-fit"
                      >
                        {uploadingImage === variant.id ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={18} />
                            Upload Images
                          </>
                        )}
                      </label>
                      <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        HEIF/HEIC images may not display correctly in all
                        browsers
                      </p>
                    </div>
                  </label>
                </div>

                {/* Images Grid */}
                {variant.images && variant.images.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Images ({variant.images.length})
                    </h5>
                    <div className="grid grid-cols-4 gap-2">
                      {variant.images.map((img: any) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.image_url}
                            alt=""
                            className="w-full h-24 object-cover rounded border-2 border-gray-200"
                          />

                          {/* Primary badge */}
                          {img.is_primary && (
                            <span className="absolute top-1 left-1 bg-yellow-400 text-xs font-semibold px-2 py-0.5 rounded">
                              Primary
                            </span>
                          )}

                          {/* Actions (show on hover) */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                            {!img.is_primary && (
                              <button
                                onClick={() =>
                                  handleSetPrimaryImage(img.id, variant.id)
                                }
                                className="bg-yellow-500 text-white p-1.5 rounded text-xs font-medium hover:bg-yellow-600"
                                title="Set as primary"
                              >
                                Set Primary
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleDeleteImage(
                                  img.id,
                                  img.image_url,
                                  variant.id,
                                )
                              }
                              className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600"
                              title="Delete image"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
