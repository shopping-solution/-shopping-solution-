import React, { useState } from 'react';
import { Phone, MessageSquare, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { SiteSettings, Language } from '../types';
import { translations } from '../data/translations';

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
  const cleanWhatsapp = siteSettings.adminWhatsapp.replace(/[^0-9]/g, '');

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
                  <span>Level 4, Shopping Solution Tower, Banani C/A, Dhaka-1213, Bangladesh</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-100">Email Address:</strong>
                  <span>{siteSettings.adminEmail}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-100">Operating Hours:</strong>
                  <span>Saturday - Thursday: 10:00 AM - 09:00 PM (Everyday Online Support)</span>
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
