import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag, Search, Filter, Phone, Sparkles, MessageSquare, ArrowRight, X, Check, Plus, Sliders
} from 'lucide-react';

import { Product, CartItem, Order, SiteSettings, Language, SubCategory, MenSubCategory, WomenSubCategory } from './types';
import { translations } from './data/translations';
import {
  getStoredProducts, saveStoredProducts,
  getStoredOrders, saveStoredOrders,
  getStoredSettings, saveStoredSettings,
  getStoredCart, saveStoredCart,
  getStoredLanguage, saveStoredLanguage,
  isAdminLoggedIn, setAdminLoggedIn,
  restoreDefaults
} from './utils/storage';
import {
  fetchProductsApi, fetchOrdersApi, fetchSettingsApi,
  createOrderApi, seedDefaultsApi, saveProductApi
} from './utils/api';
import { formatWhatsappNumber } from './utils/formatters';
import { trackVisitor } from './utils/analytics';

import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { ContactSection } from './components/ContactSection';
import { AdminLoginModal } from './components/Admin/AdminLoginModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { TrackOrderModal } from './components/TrackOrderModal';
import { Footer } from './components/Footer';
import { AdminProductModal } from './components/AdminProductModal';
import { AdminFeaturedCollectionModal } from './components/AdminFeaturedCollectionModal';

// Social Username Extractors for messenger inbox URLs
function getFacebookUsername(url: string | undefined): string {
  if (!url) return 'shoppingsolution';
  try {
    const cleanUrl = url.split('?')[0].replace(/\/+$/, '');
    const parts = cleanUrl.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart === 'profile.php' && url.includes('id=')) {
      const match = url.match(/id=(\d+)/);
      if (match) return match[1];
    }
    return lastPart || 'shoppingsolution';
  } catch (e) {
    return 'shoppingsolution';
  }
}

function getInstagramUsername(url: string | undefined): string {
  if (!url) return 'shopping_solution_';
  try {
    const cleanUrl = url.split('?')[0].replace(/\/+$/, '');
    const parts = cleanUrl.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart || 'shopping_solution_';
  } catch (e) {
    return 'shopping_solution_';
  }
}

export default function App() {
  // Persistent Stores State
  const [language, setLanguage] = useState<Language>(() => getStoredLanguage());
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => getStoredSettings());
  const [cart, setCart] = useState<CartItem[]>(() => getStoredCart());
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAdminLoggedIn());

  // Navigation state
  const [currentView, setCurrentView] = useState<'home' | 'men' | 'women' | 'contact' | 'admin'>('home');
  console.log('App.tsx rendering, siteSettings:', siteSettings);


  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('All');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'bestSelling' | 'priceLow' | 'priceHigh'>('newest');

  // Modals state
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);

  // Admin Home Page actions state
  const [homeEditingProduct, setHomeEditingProduct] = useState<Product | null>(null);
  const [isHomeProductModalOpen, setIsHomeProductModalOpen] = useState(false);
  const [isFeaturedModalOpen, setIsFeaturedModalOpen] = useState(false);

  // Floating support chat menu state
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);

  const handleSocialChatClick = (platform: 'whatsapp' | 'facebook' | 'instagram') => {
    // This is the message the *consumer* will send to the admin to start the chat.
    const initialConsumerMsg = `আসসালামু আলাইকুম, আমি একটি প্রোডাক্ট সম্পর্কে জানতে চাই।

Assalamu Alaikum, I want to know about a product.`;

    // Direct url redirection
    let targetUrl = '';
    if (platform === 'whatsapp') {
      targetUrl = `https://wa.me/${formatWhatsappNumber(siteSettings.adminWhatsapp)}?text=${encodeURIComponent(initialConsumerMsg)}`;
    } else if (platform === 'facebook') {
      const fbUsername = getFacebookUsername(siteSettings.facebookUrl);
      targetUrl = `https://m.me/${fbUsername}`;
    } else if (platform === 'instagram') {
      const igUsername = getInstagramUsername(siteSettings.instagramUrl);
      targetUrl = `https://ig.me/m/${igUsername}`;
    }

    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
    
    setIsFloatingMenuOpen(false);
  };

  // Save or update product from home page admin edit
  const handleSaveProductFromHome = async (updatedProduct: Product) => {
    // 1. Update local state
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === updatedProduct.id);
      if (exists) {
        return prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      }
      return [updatedProduct, ...prev];
    });

    // 2. Persist to API
    try {
      await saveProductApi(updatedProduct);
    } catch (e) {
      console.error('Failed to save product through API:', e);
    }

    // 3. Close modal
    setIsHomeProductModalOpen(false);
    setHomeEditingProduct(null);
  };

  // Save changes to featured collection flags
  const handleSaveFeaturedCollection = async (updatedProducts: Product[]) => {
    // 1. Update local state
    setProducts(updatedProducts);

    // 2. Persist changed products to API
    try {
      for (const p of updatedProducts) {
        const original = products.find((orig) => orig.id === p.id);
        if (original && original.isNewAdded !== p.isNewAdded) {
          await saveProductApi(p);
        }
      }
    } catch (e) {
      console.error('Failed to save featured collection changes through API:', e);
    }

    // 3. Close modal
    setIsFeaturedModalOpen(false);
  };

  // Refresh orders from API for live tracking
  const handleRefreshOrders = async () => {
    const apiOrders = await fetchOrdersApi();
    if (apiOrders) {
      setOrders(apiOrders);
    }
  };

  // Fetch and sync live state from Cloud SQL API with 4s periodic background refresh
  useEffect(() => {
    trackVisitor();

    async function loadCloudSqlData() {
      console.log('App.tsx: Polling Cloud SQL data...');
      // Independent fetches to ensure one failure doesn't block others
      const [apiProds, apiOrders, apiSettings] = await Promise.all([
        fetchProductsApi().catch(() => null),
        fetchOrdersApi().catch(() => null),
        fetchSettingsApi().catch(() => null),
      ]);
      
      if (apiProds) {
        setProducts(apiProds);
        saveStoredProducts(apiProds);
      }
      if (apiOrders) {
        setOrders(apiOrders);
        saveStoredOrders(apiOrders);
      }
      if (apiSettings) {
        setSiteSettings(apiSettings);
        saveStoredSettings(apiSettings);
      }
    }

    // Initial load
    loadCloudSqlData();

    // 4-second background poll ensuring orders, products & site settings are always 100% in sync
    const interval = setInterval(loadCloudSqlData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Live SSE listener removed, Firestore onSnapshot is used instead for reliability.

  // Check URL query parameter (?product=prodId) for product share link
  useEffect(() => {
    if (products.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const prodId = params.get('product');
    if (prodId) {
      const foundProduct = products.find((p) => p.id === prodId);
      if (foundProduct) {
        setSelectedProductDetails(foundProduct);
      }
    }
  }, [products]);

  // Listen to popstate (browser back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get('product');
      if (prodId) {
        const foundProduct = products.find((p) => p.id === prodId);
        setSelectedProductDetails(foundProduct || null);
      } else {
        setSelectedProductDetails(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  // Handlers for opening/closing product modal with URL updates
  const handleOpenProductDetails = (product: Product) => {
    setSelectedProductDetails(product);
    const newUrl = `${window.location.pathname}?product=${product.id}`;
    window.history.pushState({ productId: product.id }, '', newUrl);
  };

  const handleCloseProductDetails = () => {
    setSelectedProductDetails(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  // Sync state changes with localStorage
  useEffect(() => {
    saveStoredLanguage(language);
  }, [language]);

  useEffect(() => {
    saveStoredProducts(products);
  }, [products]);

  useEffect(() => {
    saveStoredOrders(orders);
  }, [orders]);

  useEffect(() => {
    console.log('App.tsx: Saving settings to storage:', siteSettings);
    saveStoredSettings(siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    saveStoredCart(cart);
  }, [cart]);

  const t = translations[language];

  // Localized Subcategory Label Helper
  const getSubCategoryLabel = (sub: string) => {
    if (sub === 'All') return t.allCategories;
    const key = sub.toLowerCase().replace(/[\s\-\/]/g, '');
    if (key === 'tshirt') return t.tshirt;
    if (key === 'shirt') return t.shirt;
    if (key === 'polo') return t.polo;
    if (key === 'pants') return t.pants;
    if (key === 'baggy') return t.baggy;
    if (key === 'bootcut') return t.bootcut;
    if (key === 'jeans') return t.jeans;
    if (key === 'hoodie') return t.hoodie;
    if (key === 'dress') return t.dress;
    if (key === 'traditional') return t.traditional;
    if (key === 'watch') return t.watch;
    return sub;
  };

  // Total cart item count
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filtered Products Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // View gender filter
      if (currentView === 'men' && p.gender !== 'men' && p.gender !== 'unisex') return false;
      if (currentView === 'women' && p.gender !== 'women' && p.gender !== 'unisex') return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q) || (p.nameBn && p.nameBn.includes(q));
        const matchesCategory = p.category.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory) return false;
      }

      // Subcategory Filter
      if (selectedSubCategory !== 'All') {
        if (selectedSubCategory === 'Pants') {
          if (!['Pants', 'Baggy', 'Bootcut', 'Jeans'].includes(p.category)) return false;
        } else if (selectedSubCategory === 'Baggy') {
          const matchesCategory = p.category === 'Baggy';
          const matchesNameOrDesc = (p.category === 'Pants' || p.category === 'Baggy') && 
            (p.name.toLowerCase().includes('baggy') || (p.description && p.description.toLowerCase().includes('baggy')));
          if (!matchesCategory && !matchesNameOrDesc) return false;
        } else if (selectedSubCategory === 'Bootcut') {
          const matchesCategory = p.category === 'Bootcut';
          const matchesNameOrDesc = (p.category === 'Pants' || p.category === 'Bootcut') && 
            (p.name.toLowerCase().includes('bootcut') || (p.description && p.description.toLowerCase().includes('bootcut')));
          if (!matchesCategory && !matchesNameOrDesc) return false;
        } else if (selectedSubCategory === 'Jeans') {
          const matchesCategory = p.category === 'Jeans';
          const matchesNameOrDesc = (p.category === 'Pants' || p.category === 'Jeans') && 
            (p.name.toLowerCase().includes('jeans') || p.name.toLowerCase().includes('denim') || (p.description && p.description.toLowerCase().includes('jeans')));
          if (!matchesCategory && !matchesNameOrDesc) return false;
        } else if (p.category !== selectedSubCategory) {
          return false;
        }
      }

      // Size Filter
      if (selectedSizeFilter !== 'All' && !p.sizes.includes(selectedSizeFilter)) {
        return false;
      }

      // Color Filter
      if (selectedColorFilter !== 'All' && !p.colors.includes(selectedColorFilter)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'priceLow') return a.price - b.price;
      if (sortBy === 'priceHigh') return b.price - a.price;
      if (sortBy === 'bestSelling') return (b.isBestSelling ? 1 : 0) - (a.isBestSelling ? 1 : 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, currentView, searchQuery, selectedSubCategory, selectedSizeFilter, selectedColorFilter, sortBy]);

  // Derived sections for Homepage
  const trendingProducts = useMemo(() => products.filter((p) => p.isTrending), [products]);
  const bestSellingProducts = useMemo(() => products.filter((p) => p.isBestSelling), [products]);
  const newAddedProducts = useMemo(() => products.filter((p) => p.isNewAdded), [products]);

  // Available Sizes and Colors across current product list
  const availableSizes = ['All', 'S', 'M', 'L', 'XL', 'XXL', '26', '28', '30', '32', '34', '36', '38'];
  const availableColors = ['All', 'Black', 'White', 'Navy', 'Olive', 'Maroon', 'Beige', 'Khaki', 'Grey'];

  // Add Item to Cart
  const handleAddToCart = (item: CartItem) => {
    setCart((prevCart) => {
      // Check if identical item already exists (same product id, size, color)
      const existingIndex = prevCart.findIndex(
        (ci) =>
          ci.product.id === item.product.id &&
          ci.selectedSize === item.selectedSize &&
          ci.selectedColor === item.selectedColor
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [...prevCart, item];
    });

    setSelectedProductDetails(null);
    setIsCartOpen(true);
  };

  // Direct Buy Now handler
  const handleDirectBuyNow = (item: CartItem) => {
    handleAddToCart(item);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Update Cart Quantity
  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  // Remove Cart Item
  const handleRemoveCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Order Placed Success Handler
  const handleOrderPlaced = async (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setConfirmedOrder(newOrder);
    setCart([]); // Clear cart
    setIsCheckoutOpen(false);

    try {
      await createOrderApi(newOrder);
      const freshOrders = await fetchOrdersApi();
      if (freshOrders) {
        setOrders(freshOrders);
      }
    } catch (e) {
      console.error('Error persisting new order:', e);
    }
  };

  // Admin Login Handler
  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setAdminLoggedIn(true);
    setIsAdminLoginOpen(false);
    setCurrentView('admin');
  };

  // Admin Logout Handler
  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminLoggedIn(false);
    setCurrentView('home');
  };

  // Restore Seed Data
  const handleRestoreDefaults = () => {
    const res = restoreDefaults();
    setProducts(res.products);
    setSiteSettings(res.settings);
    seedDefaultsApi();
    alert('Default products and site settings restored successfully!');
  };

  return (
    <div className="min-h-screen bg-stone-950 font-sans text-stone-100 flex flex-col justify-between selection:bg-amber-500 selection:text-stone-950">
      
      {/* Fixed Horizontal Navigation Bar */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        cartCount={cartItemCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'admin' && !isAdmin) {
            setIsAdminLoginOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        siteSettings={siteSettings}
      />

      {/* Main View Area */}
      <main className="flex-1">
        
        {/* VIEW 1: ADMIN DASHBOARD */}
        {currentView === 'admin' && isAdmin ? (
          <AdminDashboard
            language={language}
            products={products}
            orders={orders}
            siteSettings={siteSettings}
            onUpdateProducts={setProducts}
            onUpdateOrders={setOrders}
            onUpdateSettings={(newSettings) => {
              console.log('App.tsx onUpdateSettings called with:', newSettings);
              setSiteSettings(newSettings);
            }}
            onRestoreDefaults={handleRestoreDefaults}
            onLogout={handleAdminLogout}
          />
        ) : currentView === 'contact' ? (
          /* VIEW 2: CONTACT PAGE */
          <ContactSection
            siteSettings={siteSettings}
            language={language}
            onReturnHome={() => setCurrentView('home')}
          />
        ) : (
          /* VIEW 3: HOME / MEN / WOMEN SHOPPING VIEWS */
          <div className="space-y-12 pb-16">
            
            {/* Show Hero Banner on Home Page when no active search query */}
            {currentView === 'home' && !searchQuery.trim() && (
              <HeroBanner
                language={language}
                onNavigate={(view) => setCurrentView(view)}
                siteSettings={siteSettings}
              />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6">
              
              {/* Category Page Title */}
              {currentView !== 'home' && (
                <div className="text-center space-y-2 border-b border-stone-800 pb-6">
                  <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">
                    ZORUQ COLLECTION
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100">
                    {currentView === 'men' ? t.menCollection : t.womenCollection}
                  </h1>
                </div>
              )}

              {/* Subcategories Filter Bar for Men */}
              {currentView === 'men' && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {['All', 'T-Shirt', 'Shirt', 'Polo', 'Pants', 'Hoodie', 'Watch'].map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubCategory(sub)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                          selectedSubCategory === sub || (sub === 'Pants' && ['Pants', 'Baggy', 'Bootcut', 'Jeans'].includes(selectedSubCategory))
                            ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                            : 'bg-stone-900 text-stone-300 border border-stone-800 hover:border-amber-500/40'
                        }`}
                      >
                        {getSubCategoryLabel(sub)}
                      </button>
                    ))}
                  </div>

                  {/* Special Pants Sub-sections Bar - ONLY rendered when Pants is clicked */}
                  {['Pants', 'Baggy', 'Bootcut', 'Jeans'].includes(selectedSubCategory) && (
                    <div className="bg-stone-900/90 border border-amber-500/30 rounded-2xl p-3 max-w-2xl mx-auto text-center space-y-2 shadow-inner transition-all animate-fadeIn">
                      <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-bold">
                        <span>👖 {language === 'bn' ? 'প্যান্টের ধরণ (Pants Types)' : 'Pants Sub-Sections'}:</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {[
                          { id: 'Pants', labelBn: 'সকল প্যান্ট (All Pants)', labelEn: 'All Pants' },
                          { id: 'Baggy', labelBn: 'ব্যাগী (Baggy)', labelEn: 'Baggy' },
                          { id: 'Bootcut', labelBn: 'বুটকাট (Bootcut)', labelEn: 'Bootcut' },
                          { id: 'Jeans', labelBn: 'জিন্স (Jeans)', labelEn: 'Jeans' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setSelectedSubCategory(item.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              selectedSubCategory === item.id
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md font-extrabold ring-2 ring-amber-400/50'
                                : 'bg-stone-950 text-stone-300 border border-stone-800 hover:border-amber-500/50 hover:text-amber-300'
                            }`}
                          >
                            {language === 'bn' ? item.labelBn : item.labelEn}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentView === 'women' && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {['All', 'Traditional', 'Dress', 'Shirt', 'Pants', 'Hoodie', 'Watch'].map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubCategory(sub)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                          selectedSubCategory === sub || (sub === 'Pants' && ['Pants', 'Baggy', 'Bootcut', 'Jeans'].includes(selectedSubCategory))
                            ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                            : 'bg-stone-900 text-stone-300 border border-stone-800 hover:border-amber-500/40'
                        }`}
                      >
                        {getSubCategoryLabel(sub)}
                      </button>
                    ))}
                  </div>

                  {/* Special Pants Sub-sections Bar for Women as well */}
                  {['Pants', 'Baggy', 'Bootcut', 'Jeans'].includes(selectedSubCategory) && (
                    <div className="bg-stone-900/90 border border-amber-500/30 rounded-2xl p-3 max-w-2xl mx-auto text-center space-y-2 shadow-inner transition-all animate-fadeIn">
                      <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-bold">
                        <span>👖 {language === 'bn' ? 'প্যান্টের ধরণ (Pants Types)' : 'Pants Sub-Sections'}:</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {[
                          { id: 'Pants', labelBn: 'সকল প্যান্ট (All Pants)', labelEn: 'All Pants' },
                          { id: 'Baggy', labelBn: 'ব্যাগী (Baggy)', labelEn: 'Baggy' },
                          { id: 'Bootcut', labelBn: 'বুটকাট (Bootcut)', labelEn: 'Bootcut' },
                          { id: 'Jeans', labelBn: 'জিন্স (Jeans)', labelEn: 'Jeans' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setSelectedSubCategory(item.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              selectedSubCategory === item.id
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md font-extrabold ring-2 ring-amber-400/50'
                                : 'bg-stone-950 text-stone-300 border border-stone-800 hover:border-amber-500/50 hover:text-amber-300'
                            }`}
                          >
                            {language === 'bn' ? item.labelBn : item.labelEn}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Filters & Sorting Controls */}
              <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  
                  {/* Left: Size & Color Filters */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-stone-300 font-semibold">
                      <Filter className="w-4 h-4 text-amber-400" />
                      <span>{t.filterBySize}:</span>
                      <select
                        value={selectedSizeFilter}
                        onChange={(e) => setSelectedSizeFilter(e.target.value)}
                        className="bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-400 font-bold focus:outline-none"
                      >
                        {availableSizes.map((sz) => (
                          <option key={sz} value={sz}>{sz}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-stone-300 font-semibold">
                      <span>{t.filterByColor}:</span>
                      <select
                        value={selectedColorFilter}
                        onChange={(e) => setSelectedColorFilter(e.target.value)}
                        className="bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-400 font-bold focus:outline-none"
                      >
                        {availableColors.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Right: Sorting */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-stone-400 font-medium">{t.sortBy}:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-100 font-semibold focus:outline-none"
                    >
                      <option value="newest">{t.sortNewest}</option>
                      <option value="bestSelling">{t.sortBestSelling}</option>
                      <option value="priceLow">{t.sortPriceLow}</option>
                      <option value="priceHigh">{t.sortPriceHigh}</option>
                    </select>

                    {(selectedSizeFilter !== 'All' || selectedColorFilter !== 'All' || selectedSubCategory !== 'All' || searchQuery) && (
                      <button
                        onClick={() => {
                          setSelectedSizeFilter('All');
                          setSelectedColorFilter('All');
                          setSelectedSubCategory('All');
                          setSearchQuery('');
                        }}
                        className="p-1.5 text-amber-400 hover:underline text-[11px] font-semibold"
                      >
                        {t.clearFilters}
                      </button>
                    )}
                  </div>

                </div>
              </div>

              {/* SEARCH RESULTS OR CATALOG SECTIONS */}
              {searchQuery.trim() || currentView !== 'home' ? (
                /* Filtered Grid View */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-xl font-bold text-stone-100">
                      {searchQuery ? `Search Results for "${searchQuery}"` : t.allProducts}
                    </h2>
                    <span className="text-xs text-stone-400 font-semibold">
                      Showing {filteredProducts.length} items
                    </span>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-16 bg-stone-900/50 border border-stone-800 rounded-2xl space-y-3">
                      <ShoppingBag className="w-12 h-12 text-stone-600 mx-auto" />
                      <p className="text-sm text-stone-400">{t.noProductsFound}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {filteredProducts.map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          language={language}
                          onOpenDetails={handleOpenProductDetails}
                          onQuickAddToCart={handleOpenProductDetails}
                          isAdmin={isAdmin}
                          onEdit={(prod) => {
                            setHomeEditingProduct(prod);
                            setIsHomeProductModalOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* HOMEPAGE SECTIONS: Trending, Best Selling, New Arrivals */
                <div className="space-y-16">
                  
                  {/* Section 1: Trending Products */}
                  {trendingProducts.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                        <div>
                          <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">
                            POPULAR NOW
                          </span>
                          <h2 className="font-serif text-2xl font-bold text-stone-100">
                            {t.trendingProducts}
                          </h2>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {trendingProducts.map((p) => (
                          <ProductCard
                            key={p.id}
                            product={p}
                            language={language}
                            onOpenDetails={handleOpenProductDetails}
                            onQuickAddToCart={handleOpenProductDetails}
                            isAdmin={isAdmin}
                            onEdit={(prod) => {
                              setHomeEditingProduct(prod);
                              setIsHomeProductModalOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 2: Best Selling Products */}
                  {bestSellingProducts.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                        <div>
                          <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">
                            TOP RATED
                          </span>
                          <h2 className="font-serif text-2xl font-bold text-stone-100">
                            {t.bestSellingProducts}
                          </h2>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {bestSellingProducts.map((p) => (
                          <ProductCard
                            key={p.id}
                            product={p}
                            language={language}
                            onOpenDetails={handleOpenProductDetails}
                            onQuickAddToCart={handleOpenProductDetails}
                            isAdmin={isAdmin}
                            onEdit={(prod) => {
                              setHomeEditingProduct(prod);
                              setIsHomeProductModalOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 3: New Added Products (Featured Collection) */}
                  {(newAddedProducts.length > 0 || isAdmin) && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/20 pb-3 gap-4">
                        <div>
                          <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">
                            FRESH ARRIVALS
                          </span>
                          <h2 className="font-serif text-2xl font-bold text-stone-100">
                            {t.newAddedProducts}
                          </h2>
                        </div>
                        {isAdmin && (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => {
                                setHomeEditingProduct(null);
                                setIsHomeProductModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer transform hover:scale-105 active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'নতুন প্রডাক্ট যোগ করুন' : 'Add New Product'}</span>
                            </button>
                            <button
                              onClick={() => setIsFeaturedModalOpen(true)}
                              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-stone-100 text-xs font-bold rounded-lg border border-stone-700 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Sliders className="w-3.5 h-3.5 text-amber-400" />
                              <span>{language === 'bn' ? 'কালেকশন সাজান' : 'Manage Collection'}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {newAddedProducts.length === 0 ? (
                        <div className="text-center py-10 bg-stone-900/50 border border-stone-800/60 rounded-2xl space-y-2">
                          <p className="text-sm text-stone-400">
                            {language === 'bn' ? 'ফিচার্ড কালেকশনটি খালি আছে।' : 'The featured collection is empty.'}
                          </p>
                          <p className="text-xs text-stone-500">
                            {language === 'bn' ? 'কালেকশনে নতুন প্রোডাক্ট যোগ করতে উপরের বোতামগুলো ব্যবহার করুন।' : 'Use the control buttons above to add products to this collection.'}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                          {newAddedProducts.map((p) => (
                            <ProductCard
                              key={p.id}
                              product={p}
                              language={language}
                              onOpenDetails={handleOpenProductDetails}
                              onQuickAddToCart={handleOpenProductDetails}
                              isAdmin={isAdmin}
                              onEdit={(prod) => {
                                setHomeEditingProduct(prod);
                                setIsHomeProductModalOpen(true);
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* Floating Multi-Social Chat Widget */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Expanded Social Channels Menu */}
        {isFloatingMenuOpen && (
          <div className="flex flex-col items-end gap-3 mb-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
            {/* WhatsApp Option */}
            <button
              onClick={() => handleSocialChatClick('whatsapp')}
              className="flex items-center gap-2.5 group cursor-pointer border-none bg-transparent outline-none"
              title="Chat on WhatsApp"
            >
              <span className="bg-stone-900 border border-stone-800 text-stone-200 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                WhatsApp
              </span>
              <div className="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all">
                <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </div>
            </button>

            {/* Facebook Messenger Option */}
            <button
              onClick={() => handleSocialChatClick('facebook')}
              className="flex items-center gap-2.5 group cursor-pointer border-none bg-transparent outline-none"
              title="Message on Facebook Messenger"
            >
              <span className="bg-stone-900 border border-stone-800 text-stone-200 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                Messenger
              </span>
              <div className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all">
                <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.91 1.448 5.503 3.71 7.152v3.743c0 .248.243.414.464.316l4.135-1.838c.54.15 1.106.23 1.691.23 5.523 0 10-4.146 10-9.244S17.523 2 12 2zm1.096 11.905l-2.222-2.37-4.329 2.37 4.757-5.053 2.27 2.37 4.281-2.37-4.757 5.053z"/>
                </svg>
              </div>
            </button>

            {/* Instagram Option */}
            <button
              onClick={() => handleSocialChatClick('instagram')}
              className="flex items-center gap-2.5 group cursor-pointer border-none bg-transparent outline-none"
              title="Message on Instagram"
            >
              <span className="bg-stone-900 border border-stone-800 text-stone-200 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                Instagram
              </span>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/9/95/Instagram_logo_2022.svg" 
                alt="Instagram" 
                className="w-12 h-12 shadow-lg hover:scale-110 transition-all rounded-xl"
              />
            </button>
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <div className="relative flex items-center justify-end">
          {/* Persistent speech bubble label */}
          {!isFloatingMenuOpen && (
            <div className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-stone-900 border border-amber-500/30 text-stone-100 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 select-none pointer-events-none animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>{language === 'bn' ? 'যেকোনো তথ্যের জন্য মেসেজ দিন' : 'Message for any information'}</span>
            </div>
          )}

          <button
            onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer transform hover:scale-110 active:scale-95 z-50 border-none outline-none ${
              isFloatingMenuOpen
                ? 'bg-stone-800 text-amber-400 rotate-90'
                : 'bg-amber-500 text-stone-950 shadow-amber-500/20'
            }`}
            title={language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Support'}
          >
            {isFloatingMenuOpen ? (
              <X className="w-6 h-6 transition-transform" />
            ) : (
              <MessageSquare className="w-6 h-6 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProductDetails}
        language={language}
        onClose={handleCloseProductDetails}
        onAddToCart={handleAddToCart}
        onDirectBuyNow={handleDirectBuyNow}
        isAdmin={isAdmin}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        language={language}
        cart={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Customer Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        language={language}
        cart={cart}
        siteSettings={siteSettings}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Order Confirmed Success Modal */}
      <OrderSuccessModal
        order={confirmedOrder}
        siteSettings={siteSettings}
        language={language}
        onClose={() => setConfirmedOrder(null)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
      />

      {/* Track Order Live Status Modal */}
      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
        orders={orders}
        language={language}
        siteSettings={siteSettings}
        onRefreshOrders={handleRefreshOrders}
      />

      {/* Admin Login Access Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        language={language}
        siteSettings={siteSettings}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Admin Home Page Product Modal */}
      {isHomeProductModalOpen && (
        <AdminProductModal
          language={language}
          product={homeEditingProduct}
          onClose={() => {
            setIsHomeProductModalOpen(false);
            setHomeEditingProduct(null);
          }}
          onSave={handleSaveProductFromHome}
          preSetIsNewAdded={true}
        />
      )}

      {/* Admin Featured Collection Quick-Manage Modal */}
      {isFeaturedModalOpen && (
        <AdminFeaturedCollectionModal
          language={language}
          products={products}
          onClose={() => setIsFeaturedModalOpen(false)}
          onSave={handleSaveFeaturedCollection}
        />
      )}

      {/* Luxury Footer */}
      <Footer
        language={language}
        siteSettings={siteSettings}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onNavigate={(view) => {
          if (view === 'admin' && !isAdmin) {
            setIsAdminLoginOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
      />

    </div>
  );
}
