import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { Language, SiteSettings } from '../types';
import { translations } from '../data/translations';
import { formatWhatsappNumber } from '../utils/formatters';

interface FooterProps {
  language: Language;
  siteSettings: SiteSettings;
  onNavigate: (view: 'home' | 'men' | 'women' | 'contact' | 'admin') => void;
  onOpenTrackOrder?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ language, siteSettings, onNavigate, onOpenTrackOrder }) => {
  const t = translations[language];

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-amber-500/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-stone-950 font-serif font-extrabold text-lg shadow-md">
                SS
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-100 tracking-wider">
                  SHOPPING SOLUTION
                </h3>
                <p className="text-[10px] text-amber-400 uppercase tracking-widest">
                  {t.brandTagline}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-400 font-light leading-relaxed max-w-sm">
              {t.footerAbout}
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href={siteSettings.facebookUrl || 'https://www.facebook.com/share/1DQAkf8T7T/'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-stone-900 border border-blue-500/30 hover:border-blue-500 flex items-center justify-center text-blue-400 hover:text-white hover:bg-blue-600 transition-all shadow-md group"
                title="SHOPPING SOLUTION Facebook Page"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href={siteSettings.instagramUrl || 'https://www.instagram.com/shopping_solution_'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-stone-900 border border-pink-500/30 hover:border-pink-500 flex items-center justify-center text-pink-400 hover:text-white hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 transition-all shadow-md group"
                title="SHOPPING SOLUTION Instagram (@shopping_solution_)"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href={`https://wa.me/${formatWhatsappNumber(siteSettings.adminWhatsapp)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-stone-900 border border-emerald-500/30 hover:border-emerald-500 flex items-center justify-center text-emerald-400 hover:text-white hover:bg-emerald-600 transition-all shadow-md group"
                title="WhatsApp Direct Chat"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-sm font-bold text-amber-400 uppercase tracking-wider">
              {t.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-400 transition-colors"
                >
                  {t.navHome}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('men')}
                  className="hover:text-amber-400 transition-colors"
                >
                  {t.menCollection}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('women')}
                  className="hover:text-amber-400 transition-colors"
                >
                  {t.womenCollection}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-amber-400 transition-colors"
                >
                  {t.navContact}
                </button>
              </li>
              {onOpenTrackOrder && (
                <li>
                  <button
                    onClick={onOpenTrackOrder}
                    className="hover:text-amber-400 text-amber-400 font-bold transition-colors flex items-center gap-1"
                  >
                    <span>{language === 'en' ? '🔍 Track Order Live' : '🔍 লাইভ অর্ডার ট্র্যাক করুন'}</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Customer Care */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-serif text-sm font-bold text-amber-400 uppercase tracking-wider">
              {t.customerCare}
            </h4>
            <div className="space-y-2 text-xs text-stone-400 font-light">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <a href={`tel:${siteSettings.adminPhone.replace(/[^0-9+]/g, '')}`} className="hover:text-amber-400 transition-colors">
                  {siteSettings.adminPhone || 'N/A'}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <a href={`mailto:${siteSettings.adminEmail}`} className="hover:text-amber-400 transition-colors">
                  {siteSettings.adminEmail || 'N/A'}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>{siteSettings.adminAddress || 'Banani, Dhaka, Bangladesh'}</span>
              </p>
              <div className="pt-2 flex items-center gap-2 text-[10px] text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Secure Checkout with bKash / Nagad / COD</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & payment methods */}
        <div className="pt-8 border-t border-stone-900 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500">
          <p>{t.copyright}</p>
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-stone-400">
            <span className="px-2 py-1 bg-pink-950/60 border border-pink-500/30 text-pink-300 rounded">
              bKash
            </span>
            <span className="px-2 py-1 bg-orange-950/60 border border-orange-500/30 text-orange-300 rounded">
              Nagad
            </span>
            <span className="px-2 py-1 bg-amber-950/60 border border-amber-500/30 text-amber-300 rounded">
              Cash On Delivery
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
