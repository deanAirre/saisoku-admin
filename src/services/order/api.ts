// ========== src/services/orders/admin-api.ts ==========
import { supabase } from "../api";
import type { OrderWithItems, OrderStatus, PaymentProof } from "./type";

/**
 * Admin: Fetch all orders with pagination and filtering
 */
export const fetchAllOrders = async (params?: {
  status?: OrderStatus;
  page?: number;
  limit?: number;
  searchQuery?: string;
}): Promise<{
  orders: OrderWithItems[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const { status, page = 0, limit = 10, searchQuery } = params || {};

  // Build query
  let query = supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        id,
        order_id,
        variant_id,
        quantity,
        price_at_purchase,
        variant_snapshot,
        created_at
      )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  // Filter by status
  if (status) {
    query = query.eq("status", status);
  }

  // Search by order number or recipient name
  if (searchQuery && searchQuery.trim()) {
    query = query.or(
      `order_number.ilike.%${searchQuery}%,recipient_name.ilike.%${searchQuery}%`,
    );
  }

  // Pagination
  const from = page * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    orders: data || [],
    total,
    page,
    totalPages,
  };
};

/**
 * Admin: Fetch single order by ID (no user restriction)
 */
export const fetchOrderByIdAdmin = async (
  orderId: string,
): Promise<OrderWithItems> => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        id,
        order_id,
        variant_id,
        quantity,
        price_at_purchase,
        variant_snapshot,
        created_at
      )
    `,
    )
    .eq("id", orderId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Admin: Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
): Promise<OrderWithItems> => {
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select(
      `
      *,
      order_items (
        id,
        order_id,
        variant_id,
        quantity,
        price_at_purchase,
        variant_snapshot,
        created_at
      )
    `,
    )
    .single();

  if (error) throw error;
  return data;
};

/**
 * Admin: Get payment proof for an order
 */
/**
 * Admin: Get payment proof for an order
 */
export const getPaymentProofAdmin = async (
  orderId: string,
): Promise<PaymentProof | null> => {
  // First, get the payment proof record
  const { data, error } = await supabase
    .from("payment_proofs")
    .select("*")
    .eq("order_id", orderId)
    .order("uploaded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching payment proof:", error);
    throw error;
  }

  if (!data) {
    console.log("No payment proof found for order:", orderId);
    return null;
  }

  console.log("Payment proof data:", data);

  // Extract file path from URL
  // The bucket name is OrderReceipts (case-sensitive!)
  const bucketName = "OrderReceipts";

  // Try different URL patterns
  let imagePath = "";

  // Pattern 1: /storage/v1/object/public/OrderReceipts/path
  if (data.image_url.includes("/storage/v1/object/public/OrderReceipts/")) {
    imagePath = data.image_url.split(
      "/storage/v1/object/public/OrderReceipts/",
    )[1];
  }
  // Pattern 2: /storage/v1/object/OrderReceipts/path (no 'public')
  else if (data.image_url.includes("/storage/v1/object/OrderReceipts/")) {
    imagePath = data.image_url.split("/storage/v1/object/OrderReceipts/")[1];
  }

  if (!imagePath) {
    console.error("Could not extract path from URL:", data.image_url);
    return data; // Return with original URL
  }

  console.log("Extracted image path:", imagePath);

  // Generate signed URL
  const { data: signedUrlData, error: urlError } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(imagePath, 3600);

  if (urlError) {
    console.error("Failed to create signed URL:", urlError);
    return data;
  }

  console.log("Signed URL generated successfully");

  return {
    ...data,
    image_url: signedUrlData.signedUrl,
  };
};

/**
 * Admin: Approve payment proof
 */
export const approvePayment = async (
  orderId: string,
  adminNotes?: string,
): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Update payment proof status
  const { error: proofError } = await supabase
    .from("payment_proofs")
    .update({
      status: "verified",
      verified_at: new Date().toISOString(),
      verified_by: user.id,
      admin_notes: adminNotes,
    })
    .eq("order_id", orderId);

  if (proofError) throw proofError;

  // Update order status to processing
  const { error: orderError } = await supabase
    .from("orders")
    .update({
      status: "processing",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (orderError) throw orderError;
};

/**
 * Admin: Reject payment proof
 */
export const rejectPayment = async (
  orderId: string,
  adminNotes: string,
): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Update payment proof status
  const { error: proofError } = await supabase
    .from("payment_proofs")
    .update({
      status: "rejected",
      verified_at: new Date().toISOString(),
      verified_by: user.id,
      admin_notes: adminNotes,
    })
    .eq("order_id", orderId);

  if (proofError) throw proofError;

  // Update order status back to pending_payment
  const { error: orderError } = await supabase
    .from("orders")
    .update({
      status: "pending_payment",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (orderError) throw orderError;
};

/**
 * Admin: Mark order as shipped
 */
export const markAsShipped = async (orderId: string): Promise<void> => {
  await updateOrderStatus(orderId, "shipped");
};

/**
 * Admin: Get order statistics
 */
export const getOrderStats = async (): Promise<{
  total: number;
  pending_payment: number;
  payment_uploaded: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}> => {
  const { data, error } = await supabase.from("orders").select("status");

  if (error) throw error;

  const stats = {
    total: data.length,
    pending_payment: 0,
    payment_uploaded: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  data.forEach((order) => {
    const status = order.status as OrderStatus;
    if (status in stats) {
      stats[status]++;
    }
  });

  return stats;
};
