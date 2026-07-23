import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag, Search, Filter, Phone, Sparkles, MessageSquare, ArrowRight, X, Check
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
  createOrderApi, seedDefaultsApi
} from './utils/api';
import { formatWhatsappNumber } from './utils/formatters';

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

  // Refresh orders from API for live tracking
  const handleRefreshOrders = async () => {
    const apiOrders = await fetchOrdersApi();
    if (apiOrders) {
      setOrders(apiOrders);
    }
  };

  // Fetch initial state from Cloud SQL API
  useEffect(() => {
    async function loadCloudSqlData() {
      const [apiProds, apiOrders, apiSettings] = await Promise.all([
        fetchProductsApi(),
        fetchOrdersApi(),
        fetchSettingsApi(),
      ]);
      if (apiProds && apiProds.length > 0) {
        setProducts(apiProds);
      }
      if (apiOrders) {
        setOrders(apiOrders);
      }
      if (apiSettings) {
        setSiteSettings(apiSettings);
      }
    }
    loadCloudSqlData();
  }, []);

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
      if (selectedSubCategory !== 'All' && p.category !== selectedSubCategory) {
        return false;
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
  const handleOrderPlaced = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    createOrderApi(newOrder);
    setConfirmedOrder(newOrder);
    setCart([]); // Clear cart
    setIsCheckoutOpen(false);
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
            onUpdateSettings={setSiteSettings}
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
              />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6">
              
              {/* Category Page Title */}
              {currentView !== 'home' && (
                <div className="text-center space-y-2 border-b border-stone-800 pb-6">
                  <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">
                    SHOPPING SOLUTION COLLECTION
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100">
                    {currentView === 'men' ? t.menCollection : t.womenCollection}
                  </h1>
                </div>
              )}

              {/* Subcategories Filter Bar for Men or Women */}
              {currentView === 'men' && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {['All', 'T-Shirt', 'Shirt', 'Polo', 'Pants', 'Hoodie', 'Watch'].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubCategory(sub)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        selectedSubCategory === sub
                          ? 'bg-amber-500 text-stone-950 shadow-md'
                          : 'bg-stone-900 text-stone-300 border border-stone-800 hover:border-amber-500/40'
                      }`}
                    >
                      {getSubCategoryLabel(sub)}
                    </button>
                  ))}
                </div>
              )}

              {currentView === 'women' && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {['All', 'Traditional', 'Dress', 'Shirt', 'Pants', 'Hoodie', 'Watch'].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubCategory(sub)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        selectedSubCategory === sub
                          ? 'bg-amber-500 text-stone-950 shadow-md'
                          : 'bg-stone-900 text-stone-300 border border-stone-800 hover:border-amber-500/40'
                      }`}
                    >
                      {getSubCategoryLabel(sub)}
                    </button>
                  ))}
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
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 3: New Added Products */}
                  {newAddedProducts.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                        <div>
                          <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">
                            FRESH ARRIVALS
                          </span>
                          <h2 className="font-serif text-2xl font-bold text-stone-100">
                            {t.newAddedProducts}
                          </h2>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {newAddedProducts.map((p) => (
                          <ProductCard
                            key={p.id}
                            product={p}
                            language={language}
                            onOpenDetails={handleOpenProductDetails}
                            onQuickAddToCart={handleOpenProductDetails}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* Floating Instant WhatsApp Button */}
      <a
        href={`https://wa.me/${formatWhatsappNumber(siteSettings.adminWhatsapp)}?text=${encodeURIComponent('Hello Shopping Solution, I need assistance.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-600/50 hover:scale-110 transition-all cursor-pointer group"
        title="Chat on WhatsApp"
      >
        <MessageSquare className="w-7 h-7 group-hover:rotate-12 transition-transform" />
      </a>

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProductDetails}
        language={language}
        onClose={handleCloseProductDetails}
        onAddToCart={handleAddToCart}
        onDirectBuyNow={handleDirectBuyNow}
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
