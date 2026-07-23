import { Product, Order, SiteSettings, Language, CartItem } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SITE_SETTINGS } from '../data/initialProducts';

const STORAGE_KEYS = {
  PRODUCTS: 'shoppingsolution_products_v1',
  ORDERS: 'shoppingsolution_orders_v1',
  SETTINGS: 'shoppingsolution_settings_v1',
  CART: 'shoppingsolution_cart_v1',
  LANGUAGE: 'shoppingsolution_lang_v1',
  ADMIN_SESSION: 'shoppingsolution_admin_v1',
};

// Initialize / retrieve Products
export const getStoredProducts = (): Product[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to parse products from storage:', e);
  }
  // Save initial fallback
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
};

export const saveStoredProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products:', e);
  }
};

// Retrieve / Save Site Settings
export const getStoredSettings = (): SiteSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to parse settings:', e);
  }
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SITE_SETTINGS));
  return INITIAL_SITE_SETTINGS;
};

export const saveStoredSettings = (settings: SiteSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

// Retrieve / Save Orders
export const getStoredOrders = (): Order[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to parse orders:', e);
  }
  return [];
};

export const saveStoredOrders = (orders: Order[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders:', e);
  }
};

// Cart
export const getStoredCart = (): CartItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CART);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse cart:', e);
  }
  return [];
};

export const saveStoredCart = (cart: CartItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart:', e);
  }
};

// Language preference
export const getStoredLanguage = (): Language => {
  try {
    const lang = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language;
    if (lang === 'bn' || lang === 'en') return lang;
  } catch (e) {
    console.error('Failed to parse language:', e);
  }
  return 'en';
};

export const saveStoredLanguage = (lang: Language): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  } catch (e) {
    console.error('Failed to save language:', e);
  }
};

// Admin session
export const isAdminLoggedIn = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
  } catch (e) {
    return false;
  }
};

export const setAdminLoggedIn = (status: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, status ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to set admin session:', e);
  }
};

// Reset all seed data
export const restoreDefaults = (): { products: Product[]; settings: SiteSettings } => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SITE_SETTINGS));
  return {
    products: INITIAL_PRODUCTS,
    settings: INITIAL_SITE_SETTINGS
  };
};
