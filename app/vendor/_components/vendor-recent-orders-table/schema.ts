export const orderFilters = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;

export type OrderFilter = (typeof orderFilters)[number];

export type VendorOrderRow = {
  id: string;
  order_id: string;
  date: string;
  customer: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  subtotal: number;
  commission: number;
  earnings: number;
  items: string;
};
