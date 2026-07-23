import React, { useState } from 'react';
import { X, Check, ShoppingBag, Zap, AlertCircle, Plus, Minus, ShieldCheck, Truck, Share2, Copy, Link as LinkIcon } from 'lucide-react';
import { Product, Language, CartItem } from '../types';
import { translations } from '../data/translations';

interface ProductDetailsModalProps {
  product: Product | null;
  language: Language;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onDirectBuyNow: (item: CartItem) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  language,
  onClose,
  onAddToCart,
  onDirectBuyNow,
}) => {
  if (!product) return null;

  const t = translations[language];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const displayName = language === 'bn' && product.nameBn ? product.nameBn : product.name;
  const displayDesc = language === 'bn' && product.descriptionBn ? product.descriptionBn : product.description;

  const handleCopyLink = () => {
    const shareableUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    navigator.clipboard.writeText(shareableUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const validateSelection = (): boolean => {
    if (!selectedSize) {
      setValidationError(t.sizeRequiredError);
      return false;
    }
    if (!selectedColor) {
      setValidationError(t.colorRequiredError);
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelection()) return;
    onAddToCart({
      product,
      selectedSize,
      selectedColor,
      quantity,
    });
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    onDirectBuyNow({
      product,
      selectedSize,
      selectedColor,
      quantity,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        className="relative bg-stone-900 border border-amber-500/30 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden text-stone-100 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-stone-400 hover:text-stone-100 bg-stone-950/60 hover:bg-stone-950 rounded-full border border-amber-500/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
          
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            {/* Main Featured Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-950 border border-stone-800">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={displayName}
                className="w-full h-full object-cover"
              />
              {product.discountPercent && product.discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-extrabold text-xs px-3 py-1 rounded-md shadow-md uppercase">
                  -{product.discountPercent}% {t.discount}
                </span>
              )}
            </div>

            {/* Thumbnail Selectors */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImageIndex === index
                        ? 'border-amber-400 scale-105 shadow-md'
                        : 'border-stone-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${index}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Information & Customization */}
          <div className="space-y-5 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                {product.gender.toUpperCase()} • {product.category}
              </span>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-100 mt-1">
                {displayName}
              </h2>

              {/* Price & Discount */}
              <div className="flex items-baseline gap-3 my-3">
                <span className="text-2xl font-extrabold text-amber-400 font-serif">
                  ৳ {product.price.toLocaleString()}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-sm text-stone-500 line-through">
                    ৳ {product.oldPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                  {product.stock > 0 ? t.inStock : t.outOfStock}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed border-t border-b border-stone-800 py-3 my-3">
                {displayDesc}
              </p>

              {/* Validation Alert */}
              {validationError && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-lg text-rose-300 text-xs flex items-center gap-2 mb-3 animate-bounce">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Color Selector */}
              <div className="space-y-2 mb-4">
                <label className="text-xs font-bold text-stone-200 uppercase tracking-wider block">
                  1. {t.selectColor} <span className="text-amber-400">*</span>:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          setValidationError(null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md'
                            : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-amber-500/40'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selector */}
              <div className="space-y-2 mb-4">
                <label className="text-xs font-bold text-stone-200 uppercase tracking-wider block">
                  2. {t.selectSize} <span className="text-amber-400">*</span>:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setValidationError(null);
                        }}
                        className={`w-10 h-10 rounded-lg text-xs font-bold transition-all border flex items-center justify-center ${
                          isSelected
                            ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md scale-105'
                            : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-amber-500/40'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Counter */}
              <div className="space-y-2 mb-6">
                <label className="text-xs font-bold text-stone-200 uppercase tracking-wider block">
                  3. {t.quantity}:
                </label>
                <div className="inline-flex items-center bg-stone-950 border border-stone-800 rounded-lg p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 text-stone-400 hover:text-amber-400 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-stone-100">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 text-stone-400 hover:text-amber-400 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs sm:text-sm font-bold border border-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>{t.addToCart}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs sm:text-sm font-extrabold transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>{t.buyNow}</span>
                </button>
              </div>

              {/* Shareable Link Box for Admin / Customers */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`w-full py-2.5 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs font-bold cursor-pointer ${
                    copied
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                      : 'bg-stone-950/80 hover:bg-stone-950 border-amber-500/30 text-amber-400 hover:border-amber-400'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{t.linkCopied}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-amber-400" />
                      <span>{t.copyProductLink} ({t.copyLinkForSocial})</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-800">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  100% Original Product
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  Fast Nationwide Delivery
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
