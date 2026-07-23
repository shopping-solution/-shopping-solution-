import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nameBn: text('name_bn'),
  gender: text('gender').notNull(),
  category: text('category').notNull(),
  price: integer('price').notNull(),
  oldPrice: integer('old_price'),
  discountPercent: integer('discount_percent'),
  description: text('description').notNull(),
  descriptionBn: text('description_bn'),
  images: jsonb('images').$type<string[]>().notNull(),
  colors: jsonb('colors').$type<string[]>().notNull(),
  sizes: jsonb('sizes').$type<string[]>().notNull(),
  stock: integer('stock').notNull(),
  inStock: boolean('in_stock').notNull().default(true),
  isTrending: boolean('is_trending').default(false),
  isBestSelling: boolean('is_best_selling').default(false),
  isNewAdded: boolean('is_new_added').default(false),
  createdAt: text('created_at').notNull(),
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  customer: jsonb('customer').notNull(),
  items: jsonb('items').notNull(),
  subtotal: integer('subtotal').notNull(),
  deliveryFee: integer('delivery_fee').notNull(),
  totalAmount: integer('total_amount').notNull(),
  paymentMethod: text('payment_method').notNull(),
  transactionId: text('transaction_id'),
  status: text('status').notNull().default('Pending'),
  createdAt: text('created_at').notNull(),
});

export const siteSettings = pgTable('site_settings', {
  id: text('id').primaryKey().default('default'),
  adminPhone: text('admin_phone').notNull(),
  adminWhatsapp: text('admin_whatsapp').notNull(),
  adminEmail: text('admin_email').notNull(),
  bkashNumber: text('bkash_number').notNull(),
  nagadNumber: text('nagad_number').notNull(),
  deliveryFeeInsideDhaka: integer('delivery_fee_inside_dhaka').notNull(),
  deliveryFeeOutsideDhaka: integer('delivery_fee_outside_dhaka').notNull(),
});
