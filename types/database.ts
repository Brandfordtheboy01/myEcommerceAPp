export type UserRole = "customer" | "admin" | "vendor";

export type VendorStatus = "pending" | "approved" | "suspended" | "rejected";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface User {
  id: string;
  fullname: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Vendor {
  id: string;
  business_name: string;
  business_description: string | null;
  business_email: string | null;
  business_phone: string | null;
  business_address: Record<string, string> | null;
  tax_id: string | null;
  logo_url: string | null;
  status: VendorStatus;
  commission_rate: number;
  balance: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: string | null;
  vendor_id: string | null;
  created_at: string;
  updated_at: string;
  categories?: Category | null;
  product_images?: ProductImage[];
  vendors?: Pick<Vendor, "id" | "business_name" | "status"> | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  subtotal_amount: number | null;
  discount_amount: number;
  shipping_amount: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  shipping_address: ShippingAddress | null;
  payment_method: string | null;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  vendor_order_id: string | null;
  products?: Product;
}

export interface VendorOrder {
  id: string;
  order_id: string;
  vendor_id: string;
  subtotal: number;
  commission_amount: number;
  vendor_earnings: number;
  status: OrderStatus;
  shipping_method: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  fullname: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
}

export interface ProductReviewStats {
  product_id: string;
  average_rating: number;
  review_count: number;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: Product;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  users?: Pick<User, "fullname" | "email">;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  discount_type: "percentage" | "fixed";
  expiry_date: string | null;
  is_active: boolean;
  usage_limit: number | null;
  usage_count: number;
  created_at: string;
}
