import React from 'react';
import { ArrowRight, ShieldCheck, Truck, Sparkles, RefreshCw } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface HeroBannerProps {
  language: Language;
  onNavigate: (view: 'men' | 'women' | 'home') => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ language, onNavigate }) => {
  const t = translations[language];

  return (
    <div className="relative bg-stone-950 overflow-hidden text-stone-100 border-b border-amber-500/20">
      
      {/* Background Decorative Glow & Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-stone-950 to-stone-950 opacity-80 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Content Left */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {language === 'en' ? 'New Luxury Edition' : 'নতুন লাক্সারি সংস্করণ'}
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-100 leading-tight">
              {t.heroTitle}
            </h1>

            <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
              {t.heroSubtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                onClick={() => onNavigate('men')}
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm tracking-wide shadow-xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>{t.shopMen}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('women')}
                className="px-7 py-3.5 rounded-full bg-stone-900 border border-amber-500/40 hover:bg-stone-800 text-amber-400 font-bold text-sm tracking-wide shadow-lg hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{t.shopWomen}</span>
              </button>
            </div>

            {/* Micro stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-stone-800/80 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="font-serif text-xl sm:text-2xl font-bold text-amber-400">100%</p>
                <p className="text-xs text-stone-400 font-light">
                  {language === 'en' ? 'Original Fabric' : 'অরিজিনাল ফেব্রিক'}
                </p>
              </div>
              <div>
                <p className="font-serif text-xl sm:text-2xl font-bold text-amber-400">24-48h</p>
                <p className="text-xs text-stone-400 font-light">
                  {language === 'en' ? 'Fast Delivery' : 'দ্রুত ডেলিভারি'}
                </p>
              </div>
              <div>
                <p className="font-serif text-xl sm:text-2xl font-bold text-amber-400">COD</p>
                <p className="text-xs text-stone-400 font-light">
                  {language === 'en' ? 'Cash on Delivery' : 'ক্যাশ অন ডেলিভারি'}
                </p>
              </div>
            </div>

          </div>

          {/* Hero Visual Right */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer Decorative Frame */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500 to-stone-700 opacity-40 blur-lg"></div>

              <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-stone-900 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1000"
                  alt="Shopping Solution Fashion Collection"
                  className="w-full h-[420px] object-cover hover:scale-105 transition-transform duration-700"
                />

                {/* Floating Overlay Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-stone-950/80 backdrop-blur-md p-4 rounded-xl border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 font-semibold tracking-widest uppercase block">
                      {language === 'en' ? 'Featured Collection' : 'বিশেষ আকর্ষণ'}
                    </span>
                    <p className="text-sm font-bold text-stone-100">
                      {language === 'en' ? 'SHOPPING SOLUTION Executive Apparel' : 'শপিং সলিউশন এক্সিকিউটিভ অ্যাটায়ার'}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-amber-500 text-stone-950 font-extrabold">
                    NEW
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Feature Value Banner Bar */}
      <div className="bg-stone-900/90 border-t border-stone-800 py-4 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 text-stone-300 text-xs sm:text-sm font-medium">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{language === 'en' ? 'Guaranteed Premium Quality' : '১০০% প্রিমিয়াম কোয়ালিটি'}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-stone-300 text-xs sm:text-sm font-medium">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>{language === 'en' ? 'Fast Express Delivery' : 'সমগ্র বাংলাদেশে হোম ডেলিভারি'}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-stone-300 text-xs sm:text-sm font-medium">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>{language === 'en' ? 'Easy Exchange Policy' : 'সহজ রিটার্ন ও এক্সচেঞ্জ'}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-stone-300 text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{language === 'en' ? 'bKash / Nagad / COD' : 'বিকাশ / নগদ / ক্যাশ অন ডেলিভারি'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
