export type Language = 'en' | 'bn';

export type GenderCategory = 'men' | 'women' | 'unisex';

export type MenSubCategory = 'T-Shirt' | 'Shirt' | 'Polo' | 'Pants' | 'Hoodie';
export type WomenSubCategory = 'T-Shirt' | 'Shirt' | 'Dress' | 'Pants' | 'Hoodie' | 'Traditional';

export type SubCategory = MenSubCategory | WomenSubCategory;

export interface Product {
  id: string;
  name: string;
  nameBn?: string;
  gender: GenderCategory;
  category: SubCategory;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  description: string;
  descriptionBn?: string;
  images: string[];
  colors: string[]; // e.g. ['Black', 'White', 'Navy']
  sizes: string[];  // e.g. ['S', 'M', 'L', 'XL', 'XXL']
  stock: number;
  inStock: boolean;
  isTrending?: boolean;
  isBestSelling?: boolean;
  isNewAdded?: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export type PaymentMethod = 'bKash' | 'Nagad' | 'COD';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';

export interface CustomerAddress {
  fullName: string;
  mobileNumber: string;
  division: string;
  district: string;
  upazila: string;
  village: string;
  houseNumber: string;
  optionalDetails?: string;
}

export interface Order {
  id: string; // e.g. SS-98231
  customer: CustomerAddress;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  status: OrderStatus;
  createdAt: string;
}

export interface SiteSettings {
  adminPhone: string;
  adminWhatsapp: string;
  adminEmail: string;
  bkashNumber: string;
  nagadNumber: string;
  deliveryFeeInsideDhaka: number;
  deliveryFeeOutsideDhaka: number;
}
