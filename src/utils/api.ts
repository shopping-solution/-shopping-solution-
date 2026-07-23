import { Product, Order, SiteSettings } from '../types';

export async function fetchProductsApi(): Promise<Product[] | null> {
  try {
    const res = await fetch('/api/products');
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
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return res.ok;
  } catch (e) {
    console.warn('API save product error:', e);
    return false;
  }
}

export async function deleteProductApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (e) {
    console.warn('API delete product error:', e);
    return false;
  }
}

export async function fetchOrdersApi(): Promise<Order[] | null> {
  try {
    const res = await fetch('/api/orders');
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
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    return res.ok;
  } catch (e) {
    console.warn('API create order error:', e);
    return false;
  }
}

export async function updateOrderStatusApi(id: string, status: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch (e) {
    console.warn('API update order status error:', e);
    return false;
  }
}

export async function fetchSettingsApi(): Promise<SiteSettings | null> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('API fetch settings error:', e);
  }
  return null;
}

export async function saveSettingsApi(settings: SiteSettings): Promise<boolean> {
  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.ok;
  } catch (e) {
    console.warn('API save settings error:', e);
    return false;
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
