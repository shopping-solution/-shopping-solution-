import React, { useState, useEffect } from 'react';
import {
  Package, ShoppingCart, Settings, Plus, Edit, Trash2, CheckCircle2,
  XCircle, Clock, Truck, DollarSign, Search, ShieldCheck, RefreshCw,
  Eye, EyeOff, Lock, Key, Phone, MessageSquare, Mail, AlertTriangle, X, Upload, Image as ImageIcon,
  Share2, Copy, Check, Bell, Volume2, VolumeX, ArrowRight
} from 'lucide-react';
import { Product, Order, OrderStatus, SiteSettings, Language, GenderCategory, SubCategory } from '../../types';
import { translations } from '../../data/translations';
import { saveProductApi, deleteProductApi, updateOrderStatusApi, saveSettingsApi, fetchOrdersApi } from '../../utils/api';
import { formatWhatsappNumber, generateOrderReceiptText, getGmailComposeUrl } from '../../utils/formatters';
import { playNotificationSound, requestAndRegisterNotificationPermission, onForegroundMessage } from '../../lib/firebaseNotifications';


interface AdminDashboardProps {
  language: Language;
  products: Product[];
  orders: Order[];
  siteSettings: SiteSettings;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateOrders: (orders: Order[]) => void;
  onUpdateSettings: (settings: SiteSettings) => void;
  onRestoreDefaults: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  language,
  products,
  orders,
  siteSettings,
  onUpdateProducts,
  onUpdateOrders,
  onUpdateSettings,
  onRestoreDefaults,
  onLogout,
}) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings' | 'notifications'>('overview');

  // --- REAL-TIME NOTIFICATION SYSTEM STATE ---
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [fcmRegistering, setFcmRegistering] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeToast, setActiveToast] = useState<any | null>(null);
  const [vapidKeyInput, setVapidKeyInput] = useState('');
  const [testPushLoading, setTestPushLoading] = useState(false);

  // Fetch notification history on mount
  const fetchNotificationsHistory = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotificationsList(data);
      }
    } catch (err) {
      console.error('[NOTIFICATIONS] Failed to load history:', err);
    }
  };

  useEffect(() => {
    fetchNotificationsHistory();
  }, []);

  // Listen to url query changes to auto-select order if tapped from a notification
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderIdParam = params.get('orderId');
    if (orderIdParam) {
      // Find the order
      const targetOrder = orders.find((o) => o.id === orderIdParam);
      if (targetOrder) {
        setActiveTab('orders');
        setSelectedOrder(targetOrder);
        // Clear param from url to avoid looping
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [orders]);

  // Real-time EventSource listener for new orders (for Admin Dashboard)
  useEffect(() => {
    console.log('[SSE] Opening real-time notification stream...');
    const eventSource = new EventSource('/api/notifications/stream');

    eventSource.onopen = () => {
      console.log('[SSE] Connection opened successfully.');
    };

    eventSource.addEventListener('new-order', async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Realtime order alert received!', data);
        
        // 1. Play the synthesized chime if enabled
        if (soundEnabled) {
          playNotificationSound();
        }

        // 2. Refresh orders instantly in dashboard state
        const refreshedOrders = await fetchOrdersApi();
        if (refreshedOrders) {
          onUpdateOrders(refreshedOrders);
        }

        // 3. Append to Notifications List
        setNotificationsList((prev) => [data.notification, ...prev]);

        // 4. Trigger in-app Toast Notification
        setActiveToast({
          id: Date.now(),
          orderId: data.order.id,
          customerName: data.order.customer?.fullName || 'Anonymous',
          amount: data.order.totalAmount,
          itemsCount: data.order.items?.length || 1,
        });
      } catch (err) {
        console.error('[SSE] Error handling new-order event:', err);
      }
    });

    eventSource.onerror = (err) => {
      console.warn('[SSE] EventSource stream closed or failed. Browser will auto-reconnect.', err);
    };

    // Register foreground push notifications listeners as well
    const unsubscribeFcm = onForegroundMessage((payload) => {
      console.log('[FCM FOREGROUND] Push message payload received:', payload);
      fetchNotificationsHistory();
      // Also refresh orders
      fetchOrdersApi().then((refreshed) => {
        if (refreshed) onUpdateOrders(refreshed);
      });
    });

    return () => {
      console.log('[SSE] Closing notification stream.');
      eventSource.close();
      unsubscribeFcm();
    };
  }, [soundEnabled]);


  // Product modal state (Add / Edit)
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state for Product
  const [prodName, setProdName] = useState('');
  const [prodNameBn, setProdNameBn] = useState('');
  const [prodGender, setProdGender] = useState<GenderCategory>('men');
  const [prodCategory, setProdCategory] = useState<SubCategory>('T-Shirt');
  const [prodPrice, setProdPrice] = useState<number>(1000);
  const [prodOldPrice, setProdOldPrice] = useState<number>(1200);
  const [prodStock, setProdStock] = useState<number>(20);
  const [prodImages, setProdImages] = useState<string>('');
  const [prodImageList, setProdImageList] = useState<string[]>([]);
  const [prodColors, setProdColors] = useState<string>('Black, White, Navy');
  const [prodSizes, setProdSizes] = useState<string>('S, M, L, XL');
  const [prodDesc, setProdDesc] = useState('');
  const [prodDescBn, setProdDescBn] = useState('');
  const [prodIsTrending, setProdIsTrending] = useState(true);
  const [prodIsBestSelling, setProdIsBestSelling] = useState(false);
  const [prodIsNewAdded, setProdIsNewAdded] = useState(true);

  // Copy shareable product link state
  const [copiedProdId, setCopiedProdId] = useState<string | null>(null);

  const handleCopyProductLink = (prodId: string) => {
    const link = `${window.location.origin}${window.location.pathname}?product=${prodId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedProdId(prodId);
      setTimeout(() => setCopiedProdId(null), 2000);
    });
  };

  // Gallery image file selection handler
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray: File[] = Array.from(files);
    const newImages: string[] = [];
    let processedCount = 0;

    fileArray.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
        }
        processedCount++;
        if (processedCount === fileArray.length) {
          setProdImageList((prev) => {
            const updated = [...prev, ...newImages];
            setProdImages(updated.join(', '));
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Remove individual image from list
  const handleRemoveImage = (indexToRemove: number) => {
    setProdImageList((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      setProdImages(updated.join(', '));
      return updated;
    });
  };

  // Update text URLs input
  const handleUrlInputChange = (val: string) => {
    setProdImages(val);
    const parsed = val.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    setProdImageList(parsed);
  };

  // Selected Order for detail view
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'All'>('All');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({ ...siteSettings });
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState(false);
  const [showAdminPasswordSetting, setShowAdminPasswordSetting] = useState(false);

  // Sync settingsForm whenever siteSettings prop changes
  useEffect(() => {
    if (siteSettings) {
      setSettingsForm({ ...siteSettings });
    }
  }, [siteSettings]);

  // Calculation Stats
  const totalRevenue = orders
    .filter((o) => o.status === 'Confirmed' || o.status === 'Delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const confirmedCount = orders.filter((o) => o.status === 'Confirmed').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length;
  const unreadNotificationsCount = notificationsList.filter((n) => !n.read).length;

  // Open Product Modal for Create or Edit
  const handleOpenProductModal = (prodToEdit?: Product) => {
    if (prodToEdit) {
      setEditingProduct(prodToEdit);
      setProdName(prodToEdit.name);
      setProdNameBn(prodToEdit.nameBn || '');
      setProdGender(prodToEdit.gender);
      setProdCategory(prodToEdit.category);
      setProdPrice(prodToEdit.price);
      setProdOldPrice(prodToEdit.oldPrice || prodToEdit.price);
      setProdStock(prodToEdit.stock);
      setProdImageList([...prodToEdit.images]);
      setProdImages(prodToEdit.images.join(', '));
      setProdColors(prodToEdit.colors.join(', '));
      setProdSizes(prodToEdit.sizes.join(', '));
      setProdDesc(prodToEdit.description);
      setProdDescBn(prodToEdit.descriptionBn || '');
      setProdIsTrending(!!prodToEdit.isTrending);
      setProdIsBestSelling(!!prodToEdit.isBestSelling);
      setProdIsNewAdded(!!prodToEdit.isNewAdded);
    } else {
      const defaultImg = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800';
      setEditingProduct(null);
      setProdName('');
      setProdNameBn('');
      setProdGender('men');
      setProdCategory('T-Shirt');
      setProdPrice(1200);
      setProdOldPrice(1500);
      setProdStock(25);
      setProdImageList([defaultImg]);
      setProdImages(defaultImg);
      setProdColors('Black, White, Navy');
      setProdSizes('S, M, L, XL');
      setProdDesc('Premium luxury fashion tailored for maximum comfort.');
      setProdDescBn('প্রিমিয়াম কোয়ালিটি পোশাক।');
      setProdIsTrending(true);
      setProdIsBestSelling(false);
      setProdIsNewAdded(true);
    }
    setProductModalOpen(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    let imageArray = prodImageList.filter((url) => url.trim().length > 0);
    if (imageArray.length === 0) {
      imageArray = prodImages
        .split(',')
        .map((url) => url.trim())
        .filter((url) => url.length > 0);
    }

    const colorArray = prodColors
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const sizeArray = prodSizes
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const discountPct = prodOldPrice > prodPrice
      ? Math.round(((prodOldPrice - prodPrice) / prodOldPrice) * 100)
      : 0;

    if (editingProduct) {
      // Edit existing
      const updatedProduct: Product = {
        ...editingProduct,
        name: prodName,
        nameBn: prodNameBn,
        gender: prodGender,
        category: prodCategory,
        price: prodPrice,
        oldPrice: prodOldPrice,
        discountPercent: discountPct,
        stock: prodStock,
        inStock: prodStock > 0,
        images: imageArray.length > 0 ? imageArray : [editingProduct.images[0]],
        colors: colorArray,
        sizes: sizeArray,
        description: prodDesc,
        descriptionBn: prodDescBn,
        isTrending: prodIsTrending,
        isBestSelling: prodIsBestSelling,
        isNewAdded: prodIsNewAdded,
      };
      const updatedList = products.map((p) =>
        p.id === editingProduct.id ? updatedProduct : p
      );
      onUpdateProducts(updatedList);
      saveProductApi(updatedProduct);
    } else {
      // Add new
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: prodName,
        nameBn: prodNameBn,
        gender: prodGender,
        category: prodCategory,
        price: prodPrice,
        oldPrice: prodOldPrice,
        discountPercent: discountPct,
        stock: prodStock,
        inStock: prodStock > 0,
        images: imageArray.length > 0 ? imageArray : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'],
        colors: colorArray,
        sizes: sizeArray,
        description: prodDesc,
        descriptionBn: prodDescBn,
        isTrending: prodIsTrending,
        isBestSelling: prodIsBestSelling,
        isNewAdded: prodIsNewAdded,
        createdAt: new Date().toISOString(),
      };
      onUpdateProducts([newProd, ...products]);
      saveProductApi(newProd);
    }

    setProductModalOpen(false);
  };

  // Delete Product
  const handleDeleteProduct = (prodId: string) => {
    if (window.confirm(t.confirmDelete)) {
      onUpdateProducts(products.filter((p) => p.id !== prodId));
      deleteProductApi(prodId);
    }
  };

  // Real-time status notification state
  const [statusNotifyMsg, setStatusNotifyMsg] = useState<string | null>(null);

  // Change Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const targetOrder = orders.find((o) => o.id === orderId);

    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    onUpdateOrders(updated);
    
    await updateOrderStatusApi(orderId, newStatus);

    // Refresh orders from API to obtain newly generated courier details
    const refreshedOrders = await fetchOrdersApi();
    if (refreshedOrders) {
      onUpdateOrders(refreshedOrders);
      const updatedSelect = refreshedOrders.find((o) => o.id === orderId);
      if (updatedSelect) {
        setSelectedOrder(updatedSelect);
      }
    }

    if (targetOrder) {
      const updatedOrderObj: Order = { ...targetOrder, status: newStatus };
      const receiptType = newStatus === 'Confirmed' ? 'order_confirmed_customer' : 'status_update_customer';
      const customerReceiptMsg = generateOrderReceiptText(updatedOrderObj, receiptType);
      const cleanCustomerMobile = formatWhatsappNumber(updatedOrderObj.customer.mobileNumber);

      if (cleanCustomerMobile) {
        const customerWaUrl = `https://wa.me/${cleanCustomerMobile}?text=${encodeURIComponent(customerReceiptMsg)}`;
        window.open(customerWaUrl, '_blank');
        
        setStatusNotifyMsg(`Order #${orderId} status updated to "${newStatus}"! Real-time WhatsApp receipt auto-dispatched to Customer (${targetOrder.customer.fullName} - ${targetOrder.customer.mobileNumber}).`);
        setTimeout(() => setStatusNotifyMsg(null), 6000);
      }
    }
  };

  // Manual WhatsApp receipt dispatch to customer
  const handleSendCustomerReceiptWhatsapp = (order: Order) => {
    const receiptMsg = generateOrderReceiptText(
      order,
      order.status === 'Confirmed' ? 'order_confirmed_customer' : 'status_update_customer'
    );
    const cleanCustomerPhone = formatWhatsappNumber(order.customer.mobileNumber);
    if (!cleanCustomerPhone) {
      alert('Invalid mobile number');
      return;
    }
    window.open(`https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(receiptMsg)}`, '_blank');
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedSettings: SiteSettings = {
      ...settingsForm,
      adminPhone: settingsForm.adminPhone.trim(),
      adminWhatsapp: settingsForm.adminWhatsapp.trim(),
      adminEmail: settingsForm.adminEmail.trim(),
      adminAddress: (settingsForm.adminAddress || '').trim(),
      adminPassword: (settingsForm.adminPassword || 'Admin#2026!Sec').trim(),
      facebookUrl: (settingsForm.facebookUrl || 'https://www.facebook.com/share/1DQAkf8T7T/').trim(),
      instagramUrl: (settingsForm.instagramUrl || 'https://www.instagram.com/shopping_solution_').trim(),
      bkashNumber: settingsForm.bkashNumber.trim(),
      nagadNumber: settingsForm.nagadNumber.trim(),
    };
    setSettingsForm(cleanedSettings);
    onUpdateSettings(cleanedSettings);
    saveSettingsApi(cleanedSettings);
    setSettingsSuccessMsg(true);
    setTimeout(() => setSettingsSuccessMsg(false), 3000);
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    const matchesQuery =
      o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customer.mobileNumber.includes(orderSearchQuery) ||
      (o.transactionId && o.transactionId.toLowerCase().includes(orderSearchQuery.toLowerCase()));
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900 border border-amber-500/30 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-stone-100">
                {t.adminDashboard}
              </h1>
              <p className="text-xs text-amber-400">
                SHOPPING SOLUTION Management Panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm('Restore default products and site settings?')) {
                  onRestoreDefaults();
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.restoreSeedData}</span>
            </button>

            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all"
            >
              {t.logout}
            </button>
          </div>
        </div>

        {/* Dashboard Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-800 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-stone-950 shadow-lg'
                : 'bg-stone-900 text-stone-400 hover:text-stone-100'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>{t.overviewStats}</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-amber-500 text-stone-950 shadow-lg'
                : 'bg-stone-900 text-stone-400 hover:text-stone-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t.manageProducts} ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-stone-950 shadow-lg'
                : 'bg-stone-900 text-stone-400 hover:text-stone-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{t.manageOrders} ({orders.length})</span>
            {pendingCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-stone-950 shadow-lg'
                : 'bg-stone-900 text-stone-400 hover:text-stone-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t.contactSettings}</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
              activeTab === 'notifications'
                ? 'bg-amber-500 text-stone-950 shadow-lg'
                : 'bg-stone-900 text-stone-400 hover:text-stone-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
            {unreadNotificationsCount > 0 && (
              <span className="bg-amber-400 text-stone-950 text-[9px] px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: OVERVIEW STATS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-stone-900 border border-amber-500/30 p-5 rounded-2xl space-y-2">
                <span className="text-xs text-stone-400 font-semibold uppercase">{t.totalRevenue}</span>
                <p className="font-serif text-3xl font-extrabold text-amber-400">
                  ৳ {totalRevenue.toLocaleString()}
                </p>
                <p className="text-[10px] text-stone-500">From confirmed & delivered orders</p>
              </div>

              <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-2">
                <span className="text-xs text-stone-400 font-semibold uppercase">{t.totalOrders}</span>
                <p className="font-serif text-3xl font-extrabold text-stone-100">
                  {orders.length}
                </p>
                <p className="text-[10px] text-stone-500">Total customer placements</p>
              </div>

              <div className="bg-stone-900 border border-amber-500/40 p-5 rounded-2xl space-y-2">
                <span className="text-xs text-amber-400 font-semibold uppercase">{t.pendingOrders}</span>
                <p className="font-serif text-3xl font-extrabold text-amber-400">
                  {pendingCount}
                </p>
                <p className="text-[10px] text-amber-500/80">Awaiting admin confirmation</p>
              </div>

              <div className="bg-stone-900 border border-emerald-500/30 p-5 rounded-2xl space-y-2">
                <span className="text-xs text-emerald-400 font-semibold uppercase">{t.deliveredOrders}</span>
                <p className="font-serif text-3xl font-extrabold text-emerald-400">
                  {deliveredCount}
                </p>
                <p className="text-[10px] text-emerald-500/80">Successfully fulfilled</p>
              </div>

            </div>

            {/* Quick Orders Overview Table */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-serif text-lg font-bold text-stone-100">
                Recent Orders
              </h3>

              {orders.length === 0 ? (
                <p className="text-xs text-stone-500">No orders placed yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-stone-300">
                    <thead className="bg-stone-950 text-amber-400 uppercase font-bold text-[10px] border-b border-stone-800">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Payment</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-stone-950/50">
                          <td className="p-3 font-mono font-bold text-stone-100">#{o.id}</td>
                          <td className="p-3 font-semibold">{o.customer.fullName}</td>
                          <td className="p-3">{o.customer.mobileNumber}</td>
                          <td className="p-3 font-serif font-bold text-amber-400">৳ {o.totalAmount}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-stone-800 text-[10px] font-semibold">
                              {o.paymentMethod} {o.transactionId ? `(${o.transactionId})` : ''}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.status === 'Pending' ? 'bg-amber-950 text-amber-400 border border-amber-500/30' :
                              o.status === 'Confirmed' ? 'bg-blue-950 text-blue-400 border border-blue-500/30' :
                              o.status === 'Delivered' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                              'bg-rose-950 text-rose-400 border border-rose-500/30'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrder(o);
                                setActiveTab('orders');
                              }}
                              className="text-xs text-amber-400 hover:underline"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-stone-100">
                Catalog Products ({products.length})
              </h2>

              <button
                onClick={() => handleOpenProductModal()}
                className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs transition-all flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addNewProduct}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-amber-500/30 transition-all">
                  <div className="flex gap-3">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-20 h-20 object-cover rounded-xl bg-stone-950 border border-stone-800 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-400">
                        {p.gender} • {p.category}
                      </span>
                      <h4 className="text-xs font-bold text-stone-100 line-clamp-2">{p.name}</h4>
                      <div className="flex items-center gap-2 font-serif text-sm font-bold text-amber-400">
                        <span>৳ {p.price}</span>
                        {p.oldPrice && p.oldPrice > p.price && (
                          <span className="text-xs text-stone-500 line-through font-normal">৳ {p.oldPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-800">
                    <span className="text-stone-400">
                      Stock: <strong className="text-stone-200">{p.stock}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyProductLink(p.id)}
                        className={`px-2 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                          copiedProdId === p.id
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                            : 'bg-stone-800 hover:bg-stone-700 border-amber-500/20 text-stone-300 hover:text-amber-400'
                        }`}
                        title={t.copyProductLink}
                      >
                        {copiedProdId === p.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] hidden sm:inline">{t.shareProduct}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenProductModal(p)}
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-400 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Real-time status notification alert */}
            {statusNotifyMsg && (
              <div className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs rounded-xl flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{statusNotifyMsg}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-serif text-xl font-bold text-stone-100">
                Customer Orders ({orders.length})
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search query */}
                <div className="flex items-center bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5 text-xs w-48 sm:w-64">
                  <Search className="w-4 h-4 text-stone-400 mr-2" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search name, phone, ID, Trx..."
                    className="w-full bg-transparent text-stone-100 placeholder-stone-500 focus:outline-none"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                  className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
              {filteredOrders.length === 0 ? (
                <p className="p-8 text-center text-xs text-stone-500">No orders match filter.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-stone-300">
                    <thead className="bg-stone-950 text-amber-400 uppercase font-bold text-[10px] border-b border-stone-800">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Mobile</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Payment</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-stone-950/50 transition-colors">
                          <td className="p-3 font-mono font-bold text-amber-400">#{o.id}</td>
                          <td className="p-3 text-[11px] text-stone-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 font-bold text-stone-100">{o.customer.fullName}</td>
                          <td className="p-3">{o.customer.mobileNumber}</td>
                          <td className="p-3">{o.customer.district}, {o.customer.division}</td>
                          <td className="p-3 font-serif font-bold text-amber-400">৳ {o.totalAmount}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-stone-950 border border-stone-800 font-semibold text-[10px]">
                              {o.paymentMethod} {o.transactionId ? `(Trx: ${o.transactionId})` : ''}
                            </span>
                          </td>
                          <td className="p-3">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                              className={`px-2 py-1 rounded text-[10px] font-bold border focus:outline-none cursor-pointer ${
                                o.status === 'Pending' ? 'bg-amber-950 text-amber-400 border-amber-500/40' :
                                o.status === 'Confirmed' ? 'bg-blue-950 text-blue-400 border-blue-500/40' :
                                o.status === 'Delivered' ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' :
                                'bg-rose-950 text-rose-400 border-rose-500/40'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSendCustomerReceiptWhatsapp(o)}
                                className="px-2 py-1 rounded bg-emerald-900/80 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold transition-all text-[10px] flex items-center gap-1 border border-emerald-500/30"
                                title="Send Real-time WhatsApp Receipt to Customer"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </button>
                              <button
                                onClick={() => setSelectedOrder(o)}
                                className="px-2.5 py-1 rounded bg-stone-800 hover:bg-amber-500 text-stone-200 hover:text-stone-950 font-bold transition-all text-[11px]"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS & CONTACT MANAGEMENT */}
        {activeTab === 'settings' && (
          <div className="bg-stone-900 border border-stone-800 p-6 sm:p-8 rounded-2xl max-w-2xl space-y-6">
            <h2 className="font-serif text-xl font-bold text-stone-100">
              {t.updateSettings}
            </h2>

            {settingsSuccessMsg && (
              <div className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{t.settingsUpdated}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.adminPhone} (Phone Call Popup):
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.adminPhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, adminPhone: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.adminWhatsapp} (WhatsApp Direct):
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.adminWhatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, adminWhatsapp: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  />
                  <p className="text-[10px] text-emerald-400/90 mt-1">
                    ✓ Direct WhatsApp Link Target: <span className="font-mono font-bold">wa.me/{formatWhatsappNumber(settingsForm.adminWhatsapp) || '...'}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.bkashPersonal}:
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.bkashNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bkashNumber: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.nagadPersonal}:
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.nagadNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, nagadNumber: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.adminEmail}:
                  </label>
                  <input
                    type="email"
                    required
                    value={settingsForm.adminEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, adminEmail: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.adminAddress} (Showroom / Office Location):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Level 4, Shopping Solution Tower, Banani C/A, Dhaka-1213"
                    value={settingsForm.adminAddress || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, adminAddress: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    ✓ Reflected across Contact Section, Footer, and Customer Service sections
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.facebookUrl} (Official Page):
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.facebook.com/share/..."
                    value={settingsForm.facebookUrl || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.instagramUrl} (Official Profile):
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.instagram.com/..."
                    value={settingsForm.instagramUrl || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Admin Password Security Section */}
                <div className="sm:col-span-2 bg-stone-950/80 border border-amber-500/20 rounded-xl p-4 space-y-2 mt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{t.changeAdminPassword} ({language === 'en' ? 'Private Admin Password' : 'গোপন এডমিন পাসওয়ার্ড'}):</span>
                    </label>
                    <span className="text-[10px] text-stone-400">
                      🔒 {language === 'en' ? 'Only visible to logged-in admin' : 'শুধুমাত্র লগইনকৃত এডমিন দেখতে ও পরিবর্তন করতে পারবেন'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showAdminPasswordSetting ? 'text' : 'password'}
                      required
                      value={settingsForm.adminPassword || 'Admin#2026!Sec'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, adminPassword: e.target.value })}
                      placeholder="Enter new admin password"
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-3 pr-10 py-2 text-xs text-stone-100 font-mono focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPasswordSetting(!showAdminPasswordSetting)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-200 transition-colors"
                      title={showAdminPasswordSetting ? 'Hide password' : 'Show password'}
                    >
                      {showAdminPasswordSetting ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-400">
                    {language === 'en'
                      ? 'Note: This password is fully hidden from visitors. Only users who enter this password can access this Admin Portal.'
                      : 'নোট: এই পাসওয়ার্ডটি ভিজিটরদের কাছে সম্পূর্ণ গোপন থাকবে। শুধুমাত্র এই পাসওয়ার্ড জানা ব্যবহারকারীরা এডমিন প্যানেলে প্রবেশ করতে পারবেন।'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.insideDhakaFee}:
                  </label>
                  <input
                    type="number"
                    required
                    value={settingsForm.deliveryFeeInsideDhaka}
                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFeeInsideDhaka: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.outsideDhakaFee}:
                  </label>
                  <input
                    type="number"
                    required
                    value={settingsForm.deliveryFeeOutsideDhaka}
                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFeeOutsideDhaka: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-amber-400 mb-1 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Default Courier Integration Partner:</span>
                  </label>
                  <select
                    value={settingsForm.defaultCourier || 'Steadfast'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, defaultCourier: e.target.value as any })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value="Steadfast">Steadfast Courier (BD)</option>
                    <option value="Pathao">Pathao Courier (BD)</option>
                  </select>
                  <p className="text-[10px] text-stone-400 mt-1">
                    ✓ Consignment orders will be booked automatically with this carrier when you set an order status to "Confirmed".
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all cursor-pointer shadow-lg"
              >
                Save Site Settings
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: REAL-TIME NOTIFICATIONS HISTORY */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-5 rounded-2xl">
              <div>
                <h2 className="font-serif text-lg font-bold text-stone-100 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  <span>Real-Time Notifications History</span>
                </h2>
                <p className="text-xs text-stone-400">
                  Manage background push notifications, device tokens, and sound parameters.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 ${
                    soundEnabled
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-stone-800 border-stone-700 text-stone-500'
                  }`}
                  title={soundEnabled ? 'Chime sound is enabled' : 'Chime sound is muted'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>{soundEnabled ? 'Sound Enabled' : 'Sound Muted'}</span>
                </button>

                <button
                  onClick={async () => {
                    if (window.confirm('Mark all notifications as read?')) {
                      try {
                        const res = await fetch('/api/notifications/read-all', { method: 'PUT' });
                        if (res.ok) {
                          setNotificationsList(notificationsList.map((n) => ({ ...n, read: true })));
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-semibold transition-all"
                  disabled={unreadNotificationsCount === 0}
                >
                  Mark All Read
                </button>
              </div>
            </div>

            {/* FCM Setup and Test Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Registration Column */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 md:col-span-1">
                <h3 className="font-serif text-sm font-bold text-stone-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>FCM Device Registration</span>
                </h3>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Register this device's Web Push registration token to allow background notifications even when this tab is closed.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">
                      Web Push VAPID Key (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="Enter VAPID Public Key"
                      value={vapidKeyInput}
                      onChange={(e) => setVapidKeyInput(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                    />
                    <span className="text-[9px] text-stone-500 block mt-0.5">
                      Defaults to built-in fallback Web certificate.
                    </span>
                  </div>

                  <button
                    onClick={async () => {
                      setFcmRegistering(true);
                      const token = await requestAndRegisterNotificationPermission(vapidKeyInput || undefined);
                      setFcmRegistering(false);
                      if (token) {
                        setFcmToken(token);
                        alert('Device registered successfully! FCM Token is active.');
                      } else {
                        alert('Permission was denied, or your browser rejected registration. Check console logs.');
                      }
                    }}
                    disabled={fcmRegistering}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {fcmRegistering ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                    <span>{fcmToken ? 'Re-register Device' : 'Enable Push Notifications'}</span>
                  </button>

                  {fcmToken && (
                    <div className="p-2.5 bg-stone-950 border border-stone-850 rounded-lg space-y-1">
                      <span className="text-[9px] text-stone-500 block uppercase font-bold">Registered FCM Token:</span>
                      <p className="font-mono text-[9px] text-amber-400 break-all select-all font-semibold">
                        {fcmToken}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Push System Diagnostic */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 md:col-span-1">
                <h3 className="font-serif text-sm font-bold text-stone-200 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span>FCM Pipeline Test</span>
                </h3>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Trigger an immediate manual FCM Multicast dispatch to all registered active browser and Android tokens stored in Postgres.
                </p>

                <div className="pt-2 space-y-3">
                  <button
                    onClick={async () => {
                      setTestPushLoading(true);
                      try {
                        const res = await fetch('/api/notifications/test', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            title: '🔔 System Integrity Test',
                            body: 'Your real-time notification engine is working beautifully in production mode!'
                          })
                        });
                        if (res.ok) {
                          alert('FCM Push Test Dispatched! Please check your phone/browser.');
                        } else {
                          alert('FCM Push Test dispatch failed. Do you have active registered tokens?');
                        }
                      } catch (err) {
                        console.error(err);
                        alert('Failed to execute test API.');
                      } finally {
                        setTestPushLoading(false);
                      }
                    }}
                    disabled={testPushLoading}
                    className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-semibold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    {testPushLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Dispatch FCM Test Alert</span>
                  </button>
                </div>
              </div>

              {/* Status card */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 md:col-span-1">
                <h3 className="font-serif text-sm font-bold text-stone-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Offline / Sync State</span>
                </h3>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  The dashboard maintains an active SSE stream connection. If your network disconnects, notifications will queue, and the database automatically synchronizes instantly upon reconnecting.
                </p>
                <div className="flex items-center gap-2 text-xs pt-1">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="font-semibold text-stone-300">Live SSE Stream Connection Active</span>
                </div>
              </div>

            </div>

            {/* Notification History list */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-serif text-base font-bold text-stone-100 flex items-center gap-2">
                <span>Notification Registry History</span>
                <span className="text-xs bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full font-bold">
                  {notificationsList.length} total
                </span>
              </h3>

              {notificationsList.length === 0 ? (
                <div className="p-8 text-center bg-stone-950 rounded-xl border border-stone-800">
                  <Bell className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                  <p className="text-xs text-stone-400">No notifications stored yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notificationsList.map((notify) => (
                    <div
                      key={notify.id}
                      onClick={async () => {
                        // Mark as read
                        if (!notify.read) {
                          try {
                            await fetch(`/api/notifications/${notify.id}/read`, { method: 'PUT' });
                            setNotificationsList(
                              notificationsList.map((n) => (n.id === notify.id ? { ...n, read: true } : n))
                            );
                          } catch (err) {
                            console.error(err);
                          }
                        }
                        
                        // Find and open order
                        const relatedOrder = orders.find((o) => o.id === notify.orderId);
                        if (relatedOrder) {
                          setSelectedOrder(relatedOrder);
                        } else {
                          alert(`Order #${notify.orderId} was not found in the local cache. Please refresh standard orders.`);
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-xs ${
                        notify.read
                          ? 'bg-stone-950/40 border-stone-800 hover:bg-stone-950 text-stone-400'
                          : 'bg-stone-950 border-amber-500/20 hover:border-amber-500/40 text-stone-100 shadow-md'
                      }`}
                    >
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                        notify.read ? 'bg-stone-700' : 'bg-amber-400 animate-ping'
                      }`} />

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <p className={`font-bold ${notify.read ? 'text-stone-300' : 'text-stone-100'}`}>
                            {notify.title}
                          </p>
                          <span className="text-[10px] text-stone-500 whitespace-nowrap">
                            {new Date(notify.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-stone-300 leading-relaxed">{notify.body}</p>
                        <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold hover:underline pt-1">
                          <span>View Associated Order #{notify.orderId}</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* PRODUCT ADD / EDIT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-stone-900 border border-amber-500/40 w-full max-w-2xl rounded-2xl p-6 text-stone-100 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-amber-400">
                {editingProduct ? t.editProduct : t.addNewProduct}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.productName}:
                  </label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.productNameBn}:
                  </label>
                  <input
                    type="text"
                    value={prodNameBn}
                    onChange={(e) => setProdNameBn(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.gender}:
                  </label>
                  <select
                    value={prodGender}
                    onChange={(e) => setProdGender(e.target.value as GenderCategory)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="men">{t.men}</option>
                    <option value="women">{t.women}</option>
                    <option value="unisex">{t.unisex}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.category}:
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as SubCategory)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="T-Shirt">{t.tshirt}</option>
                    <option value="Shirt">{t.shirt}</option>
                    <option value="Polo">{t.polo}</option>
                    <option value="Pants">{t.pants}</option>
                    <option value="Hoodie">{t.hoodie}</option>
                    <option value="Dress">{t.dress}</option>
                    <option value="Traditional">{t.traditional}</option>
                    <option value="Watch">{t.watch}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Current Price (৳):
                  </label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Old Price / Reg. Price (৳):
                  </label>
                  <input
                    type="number"
                    value={prodOldPrice}
                    onChange={(e) => setProdOldPrice(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.stockQuantity}:
                  </label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.availableColors} (comma separated):
                  </label>
                  <input
                    type="text"
                    value={prodColors}
                    onChange={(e) => setProdColors(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                    placeholder="e.g. Black, White, Navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.availableSizes} (comma separated):
                  </label>
                  <input
                    type="text"
                    value={prodSizes}
                    onChange={(e) => setProdSizes(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                    placeholder="e.g. S, M, L, XL, XXL"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-semibold text-stone-300">
                    {t.productImages}:
                  </label>

                  {/* Gallery Upload Option */}
                  <div className="flex flex-wrap items-center gap-3 bg-stone-950 p-3 rounded-xl border border-stone-800">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs rounded-xl shadow-md transition-all transform hover:scale-105 active:scale-95">
                      <Upload className="w-4 h-4" />
                      <span>{t.uploadFromGallery}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-stone-400">
                      (JPEG, PNG, WEBP, GIF, SVG)
                    </span>
                  </div>

                  {/* Image Thumbnails Preview Grid */}
                  {prodImageList.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {prodImageList.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-950 border border-stone-800 group shadow-sm"
                        >
                          <img
                            src={imgUrl}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-0.5 right-0.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-full p-0.5 shadow transition-all opacity-90 group-hover:opacity-100"
                            title={t.removeImage}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Raw Text URLs Input */}
                  <div className="pt-1">
                    <span className="block text-[11px] text-stone-400 mb-1">
                      {t.orEnterUrls}:
                    </span>
                    <input
                      type="text"
                      required={prodImageList.length === 0}
                      value={prodImages}
                      onChange={(e) => handleUrlInputChange(e.target.value)}
                      placeholder="https://image1.jpg, https://image2.jpg"
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.productDescription}:
                  </label>
                  <textarea
                    rows={2}
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-4 text-xs pt-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsTrending}
                    onChange={(e) => setProdIsTrending(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>{t.isTrending}</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsBestSelling}
                    onChange={(e) => setProdIsBestSelling(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>{t.isBestSelling}</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsNewAdded}
                    onChange={(e) => setProdIsNewAdded(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>{t.isNewAdded}</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
                >
                  {t.saveProduct}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-stone-900 border border-amber-500/40 w-full max-w-xl rounded-2xl p-6 text-stone-100 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-amber-400">
                  Order Details #{selectedOrder.id}
                </h3>
                <p className="text-[10px] text-stone-400">Placing time: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-stone-400 hover:text-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer Box */}
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl space-y-1">
                <span className="font-bold text-amber-400 block">{t.customerDetails}:</span>
                <p className="font-bold text-stone-100">{selectedOrder.customer.fullName}</p>
                <p className="text-stone-300">Phone: {selectedOrder.customer.mobileNumber}</p>
                <p className="text-stone-400">
                  Address: {selectedOrder.customer.houseNumber}, {selectedOrder.customer.village}, {selectedOrder.customer.upazila}, {selectedOrder.customer.district}, {selectedOrder.customer.division}
                </p>
                {selectedOrder.customer.optionalDetails && (
                  <p className="text-amber-300 italic">Notes: {selectedOrder.customer.optionalDetails}</p>
                )}
              </div>

              {/* Items Box */}
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
                <span className="font-bold text-amber-400 block">{t.orderedItems}:</span>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-stone-300">
                    <div>
                      <p className="font-bold text-stone-200">{item.product.name}</p>
                      <p className="text-[10px] text-stone-500">
                        Size: {item.selectedSize} | Color: {item.selectedColor} | Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-serif font-bold text-amber-400">৳ {item.product.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Payment Info */}
              <div className="flex justify-between items-center p-3 bg-stone-950 border border-stone-800 rounded-xl">
                <div>
                  <span className="text-stone-400 block">Payment Method:</span>
                  <span className="font-bold text-stone-100">
                    {selectedOrder.paymentMethod} {selectedOrder.transactionId ? `(Trx: ${selectedOrder.transactionId})` : ''}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 block">Total Amount:</span>
                  <span className="font-serif font-extrabold text-amber-400 text-sm">৳ {selectedOrder.totalAmount}</span>
                </div>
              </div>

              {/* Courier Tracking Info (Admin Side) */}
              {selectedOrder.courierTrackingId ? (
                <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl space-y-1">
                  <span className="font-bold text-amber-400 block">Courier Integration Details:</span>
                  <div className="grid grid-cols-2 gap-2 text-stone-300">
                    <div>
                      <p className="text-[10px] text-stone-500">Courier Partner:</p>
                      <p className="font-bold text-stone-200">{selectedOrder.courierName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-500">Tracking Code:</p>
                      <p className="font-mono font-bold text-amber-400">{selectedOrder.courierTrackingId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-500">Consignment Status:</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        {selectedOrder.courierStatus || 'Processing'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : selectedOrder.status === 'Confirmed' ? (
                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-center">
                  <p className="text-amber-400 font-bold mb-1">Booking Consignment...</p>
                  <p className="text-[10px] text-stone-400">Automatic booking with Steadfast or Pathao is initiated when status is changed to Confirmed.</p>
                </div>
              ) : null}

              {/* Status Update Controls */}
              <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                <span className="font-bold text-stone-300">{t.changeStatus}:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  className="bg-stone-950 border border-amber-500/40 rounded-lg px-3 py-1.5 text-xs text-amber-400 font-bold focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-3">
              <button
                onClick={() => handleSendCustomerReceiptWhatsapp(selectedOrder)}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send WhatsApp Receipt</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="py-2 px-5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl"
              >
                {t.close}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* IN-APP REAL-TIME ORDER CHIME TOAST */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 border-2 border-amber-500 w-full max-w-sm rounded-2xl p-5 text-stone-100 shadow-2xl space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Instantly Placed Order Alert!</span>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-stone-400 hover:text-stone-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs space-y-1 text-stone-300">
            <p className="font-bold text-stone-100">Customer: {activeToast.customerName}</p>
            <p>Order ID: #{activeToast.orderId}</p>
            <p>Total Amount: <span className="text-amber-400 font-bold">৳ {activeToast.amount}</span></p>
            <p>Items Count: {activeToast.itemsCount} item(s)</p>
          </div>

          <button
            onClick={() => {
              const relatedOrder = orders.find((o) => o.id === activeToast.orderId);
              if (relatedOrder) {
                setSelectedOrder(relatedOrder);
                setActiveTab('orders');
              }
              setActiveToast(null);
            }}
            className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs shadow transition-all text-center"
          >
            Review Order Instantly
          </button>
        </div>
      )}

    </div>
  );
};
