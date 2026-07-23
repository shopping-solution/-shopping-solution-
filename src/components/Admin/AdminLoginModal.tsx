import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Key, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Language, SiteSettings } from '../../types';
import { translations } from '../../data/translations';

interface AdminLoginModalProps {
  isOpen: boolean;
  language: Language;
  siteSettings: SiteSettings;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  language,
  siteSettings,
  onClose,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const t = translations[language];

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = siteSettings.adminPassword || 'Admin#2026!Sec';
    if (password.trim() === correctPassword) {
      setError(null);
      setPassword('');
      onLoginSuccess();
    } else {
      setError(
        language === 'en'
          ? 'Incorrect admin password! Please try again.'
          : 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিয়ে চেষ্টা করুন।'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="relative bg-stone-900 border border-amber-500/40 w-full max-w-md rounded-2xl shadow-2xl p-6 text-stone-100 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-100 rounded-full hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-100">
            {t.adminLoginTitle}
          </h3>
          <p className="text-xs text-stone-400">
            SHOPPING SOLUTION Management Portal
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              {t.adminPassword}:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder={language === 'en' ? 'Enter admin password' : 'এডমিন পাসওয়ার্ড লিখুন'}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-stone-100 focus:border-amber-400 focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-stone-500 hover:text-stone-300 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.login}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
