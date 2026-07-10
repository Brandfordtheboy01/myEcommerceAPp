import { z } from "zod";

export const shippingAddressSchema = z.object({
  fullname: z.string().min(2),
  phone: z.string().min(7),
  street: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2),
  country: z.string().min(2),
  postal_code: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  category_id: z.string().uuid().optional().nullable(),
  image_url: z.string().url().optional(),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
      })
    )
    .min(1),
  shipping_address: shippingAddressSchema,
  coupon_code: z.string().optional(),
});

function emptyToUndefined(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export const vendorRegisterSchema = z.object({
  business_name: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z.string().min(2, "Business name is required")
  ),
  business_description: z.preprocess(emptyToUndefined, z.string().optional()),
  business_email: z.preprocess(
    emptyToUndefined,
    z.string().email("Invalid business email").optional()
  ),
  business_phone: z.preprocess(emptyToUndefined, z.string().optional()),
  tax_id: z.preprocess(emptyToUndefined, z.string().optional()),
});

export const updateVendorOrderStatusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
  tracking_number: z.string().optional(),
  shipping_method: z.string().optional(),
  notes: z.string().optional(),
});

export const createCouponSchema = z.object({
  code: z.string().min(3).max(32).transform((v) => v.toUpperCase()),
  discount: z.number().positive(),
  discount_type: z.enum(["percentage", "fixed"]),
  expiry_date: z.string().optional().nullable(),
  usage_limit: z.number().int().positive().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.discount_type === "percentage" && data.discount > 100) {
    ctx.addIssue({
      code: "custom",
      message: "Percentage discount cannot exceed 100",
      path: ["discount"],
    });
  }
});

export const validateCouponSchema = z.object({
  code: z.string().min(1),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
      })
    )
    .min(1),
});
