// ========== src/pages/admin/orders/OrderDetailPage.tsx ==========
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Package, MapPin, CheckCircle, XCircle } from "lucide-react";
import {
  fetchOrderByIdAdmin,
  getPaymentProofAdmin,
  approvePayment,
  rejectPayment,
  updateOrderStatus,
} from "../../services/order/api";
import type {
  OrderWithItems,
  PaymentProof,
  OrderStatus,
} from "../../services/order/type";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800 border-yellow-300",
  payment_uploaded: "bg-blue-100 text-blue-800 border-blue-300",
  processing: "bg-purple-100 text-purple-800 border-purple-300",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const ORDER_STATUSES: OrderStatus[] = [
  "pending_payment",
  "payment_uploaded",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [paymentProof, setPaymentProof] = useState<PaymentProof | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Add admin notes functionality
  // const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const orderData = await fetchOrderByIdAdmin(orderId!);
      setOrder(orderData);

      // Try to get payment proof
      try {
        const proofData = await getPaymentProofAdmin(orderId!);
        setPaymentProof(proofData);
      } catch {
        // No payment proof yet
        setPaymentProof(null);
      }
    } catch (err: any) {
      console.error("Failed to load order:", err);
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async () => {
    if (
      !confirm(
        "Approve this payment? Order status will be changed to PROCESSING.",
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await approvePayment(orderId!);

      // Add a small delay to ensure database is updated
      await new Promise((resolve) => setTimeout(resolve, 500));

      await loadOrder(); // This should fetch updated payment proof
      alert("Payment approved successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to approve payment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    // TODO: Add admin notes modal/input
    const reason = prompt("Reason for rejection (will be shown to customer):");
    if (!reason) return;

    setActionLoading(true);
    try {
      await rejectPayment(orderId!, reason);
      await loadOrder();
      alert("Payment rejected. Customer has been notified.");
    } catch (err: any) {
      alert(err.message || "Failed to reject payment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (
      !confirm(
        `Change order status to ${newStatus.replace(/_/g, " ").toUpperCase()}?`,
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await updateOrderStatus(orderId!, newStatus);
      await loadOrder();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0ABAB5] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "Order does not exist"}
          </p>
          <button
            onClick={() => navigate("/admin/orders")}
            className="w-full bg-[#0ABAB5] text-white py-3 rounded-lg hover:bg-[#099490] transition"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-6">
      <div className="w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/orders")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Orders</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order {order.order_number}
              </h1>
              <p className="text-gray-600">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            {/* Status Dropdown */}
            <select
              value={order.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as OrderStatus)
              }
              disabled={actionLoading || paymentProof?.status === "pending"} // Disable if payment proof is pending
              className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm cursor-pointer transition ${
                STATUS_COLORS[order.status]
              } ${paymentProof?.status === "pending" ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content: 3/4 Left + 1/4 Right */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Side (3/4) - Order Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Package className="text-[#0ABAB5]" size={24} />
                <h2 className="text-xl font-semibold">Order Items</h2>
              </div>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
                  >
                    <img
                      src={
                        item.variant_snapshot.image_url || "/placeholder.jpg"
                      }
                      alt={item.variant_snapshot.variant_name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {item.variant_snapshot.variant_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.variant_snapshot.size &&
                          `Size: ${item.variant_snapshot.size}`}
                        {item.variant_snapshot.color &&
                          ` • Color: ${item.variant_snapshot.color}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                      <p className="font-bold text-[#0ABAB5]">
                        {formatCurrency(item.price_at_purchase * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-[#0ABAB5]">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="text-[#0ABAB5]" size={24} />
                <h2 className="text-xl font-semibold">Shipping Address</h2>
              </div>
              <div className="space-y-2 text-gray-700">
                <p>
                  <span className="font-semibold">Recipient:</span>{" "}
                  {order.recipient_name}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span> {order.phone}
                </p>
                <p>
                  <span className="font-semibold">Address:</span>
                  <br />
                  {order.address}
                  {order.address_optional && `, ${order.address_optional}`}
                  <br />
                  {order.district}, {order.city}
                  <br />
                  {order.region}, {order.country} {order.postcode}
                </p>
              </div>
            </div>

            {/* TODO: Order Timeline */}
            {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Order Timeline</h2>
              <div className="space-y-3">
                // Timeline items will go here
              </div>
            </div> */}
          </div>

          {/* Right Side (1/4) - Payment Proof */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Payment Proof</h2>

              {!paymentProof ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Package className="text-gray-400" size={32} />
                  </div>
                  <p className="text-sm text-gray-500">
                    No payment proof uploaded yet
                  </p>
                </div>
              ) : (
                <div>
                  {/* Payment Proof Image */}
                  <img
                    src={paymentProof.image_url}
                    alt="Payment proof"
                    className="w-full rounded-lg border border-gray-200 mb-4"
                  />

                  {/* Proof Status */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Status:</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        paymentProof.status === "pending"
                          ? "bg-blue-100 text-blue-800"
                          : paymentProof.status === "verified"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {paymentProof.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Admin Notes */}
                  {paymentProof.admin_notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Admin Notes:</p>
                      <p className="text-sm text-gray-800">
                        {paymentProof.admin_notes}
                      </p>
                    </div>
                  )}

                  {/* Upload Info */}
                  <p className="text-xs text-gray-500 mb-4">
                    Uploaded: {formatDate(paymentProof.uploaded_at)}
                  </p>

                  {/* Action Buttons */}
                  {paymentProof.status === "pending" && (
                    <div className="space-y-2">
                      <button
                        onClick={handleApprovePayment}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>
                      <button
                        onClick={handleRejectPayment}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </div>
                  )}

                  {paymentProof.status === "verified" && (
                    <div className="text-center py-3 bg-green-50 rounded-lg">
                      <CheckCircle
                        className="text-green-600 mx-auto mb-2"
                        size={32}
                      />
                      <p className="text-sm font-semibold text-green-800">
                        Payment Verified
                      </p>
                    </div>
                  )}

                  {paymentProof.status === "rejected" && (
                    <div className="text-center py-3 bg-red-50 rounded-lg">
                      <XCircle
                        className="text-red-600 mx-auto mb-2"
                        size={32}
                      />
                      <p className="text-sm font-semibold text-red-800">
                        Payment Rejected
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
