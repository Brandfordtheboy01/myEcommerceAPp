// Admin order filters — focused on payment status (admin doesn't manage fulfillment)
export const orderFilters = ["All", "Needs action", "Unpaid", "Returns"] as const;

export type OrderFilter = (typeof orderFilters)[number];

export type OrderRow = {
  id: string;
  date: string;
  customer: string;
  payment: "Paid" | "Pending" | "Refunded";
  total: string;         // total_amount formatted
  commission: string;    // admin commission earned
  vendorCount: number;   // how many vendors involved
};
