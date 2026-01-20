import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  ChevronDown,
  ChevronUp,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { productAdminApi } from "../../services/products/api";
import type { ProductWithVariantsAdmin } from "../../services/products/type";

export default function AdminProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductWithVariantsAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productAdminApi.getAllProductsAdmin();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Delete product "${productName}"? This cannot be undone.`))
      return;

    try {
      await productAdminApi.deleteProduct(productId);
      alert("Product deleted successfully!");
      loadProducts();
    } catch (error: any) {
      console.error("Failed to delete product:", error);
      alert(error.message || "Failed to delete product");
    }
  };

  const toggleExpand = (productId: string) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get unique categories for filter
  const categories = [
    "all",
    ...new Set(products.map((p) => p.category_name).filter(Boolean)),
  ];

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category_name === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
            <p className="text-gray-600">
              Manage your product catalog and variants
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/products/new")}
            className="flex items-center gap-2 px-6 py-3 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099490] transition font-semibold"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ABAB5] bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No products found</p>
              <button
                onClick={() => navigate("/admin/products/new")}
                className="mt-4 px-6 py-2 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099490] transition"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Display Mode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const isExpanded = expandedProduct === product.id;
                    const totalStock = product.variants.reduce(
                      (sum, v) => sum + v.stock,
                      0,
                    );

                    return (
                      <>
                        {/* Product Row */}
                        <tr
                          key={product.id}
                          className={`hover:bg-gray-50 transition ${
                            !product.is_active ? "bg-gray-100 opacity-60" : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleExpand(product.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {isExpanded ? (
                                  <ChevronUp size={20} />
                                ) : (
                                  <ChevronDown size={20} />
                                )}
                              </button>
                              <div>
                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                  {product.name}
                                  {/* ADD THIS BADGE */}
                                  {!product.is_active && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                                      INACTIVE
                                    </span>
                                  )}
                                </div>
                                {product.is_featured && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>{" "}
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {product.category_name || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {product.variants.length} variant(s)
                              </div>
                              <div className="text-gray-500">
                                Stock: {totalStock}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                product.display_mode === "grouped"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {product.display_mode === "grouped"
                                ? "Grouped"
                                : "Individual"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {product.is_active ? (
                              <span className="flex items-center gap-1 text-green-600 text-sm">
                                <Eye size={16} />
                                Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-gray-400 text-sm">
                                <EyeOff size={16} />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/admin/products/${product.id}/edit`)
                                }
                                className="p-2 text-[#0ABAB5] hover:bg-teal-50 rounded-lg transition"
                                title="Edit product"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(product.id, product.name)
                                }
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete product"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Variants */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 bg-gray-50">
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900 mb-3">
                                  Variants ({product.variants.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {product.variants.map((variant) => (
                                    <div
                                      key={variant.id}
                                      className="bg-white border border-gray-200 rounded-lg p-3"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <div className="font-medium text-sm text-gray-900">
                                            {variant.variant_name}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            SKU: {variant.sku}
                                          </div>
                                        </div>
                                        {variant.color_hex && (
                                          <div
                                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                                            style={{
                                              backgroundColor:
                                                variant.color_hex,
                                            }}
                                          />
                                        )}
                                      </div>
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-[#0ABAB5] font-semibold">
                                          {formatPrice(variant.price)}
                                        </span>
                                        <span
                                          className={`${
                                            variant.stock > 10
                                              ? "text-green-600"
                                              : variant.stock > 0
                                                ? "text-orange-600"
                                                : "text-red-600"
                                          }`}
                                        >
                                          Stock: {variant.stock}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
