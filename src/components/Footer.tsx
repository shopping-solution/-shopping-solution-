import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { Language, SiteSettings } from '../types';
import { translations } from '../data/translations';

interface FooterProps {
  language: Language;
  siteSettings: SiteSettings;
  onNavigate: (view: 'home' | 'men' | 'women' | 'contact' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ language, siteSettings, onNavigate }) => {
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
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-8 h-8 rounded-full bg-stone-900 border border-stone-800 hover:border-amber-500/50 flex items-center justify-center text-stone-400 hover:text-amber-400 transition-colors"
                title="Facebook"
              >
                <span className="font-bold text-xs">fb</span>
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-8 h-8 rounded-full bg-stone-900 border border-stone-800 hover:border-amber-500/50 flex items-center justify-center text-stone-400 hover:text-amber-400 transition-colors"
                title="Instagram"
              >
                <span className="font-bold text-xs">ig</span>
              </a>
              <a
                href={`https://wa.me/${siteSettings.adminWhatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-stone-900 border border-emerald-500/30 hover:border-emerald-500 flex items-center justify-center text-emerald-400 hover:scale-105 transition-all"
                title="WhatsApp"
              >
                <span className="font-bold text-xs">wa</span>
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
                <span>{siteSettings.adminPhone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>{siteSettings.adminEmail}</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Banani, Dhaka, Bangladesh</span>
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
