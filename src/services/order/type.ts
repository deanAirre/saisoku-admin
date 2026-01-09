export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  total_amount: number;
  status: OrderStatus;
  recipient_name: string;
  phone: string;
  country: string;
  region: string;
  district: string;
  city: string;
  address: string;
  address_optional?: string;
  postcode: string;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | "pending_payment"
  | "payment_uploaded"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
  price_at_purchase: number;
  variant_snapshot: VariantSnapshot;
  created_at: string;
}

export interface VariantSnapshot {
  variant_name: string;
  size?: string;
  color?: string;
  image_url?: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface PaymentProof {
  id: string;
  order_id: string;
  image_url: string;
  status: PaymentStatus;
  admin_notes?: string;
  uploaded_at: string;
  verified_at?: string;
  verified_by?: string;
}

export type PaymentStatus = "pending" | "verified" | "rejected";

export interface CreateOrderRequest {
  cart_item_ids?: string[];
  variant_id?: string;
  quantity?: number;
  shipping_address: ShippingAddress;
}

export interface ShippingAddress {
  recipient_name: string;
  phone: string;
  country: string;
  region: string;
  city: string;
  district: string;
  address: string;
  address_optional?: string;
  postcode: string;
}

export interface UploadPaymentProofRequest {
  order_id: string;
  image_file: File;
}
