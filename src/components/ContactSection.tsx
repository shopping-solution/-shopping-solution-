import React, { useState } from 'react';
import { Phone, MessageSquare, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { SiteSettings, Language } from '../types';
import { translations } from '../data/translations';
import { formatWhatsappNumber, getGmailComposeUrl } from '../utils/formatters';

interface ContactSectionProps {
  siteSettings: SiteSettings;
  language: Language;
  onReturnHome: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  siteSettings,
  language,
  onReturnHome,
}) => {
  const t = translations[language];

  const [showCallPopup, setShowCallPopup] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [inquiryText, setInquiryText] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const cleanPhone = siteSettings.adminPhone.replace(/[^0-9+]/g, '');
  const cleanWhatsapp = formatWhatsappNumber(siteSettings.adminWhatsapp);

  const handlePhoneClick = () => {
    setShowCallPopup(true);
  };

  const handleConfirmCall = () => {
    setShowCallPopup(false);
    window.location.href = `tel:${cleanPhone}`;
  };

  const handleDeclineCall = () => {
    setShowCallPopup(false);
    onReturnHome();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => setFormSent(false), 4000);
    setName('');
    setPhone('');
    setInquiryText('');
  };

  return (
    <div className="bg-stone-950 text-stone-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Title */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">
            SHOPPING SOLUTION SUPPORT
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100">
            {t.contactTitle}
          </h2>
          <p className="text-sm text-stone-400 font-light max-w-xl mx-auto">
            {t.contactSubtitle}
          </p>
        </div>

        {/* Primary Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Admin Phone Card with Popup Trigger */}
          <div className="bg-stone-900 border border-amber-500/30 p-6 rounded-2xl space-y-4 hover:border-amber-500/60 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Phone className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-stone-100">{t.adminPhone}</h3>
              <p className="text-xs text-stone-400">Direct Helpline for immediate assistance</p>
            </div>

            <button
              onClick={handlePhoneClick}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Phone className="w-4 h-4" />
              <span>{siteSettings.adminPhone} - {t.callNow}</span>
            </button>
          </div>

          {/* WhatsApp Direct Chat Card */}
          <div className="bg-stone-900 border border-emerald-500/30 p-6 rounded-2xl space-y-4 hover:border-emerald-500/60 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-stone-100">{t.adminWhatsapp}</h3>
              <p className="text-xs text-stone-400">Instant Chat & Order updates on WhatsApp</p>
            </div>

            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Hello Shopping Solution Admin, I have an inquiry about my order.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.openWhatsappChat}</span>
            </a>
          </div>

        </div>

        {/* Contact Info & Inquiry Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-stone-900 border border-stone-800 p-6 sm:p-8 rounded-2xl">
          
          <div className="md:col-span-5 space-y-6 border-b md:border-b-0 md:border-r border-stone-800 pb-6 md:pb-0 md:pr-6">
            <h3 className="font-serif text-lg font-bold text-amber-400">Head Office & Showroom</h3>
            
            <div className="space-y-4 text-xs text-stone-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-100">Location Address:</strong>
                  <span>{siteSettings.adminAddress || 'Level 4, Shopping Solution Tower, Banani C/A, Dhaka-1213, Bangladesh'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-100">Email Address:</strong>
                  <a 
                    href={`mailto:${siteSettings.adminEmail}`}
                    className="hover:text-amber-400 underline transition-colors"
                  >
                    {siteSettings.adminEmail || 'Not configured'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-100">Operating Hours:</strong>
                  <span>Saturday - Thursday: 10:00 AM - 09:00 PM (Everyday Online Support)</span>
                </div>
              </div>

              {/* Official Social Media Pages */}
              <div className="pt-2 space-y-2 border-t border-stone-800/80">
                <strong className="block text-stone-100 font-serif">Official Social Media:</strong>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={siteSettings.facebookUrl || 'https://www.facebook.com/share/1DQAkf8T7T/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/60 border border-blue-500/40 hover:bg-blue-600 hover:text-white text-blue-300 text-xs font-semibold transition-all shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook Page</span>
                  </a>

                  <a
                    href={siteSettings.instagramUrl || 'https://www.instagram.com/shopping_solution_'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-950/60 border border-pink-500/40 hover:bg-gradient-to-r hover:from-amber-500 hover:to-pink-600 hover:text-white text-pink-300 text-xs font-semibold transition-all shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Instagram (@shopping_solution_)</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="md:col-span-7 space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-100">Send Direct Message</h3>
            
            {formSent && (
              <div className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Thank you! Your inquiry has been sent to Admin.</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                />
                <input
                  type="tel"
                  required
                  placeholder="Your Mobile Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <textarea
                rows={3}
                required
                placeholder="Write your question or order detail here..."
                value={inquiryText}
                onChange={(e) => setInquiryText(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
              />

              <button
                type="submit"
                className="py-2.5 px-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Phone Call Confirmation Popup Dialog */}
      {showCallPopup && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-stone-900 border border-amber-500/40 p-6 rounded-2xl max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-full flex items-center justify-center mx-auto">
              <Phone className="w-6 h-6 animate-pulse" />
            </div>

            <h3 className="font-serif text-lg font-bold text-stone-100">
              {t.callConfirmationTitle}
            </h3>

            <p className="text-xs text-amber-400 font-mono font-bold">
              {siteSettings.adminPhone}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleConfirmCall}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
              >
                {t.yesCall}
              </button>

              <button
                onClick={handleDeclineCall}
                className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-all cursor-pointer"
              >
                {t.noReturnHome}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
