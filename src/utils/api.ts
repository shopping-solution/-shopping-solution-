import { Product, Order, SiteSettings, Review } from '../types';
import { saveStoredSettings, saveStoredProducts, saveStoredOrders, getStoredProducts, getStoredOrders } from './storage';

export async function fetchProductsApi(): Promise<Product[] | null> {
  try {
    const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('API fetch products error:', e);
  }
  return null;
}

export async function saveProductApi(product: Product): Promise<boolean> {
  try {
    const prods = getStoredProducts();
    const idx = prods.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      prods[idx] = product;
    } else {
      prods.unshift(product);
    }
    saveStoredProducts(prods);

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return res.ok;
  } catch (e) {
    console.warn('API save product fallback to localStorage:', e);
    return true;
  }
}

export async function deleteProductApi(id: string): Promise<boolean> {
  try {
    const prods = getStoredProducts().filter(p => p.id !== id);
    saveStoredProducts(prods);

    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (e) {
    console.warn('API delete product fallback to localStorage:', e);
    return true;
  }
}

export async function fetchOrdersApi(): Promise<Order[] | null> {
  try {
    const res = await fetch(`/api/orders?t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('API fetch orders error:', e);
  }
  return null;
}

export async function createOrderApi(order: Order): Promise<boolean> {
  try {
    const orders = getStoredOrders();
    orders.unshift(order);
    saveStoredOrders(orders);

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    return res.ok;
  } catch (e) {
    console.warn('API create order fallback to localStorage:', e);
    return true;
  }
}

export async function updateOrderStatusApi(id: string, status: string): Promise<boolean> {
  try {
    const orders = getStoredOrders();
    const target = orders.find(o => o.id === id);
    if (target) {
      target.status = status as any;
      saveStoredOrders(orders);
    }

    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch (e) {
    console.warn('API update order status fallback to localStorage:', e);
    return true;
  }
}

export async function fetchLiveTrackingApi(id: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/${id}/tracking`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('API fetch live tracking error:', e);
  }
  return null;
}

export async function fetchSettingsApi(): Promise<SiteSettings | null> {
  try {
    const res = await fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('API fetch settings error:', e);
  }
  return null;
}

export async function saveSettingsApi(settings: SiteSettings): Promise<boolean> {
  // Always save to localStorage immediately for instant client persistence
  saveStoredSettings(settings);

  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.ok || true; // Returns true if saved locally even on static Vercel/offline host
  } catch (e) {
    console.warn('API save settings network/Vercel fallback:', e);
    return true; // LocalStorage succeeded
  }
}

export async function seedDefaultsApi(): Promise<boolean> {
  try {
    const res = await fetch('/api/seed', { method: 'POST' });
    return res.ok;
  } catch (e) {
    console.warn('API seed defaults error:', e);
    return false;
  }
}

export async function fetchReviewsApi(productId: string): Promise<Review[] | null> {
  try {
    const res = await fetch(`/api/reviews/${productId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('API fetch reviews error:', e);
  }
  return null;
}

export async function createReviewApi(review: Review): Promise<Review | null> {
  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('API create review error:', e);
  }
  return null;
}

export async function deleteReviewApi(id: number): Promise<boolean> {
  try {
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (e) {
    console.warn('API delete review error:', e);
    return false;
  }
}
