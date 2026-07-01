-- =============================================
-- SEED: CATEGORIES + PRODUCTS ONLY
-- Run this in Supabase SQL Editor
-- Vendor ID: 19be7177-07b1-4ea0-8288-a1e553fc078e
-- =============================================

-- 1. CREATE CATEGORIES
INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Smartphones, laptops, accessories, and gadgets'),
  ('Clothing', 'Fashion apparel for men, women, and children'),
  ('Home & Kitchen', 'Furniture, appliances, and home decor'),
  ('Books', 'Fiction, non-fiction, textbooks, and e-books'),
  ('Beauty & Personal Care', 'Skincare, makeup, and grooming products'),
  ('Sports & Outdoors', 'Fitness equipment, camping gear, and sportswear')
ON CONFLICT (name) DO NOTHING;

-- 2. ADD PRODUCTS
DO $$
DECLARE
  vendor_id UUID := '19be7177-07b1-4ea0-8288-a1e553fc078e';
  electronics_id UUID;
  clothing_id UUID;
  home_id UUID;
  books_id UUID;
  beauty_id UUID;
  sports_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO electronics_id FROM categories WHERE name = 'Electronics';
  SELECT id INTO clothing_id FROM categories WHERE name = 'Clothing';
  SELECT id INTO home_id FROM categories WHERE name = 'Home & Kitchen';
  SELECT id INTO books_id FROM categories WHERE name = 'Books';
  SELECT id INTO beauty_id FROM categories WHERE name = 'Beauty & Personal Care';
  SELECT id INTO sports_id FROM categories WHERE name = 'Sports & Outdoors';

  -- Electronics
  INSERT INTO products (name, description, price, stock, category_id, vendor_id) VALUES
    ('Wireless Bluetooth Headphones', 'Over-ear headphones with noise cancellation and 30hr battery life', 79.99, 50, electronics_id, vendor_id),
    ('Smartphone 5G', '6.5" display, 128GB storage, dual camera, latest Android', 599.99, 25, electronics_id, vendor_id),
    ('USB-C Charging Hub', '7-in-1 USB-C hub with HDMI, Ethernet, and SD card reader', 49.99, 100, electronics_id, vendor_id);

  -- Clothing
  INSERT INTO products (name, description, price, stock, category_id, vendor_id) VALUES
    ('Classic Denim Jeans', 'Slim-fit jeans with stretch comfort, available in blue and black', 45.99, 80, clothing_id, vendor_id),
    ('Cotton Crew T-Shirt', '100% organic cotton, breathable fabric for everyday wear', 19.99, 150, clothing_id, vendor_id),
    ('Winter Puffer Jacket', 'Water-resistant, insulated jacket for cold weather', 89.99, 35, clothing_id, vendor_id);

  -- Home & Kitchen
  INSERT INTO products (name, description, price, stock, category_id, vendor_id) VALUES
    ('Non-Stick Cookware Set', '10-piece set with pots, pans, and lids', 129.99, 20, home_id, vendor_id),
    ('Smart LED Bulb', 'Color-changing WiFi bulb, compatible with Alexa and Google Home', 24.99, 60, home_id, vendor_id),
    ('Bamboo Cutting Board', 'Eco-friendly, durable bamboo board with juice groove', 29.99, 45, home_id, vendor_id);

  -- Books
  INSERT INTO products (name, description, price, stock, category_id, vendor_id) VALUES
    ('The Entrepreneur Mindset', 'Practical guide to starting and scaling your business', 24.99, 40, books_id, vendor_id),
    ('Modern Web Development', 'Full-stack development with React, Next.js, and TypeScript', 39.99, 30, books_id, vendor_id);

  -- Beauty & Personal Care
  INSERT INTO products (name, description, price, stock, category_id, vendor_id) VALUES
    ('Organic Face Serum', 'Vitamin C and hyaluronic acid for glowing skin', 34.99, 55, beauty_id, vendor_id),
    ('Natural Shampoo Bar', 'Sulfate-free, zero-waste shampoo for all hair types', 14.99, 70, beauty_id, vendor_id);

  -- Sports & Outdoors
  INSERT INTO products (name, description, price, stock, category_id, vendor_id) VALUES
    ('Yoga Mat', 'Non-slip, eco-friendly mat with alignment lines', 29.99, 40, sports_id, vendor_id),
    ('Camping Tent 4-Person', 'Waterproof, easy-setup tent for family camping trips', 159.99, 15, sports_id, vendor_id),
    ('Resistance Bands Set', '5-level resistance bands for home workouts', 22.99, 60, sports_id, vendor_id);
END $$;

-- 3. VERIFY
SELECT 'Categories added:' as info, COUNT(*) as count FROM categories;
SELECT 'Products added:' as info, COUNT(*) as count FROM products;