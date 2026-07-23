import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Globe, UserCheck, PhoneCall, ShieldCheck, PackageSearch } from 'lucide-react';
import { Language, SiteSettings } from '../types';
import { translations } from '../data/translations';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenTrackOrder: () => void;
  currentView: 'home' | 'men' | 'women' | 'contact' | 'admin';
  onNavigate: (view: 'home' | 'men' | 'women' | 'contact' | 'admin') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  siteSettings: SiteSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  cartCount,
  onOpenCart,
  onOpenTrackOrder,
  currentView,
  onNavigate,
  searchQuery,
  onSearchChange,
  isAdmin,
  onOpenAdminLogin,
  siteSettings
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const t = translations[language];

  const handleNavClick = (view: 'home' | 'men' | 'women' | 'contact' | 'admin') => {
    onNavigate(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-stone-950/90 backdrop-blur-md border-b border-amber-500/20 text-stone-100 shadow-xl transition-all">
      {/* Top Banner Announcement */}
      <div className="bg-gradient-to-r from-amber-900/60 via-stone-900 to-amber-900/60 text-amber-200 text-xs py-1.5 px-4 text-center border-b border-amber-500/10 font-medium tracking-wide flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        <span>
          {language === 'en'
            ? '✨ Free Home Delivery on orders over ৳3,999 | Cash on Delivery Available'
            : '✨ ৳৩,৯৯৯ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি | ক্যাশ অন ডেলিভারি সুবিধা'}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavClick('home')}
            className="cursor-pointer group flex items-center gap-2 sm:gap-3"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 p-0.5 shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">
              <div className="w-full h-full bg-stone-950 rounded-[7px] flex items-center justify-center">
                <span className="font-serif text-base sm:text-xl font-extrabold text-amber-400 tracking-wider">SS</span>
              </div>
            </div>
            <div>
              <h1 className="font-serif text-sm sm:text-2xl font-bold tracking-wider text-stone-100 group-hover:text-amber-400 transition-colors leading-tight">
                SHOPPING SOLUTION
              </h1>
              <p className="text-[9px] sm:text-[10px] tracking-widest text-amber-400/80 uppercase">
                {t.brandTagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 font-medium text-sm">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-4 py-2 rounded-full transition-all ${
                currentView === 'home'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner'
                  : 'text-stone-300 hover:text-amber-400 hover:bg-stone-900'
              }`}
            >
              {t.navHome}
            </button>
            <button
              onClick={() => handleNavClick('men')}
              className={`px-4 py-2 rounded-full transition-all ${
                currentView === 'men'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner'
                  : 'text-stone-300 hover:text-amber-400 hover:bg-stone-900'
              }`}
            >
              {t.navMen}
            </button>
            <button
              onClick={() => handleNavClick('women')}
              className={`px-4 py-2 rounded-full transition-all ${
                currentView === 'women'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner'
                  : 'text-stone-300 hover:text-amber-400 hover:bg-stone-900'
              }`}
            >
              {t.navWomen}
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`px-4 py-2 rounded-full transition-all ${
                currentView === 'contact'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner'
                  : 'text-stone-300 hover:text-amber-400 hover:bg-stone-900'
              }`}
            >
              {t.navContact}
            </button>

            {/* Track Order / My Orders Live Button */}
            <button
              onClick={onOpenTrackOrder}
              className="px-3.5 py-1.5 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/40 hover:bg-amber-500 hover:text-stone-950 font-bold transition-all flex items-center gap-1.5 shadow-md group"
              title="Track Order & Check Realtime Status"
            >
              <PackageSearch className="w-3.5 h-3.5 text-amber-400 group-hover:text-stone-950" />
              <span>{language === 'en' ? 'Track Order' : 'অর্ডার ট্র্যাক'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
            
            {/* WhatsApp Admin Direct Link */}
            <a
              href={`https://wa.me/${siteSettings.adminWhatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </nav>

          {/* Right Actions (Search, Language, Cart, Admin) */}
          <div className="flex items-center space-x-3">
            
            {/* Search Input Toggle */}
            <div className="relative">
              {showSearchInput ? (
                <div className="flex items-center bg-stone-900 border border-amber-500/30 rounded-full px-3 py-1.5 w-48 sm:w-64 transition-all">
                  <Search className="w-4 h-4 text-stone-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={t.navSearch}
                    autoFocus
                    className="w-full bg-transparent text-xs text-stone-100 placeholder-stone-500 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      setShowSearchInput(false);
                      onSearchChange('');
                    }}
                    className="text-stone-400 hover:text-stone-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearchInput(true)}
                  className="p-2 text-stone-300 hover:text-amber-400 hover:bg-stone-900 rounded-full transition-colors"
                  title={t.navSearch}
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(language === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:border-amber-500/40 hover:text-amber-400 transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'en' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Cart Icon */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 text-stone-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-full transition-all group"
            >
              <ShoppingBag className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Login / Panel Button */}
            <button
              onClick={() => {
                if (isAdmin) {
                  handleNavClick('admin');
                } else {
                  onOpenAdminLogin();
                }
              }}
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all shadow-md ${
                isAdmin
                  ? 'bg-amber-500 text-stone-950 font-bold hover:bg-amber-400'
                  : 'bg-stone-900 border border-amber-500/30 text-amber-400 hover:bg-stone-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAdmin ? t.adminDashboard : t.navAdmin}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-300 hover:text-amber-400 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Persistent Horizontal Sub-Navbar Row */}
      <div className="md:hidden border-t border-stone-900 bg-stone-950/95 py-2.5 px-3 overflow-x-auto scrollbar-none scroll-smooth">
        <div className="flex items-center justify-between gap-1.5 min-w-[340px]">
          <button
            onClick={() => handleNavClick('home')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-center transition-all whitespace-nowrap ${
              currentView === 'home'
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'text-stone-300 hover:text-amber-400 bg-stone-900/40 border border-stone-800'
            }`}
          >
            {t.navHome}
          </button>

          <button
            onClick={() => handleNavClick('men')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-center transition-all whitespace-nowrap ${
              currentView === 'men'
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'text-stone-300 hover:text-amber-400 bg-stone-900/40 border border-stone-800'
            }`}
          >
            {t.navMen}
          </button>

          <button
            onClick={() => handleNavClick('women')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-center transition-all whitespace-nowrap ${
              currentView === 'women'
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'text-stone-300 hover:text-amber-400 bg-stone-900/40 border border-stone-800'
            }`}
          >
            {t.navWomen}
          </button>

          <button
            onClick={onOpenTrackOrder}
            className="flex-1 py-1.5 px-2 rounded-xl text-xs font-extrabold text-center transition-all whitespace-nowrap bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center gap-1 active:bg-amber-500 active:text-stone-950"
          >
            <PackageSearch className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'en' ? 'Track' : 'ট্র্যাক'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-stone-950 border-b border-amber-500/20 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          <button
            onClick={() => handleNavClick('contact')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
              currentView === 'contact' ? 'bg-amber-500/20 text-amber-400' : 'text-stone-300'
            }`}
          >
            {t.navContact}
          </button>

          <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
            <button
              onClick={() => {
                if (isAdmin) {
                  handleNavClick('admin');
                } else {
                  onOpenAdminLogin();
                }
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isAdmin ? t.adminDashboard : t.navAdmin}</span>
            </button>

            <a
              href={`https://wa.me/${siteSettings.adminWhatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-lg"
            >
              <PhoneCall className="w-4 h-4" />
              <span>WhatsApp Admin</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
