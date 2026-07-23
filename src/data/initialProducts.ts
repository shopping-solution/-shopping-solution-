import { Product, SiteSettings } from '../types';

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  adminPhone: '+8801712345678',
  adminWhatsapp: '+8801712345678',
  adminEmail: 'admin@shoppingsolution.com',
  bkashNumber: '01712345678',
  nagadNumber: '01812345678',
  deliveryFeeInsideDhaka: 70,
  deliveryFeeOutsideDhaka: 130,
};

export const INITIAL_PRODUCTS: Product[] = [
  // --- MEN PRODUCTS ---
  {
    id: 'prod-m1',
    name: 'Monogram Luxe Heavyweight Crewneck T-Shirt',
    nameBn: 'মোনোগ্রাম লাক্স হেভিওয়েট টি-শার্ট',
    gender: 'men',
    category: 'T-Shirt',
    price: 1250,
    oldPrice: 1650,
    discountPercent: 24,
    description: 'Crafted from 240 GSM 100% organic combed cotton with double-needle tailoring and minimal gold monogram embroidery on left chest. Ultra soft, breathable, and pre-shrunk for an enduring regal fit.',
    descriptionBn: '২৪০ জিএসএম ১০০% অর্গানিক কম্বড কটন দিয়ে তৈরি অতি মনমুগ্ধকর টি-শার্ট। গোল্ড মোনোগ্রাম এম্ব্রয়ডারি এবং প্রিমিয়াম ফিনিশিং যা দৈনন্দিন ব্যবহারে অসাধারণ আভিজাত্য এনে দেয়।',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800'
    ],
    colors: ['Black', 'White', 'Olive', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 45,
    inStock: true,
    isTrending: true,
    isBestSelling: true,
    isNewAdded: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-m2',
    name: 'Executive Slim-Fit Italian Oxford Shirt',
    nameBn: 'এক্সিকিউটিভ স্লিম-ফিট অক্সফোর্ড শার্ট',
    gender: 'men',
    category: 'Shirt',
    price: 2450,
    oldPrice: 2950,
    discountPercent: 17,
    description: 'Features fine Italian weave oxford cotton, formal spread collar, pearl finish buttons, and tailored cuff sleeves. Designed for high-stakes business meetings and evening galas.',
    descriptionBn: 'ইতালিয়ান উইভ অক্সফোর্ড কটন দিয়ে তৈরি নিখুঁত এক্সিকিউটিভ শার্ট। মিটিং বা বিশেষ অনুষ্ঠানে মার্জিত লুকের জন্য অতুলনীয়।',
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800'
    ],
    colors: ['Sky Blue', 'White', 'Charcoal'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    stock: 28,
    inStock: true,
    isTrending: true,
    isBestSelling: true,
    isNewAdded: false,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'prod-m3',
    name: 'Signature Pique Cotton Premium Polo Shirt',
    nameBn: 'সিগনেচার পিক কটন প্রিমিয়াম পোলো শার্ট',
    gender: 'men',
    category: 'Polo',
    price: 1550,
    oldPrice: 1950,
    discountPercent: 20,
    description: 'Classic pique textured knit with reinforced collar band, ribbed sleeve cuffs, and metallic emblem. Offers exceptional air flow and understated luxury for weekend retreats.',
    descriptionBn: 'ক্লাসিক পিক টেক্সচার্ড কটন দ্বারা তৈরি পোলো শার্ট। আরামদায়ক ফিটিং ও স্পোর্টি লাক্সারি মেজাজ।',
    images: [
      'https://images.unsplash.com/photo-1625910513413-81816e812543?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&q=80&w=800'
    ],
    colors: ['Maroon', 'Navy', 'Forest Green', 'Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 35,
    inStock: true,
    isTrending: false,
    isBestSelling: true,
    isNewAdded: true,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'prod-m4',
    name: 'Tailored Stretch Chino Trousers Pants',
    nameBn: 'টেইলরড স্ট্রেচ চিনো প্যান্ট',
    gender: 'men',
    category: 'Pants',
    price: 2150,
    oldPrice: 2600,
    discountPercent: 17,
    description: 'Cotton-twill blend with 3% spandex flexibility, deep slanted pockets, and clean flat-front styling. Perfect transition pant from workday meetings to dinner dates.',
    descriptionBn: 'ফ্লেক্সিবল কটন-টুইল মেটেরিয়াল দিয়ে তৈরি সুবিন্যস্ত প্রিমিয়াম চিনো প্যান্ট। অসাধারণ ফিটিং ও আরাম।',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800'
    ],
    colors: ['Khaki', 'Navy', 'Dark Grey', 'Olive'],
    sizes: ['30', '32', '34', '36', '38'],
    stock: 22,
    inStock: true,
    isTrending: true,
    isBestSelling: false,
    isNewAdded: true,
    createdAt: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 'prod-m5',
    name: 'Velvet-Lined Pullover Fleece Hoodie',
    nameBn: 'ভেলভেট-লাইন্ড পুলওভার ফ্লিস হুডি',
    gender: 'men',
    category: 'Hoodie',
    price: 2850,
    oldPrice: 3500,
    discountPercent: 18,
    description: 'Heavyweight thermal winter fleece with brushed ultra-soft interior, metal drawstring tips, kangaroo pocket, and double-layered hood structure.',
    descriptionBn: 'শীতের জন্য সেরা থার্মাল ফ্লিস ব্রাশড হুডি। আধুনিক ক্যাজুয়াল স্টাইলের সাথে পরম উষ্ঞতা।',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=800'
    ],
    colors: ['Jet Black', 'Heather Grey', 'Burgundy'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    stock: 19,
    inStock: true,
    isTrending: true,
    isBestSelling: true,
    isNewAdded: true,
    createdAt: new Date(Date.now() - 345600000).toISOString()
  },

  // --- WOMEN PRODUCTS ---
  {
    id: 'prod-w1',
    name: 'Royale Silk Embroidered Kurti & Palazzo Set',
    nameBn: 'রয়্যাল সিল্ক এম্ব্রয়ডারি কার্তি ও প্লাজো সেট',
    gender: 'women',
    category: 'Traditional',
    price: 3850,
    oldPrice: 4800,
    discountPercent: 20,
    description: 'Pure Georgette silk base embellished with intricate zari work along neckline and wrist cuffs. Paired with wide-leg palazzo pants and organza dupatta.',
    descriptionBn: 'খাঁটি জর্জেট সিল্কের জমকালো জারদৌসী ও জারি ওয়ার্ক করা থ্রি-পিস সেট। বিয়ে বা বিশেষ উদযাপনে অতুলনীয়।',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'
    ],
    colors: ['Emerald Green', 'Maroon Gold', 'Royal Blue'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 15,
    inStock: true,
    isTrending: true,
    isBestSelling: true,
    isNewAdded: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-w2',
    name: 'Modern Flowing Satin Evening Wrap Dress',
    nameBn: 'মডার্ন ফ্লোয়িং স্যাটিন ইভনিং র্যাপ ড্রেস',
    gender: 'women',
    category: 'Dress',
    price: 3200,
    oldPrice: 3950,
    discountPercent: 19,
    description: 'Elegant v-neck wrap style gown crafted in luminous mulberry satin. Features adjustable waist tie belt, subtle side slit, and graceful bell sleeves.',
    descriptionBn: 'শাইন স্যাটিন ফেব্রিকের মনমুগ্ধকর আধুনিক উইমেনস ড্রেস। নিখুঁত সেলাই ও আরামদায়ক কাটিং।',
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=800'
    ],
    colors: ['Champagne Gold', 'Ruby Red', 'Midnight Navy'],
    sizes: ['S', 'M', 'L'],
    stock: 12,
    inStock: true,
    isTrending: true,
    isBestSelling: false,
    isNewAdded: true,
    createdAt: new Date(Date.now() - 50000000).toISOString()
  },
  {
    id: 'prod-w3',
    name: 'Soft Linen Oversized Casual Women Shirt',
    nameBn: 'সফট লিনেন ওভারসাইজড উইমেনস শার্ট',
    gender: 'women',
    category: 'Shirt',
    price: 1850,
    oldPrice: 2250,
    discountPercent: 18,
    description: '100% natural breathable linen fabric in an oversized relaxed silhouette. Features high-low hem, mother of pearl buttons, and chest pocket.',
    descriptionBn: '১০০% ন্যাচারাল সফ্‌ট লিনেন কাপড়ের ক্যাজুয়াল লেডিস শার্ট। গ্রীষ্ম ও বসন্তের জন্য অত্যন্ত আরামদায়ক।',
    images: [
      'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=800'
    ],
    colors: ['Off White', 'Pastel Pink', 'Sage Green'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 25,
    inStock: true,
    isTrending: false,
    isBestSelling: true,
    isNewAdded: true,
    createdAt: new Date(Date.now() - 100000000).toISOString()
  },
  {
    id: 'prod-w4',
    name: 'High-Waist Tailored Wide-Leg Trousers',
    nameBn: 'হাই-ওয়েস্ট টেইলরড ওয়াইড-লেগ প্যান্ট',
    gender: 'women',
    category: 'Pants',
    price: 2250,
    oldPrice: 2750,
    discountPercent: 18,
    description: 'Chic tailored wide-leg pants crafted with front pleats, comfortable stretch inner waistband, and side pockets. Clean feminine cut for sophisticated office wear.',
    descriptionBn: 'অভিজাত ডিজাইনের হাই-ওয়েস্ট ওয়াইড লেগ ট্রাউজার্স। নিখুঁত পলিশড ফিনিশিং।',
    images: [
      'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800'
    ],
    colors: ['Beige', 'Black', 'Dusty Rose'],
    sizes: ['26', '28', '30', '32'],
    stock: 18,
    inStock: true,
    isTrending: true,
    isBestSelling: true,
    isNewAdded: false,
    createdAt: new Date(Date.now() - 150000000).toISOString()
  },
  {
    id: 'prod-w5',
    name: 'Cropped Cozy Fleece Women Hoodie',
    nameBn: 'ক্রপড কোজি ফ্লিস উইমেনস হুডি',
    gender: 'women',
    category: 'Hoodie',
    price: 2450,
    oldPrice: 2950,
    discountPercent: 17,
    description: 'Trendy cropped length hoodie with brushed fleece lining, drop shoulders, ribbed cuffs, and minimal aesthetic branding.',
    descriptionBn: 'ট্রেন্ডি ক্রপড কাট উইমেনস হুডি। অত্যন্ত আরামদায়ক ফেব্রিক ও আধুনিক এস্টেটিক লুক।',
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&q=80&w=800'
    ],
    colors: ['Lilac', 'Cream', 'Charcoal'],
    sizes: ['S', 'M', 'L'],
    stock: 20,
    inStock: true,
    isTrending: true,
    isBestSelling: false,
    isNewAdded: true,
    createdAt: new Date(Date.now() - 200000000).toISOString()
  }
];
