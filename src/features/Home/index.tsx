import { useEffect, useState } from "react";
import { useAdmin } from "../../context/admin-context";
import { Clock, Package, ShoppingBag } from "lucide-react";
import { getOrderStats } from "../../services/order/api";

function Home() {
  const { admin } = useAdmin();
  const [stats, setStats] = useState({
    total: 0,
    pending_payment: 0,
    payment_uploaded: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getOrderStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch order stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-48 bg-gray-200 rounded-xl"></div>
            <div className="h-48 bg-gray-200 rounded-xl"></div>
            <div className="h-48 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {admin?.name || "Admin"}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* First Row - Orders Overview (Full Width) */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#0ABAB5] bg-opacity-10 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-[#FFFFFF]" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Orders Overview
              </h2>
              <p className="text-sm text-gray-600">Total orders in system</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-4xl font-bold text-gray-900">
              {stats.total}
            </div>
            <p className="text-sm text-gray-600 mt-1">Total Orders</p>
          </div>

          {/* Order Status Breakdown */}
          <div className="flex flex-wrap gap-2">
            <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200 flex-1 min-w-[140px]">
              <div className="text-xl font-bold text-yellow-700">
                {stats.pending_payment}
              </div>
              <div className="text-xs text-yellow-600">Pending Payment</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-200 flex-1 min-w-[140px]">
              <div className="text-xl font-bold text-blue-700">
                {stats.payment_uploaded}
              </div>
              <div className="text-xs text-blue-600">Payment Uploaded</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-2 border border-purple-200 flex-1 min-w-[140px]">
              <div className="text-xl font-bold text-purple-700">
                {stats.processing}
              </div>
              <div className="text-xs text-purple-600">Processing</div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-200 flex-1 min-w-[140px]">
              <div className="text-xl font-bold text-indigo-700">
                {stats.shipped}
              </div>
              <div className="text-xs text-indigo-600">Shipped</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2 border border-green-200 flex-1 min-w-[140px]">
              <div className="text-xl font-bold text-green-700">
                {stats.delivered}
              </div>
              <div className="text-xs text-green-600">Delivered</div>
            </div>
            <div className="bg-red-50 rounded-lg p-2 border border-red-200 flex-1 min-w-[140px]">
              <div className="text-xl font-bold text-red-700">
                {stats.cancelled}
              </div>
              <div className="text-xs text-red-600">Cancelled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row - Products and Last Login (Equal Height) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#0ABAB5] rounded-lg flex items-center justify-center">
              <Package className="text-[#FFFFFF]" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Products</h2>
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-2">-</div>
          <p className="text-sm text-gray-600">Coming soon</p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Product management will be available here
            </p>
          </div>
        </div>

        {/* Last Login Card */}
        <div className="bg-[#0ABAB5]  rounded-xl shadow-sm p-6 text-white hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Clock className="text-[#0ABAB5]" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Last Login</h2>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm opacity-90">Admin</p>
              <p className="text-lg font-semibold">{admin?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Email</p>
              <p className="text-sm font-medium">{admin?.email || "N/A"}</p>
            </div>
            <div className="pt-3 border-t border-white border-opacity-20">
              <p className="text-xs opacity-75">Account created</p>
              <p className="text-sm font-medium">
                {admin?.createdAt ? formatDate(admin.createdAt) : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
