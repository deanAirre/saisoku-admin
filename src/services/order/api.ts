import { supabase } from "../api";
import type { OrderWithItems, OrderStatus } from "./type";

// 1. Fetch ALL orders (removes user_id filter)
export const fetchAllOrders = async (
  status?: OrderStatus,
): Promise<OrderWithItems[]> => {
  let query = supabase
    .from("orders")
    .select(`*, order_items(*)`)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// 2. Fetch order by ID (removes user_id check)
export const fetchOrderByIdAdmin = async (
  orderId: string,
): Promise<OrderWithItems> => {
  const { data, error } = await supabase
    .from("orders")
    .select(`*, order_items(*), payment_proofs(*)`)
    .eq("id", orderId)
    .single();

  if (error) throw error;
  return data;
};

// 3. Update order status
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
): Promise<void> => {
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) throw error;
};
