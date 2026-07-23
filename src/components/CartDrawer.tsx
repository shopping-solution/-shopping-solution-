import React from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { CartItem, Language } from '../types';
import { translations } from '../data/translations';

interface CartDrawerProps {
  isOpen: boolean;
  language: Language;
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  language,
  cart,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const t = translations[language];

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-stone-900 border-l border-amber-500/30 text-stone-100 flex flex-col justify-between shadow-2xl">
          
          {/* Cart Header */}
          <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-serif font-bold text-stone-100">
                {t.shoppingCart}
              </h2>
              <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                {cart.length}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-100 rounded-full hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-stone-600 mx-auto" />
                <p className="text-sm text-stone-400 font-medium">{t.emptyCart}</p>
              </div>
            ) : (
              cart.map((item, idx) => {
                const displayName =
                  language === 'bn' && item.product.nameBn
                    ? item.product.nameBn
                    : item.product.name;

                return (
                  <div
                    key={idx}
                    className="flex gap-4 p-3 bg-stone-950 border border-stone-800 rounded-xl relative group hover:border-amber-500/30 transition-all"
                  >
                    {/* Item Image */}
                    <img
                      src={item.product.images[0]}
                      alt={displayName}
                      className="w-20 h-20 object-cover rounded-lg bg-stone-900 border border-stone-800 flex-shrink-0"
                    />

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-stone-100 line-clamp-1">
                          {displayName}
                        </h4>

                        <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-1">
                          <span>
                            Size: <strong className="text-amber-400">{item.selectedSize}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Color: <strong className="text-amber-400">{item.selectedColor}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center bg-stone-900 border border-stone-800 rounded px-1">
                          <button
                            onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                            className="p-1 text-stone-400 hover:text-amber-400"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                            className="p-1 text-stone-400 hover:text-amber-400"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="text-xs font-serif font-extrabold text-amber-400">
                          ৳ {(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Delete Item Button */}
                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="text-stone-500 hover:text-rose-400 p-1 self-start transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-800 bg-stone-950 space-y-4">
              {/* Free Delivery Promo Message */}
              <div className="p-3 rounded-lg text-xs font-semibold bg-stone-900 border border-stone-800">
                {subtotal >= 3999 ? (
                  <div className="text-emerald-400 flex items-center gap-1.5">
                    <span>🎉</span>
                    <span>
                      {language === 'bn'
                        ? 'আপনি ৩,৯৯৯ টাকার বেশি শপিং করায় ডেলিভারি চার্জ মাফ!'
                        : 'Free delivery unlocked on shopping over ৳3,999!'}
                    </span>
                  </div>
                ) : (
                  <div className="text-stone-300">
                    {language === 'bn' ? (
                      <span>
                        আর <strong className="text-amber-400 font-mono">৳ {(3999 - subtotal).toLocaleString()}</strong> টাকার শপিং করলেই ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-amber-400 font-mono">৳ {(3999 - subtotal).toLocaleString()}</strong> more to unlock <strong className="text-emerald-400">FREE delivery</strong>!
                      </span>
                    )}
                    {/* Tiny Progress Bar */}
                    <div className="w-full bg-stone-950 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-350"
                        style={{ width: `${Math.min(100, (subtotal / 3999) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-300">
                  <span>{t.subtotal}:</span>
                  <span className="font-serif font-bold text-amber-400 text-sm">
                    ৳ {subtotal.toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-stone-500">
                  * Delivery fee calculated at checkout based on location.
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs sm:text-sm tracking-wide shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.proceedToCheckout}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
