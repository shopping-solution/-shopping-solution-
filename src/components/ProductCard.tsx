import React, { useState } from 'react';
import { ShoppingBag, Eye, CheckCircle2, AlertTriangle, ArrowRight, Share2, Check, Copy, Pencil } from 'lucide-react';
import { Product, Language } from '../types';
import { translations } from '../data/translations';

interface ProductCardProps {
  product: Product;
  language: Language;
  onOpenDetails: (product: Product) => void;
  onQuickAddToCart: (product: Product) => void;
  isAdmin?: boolean;
  onEdit?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  language,
  onOpenDetails,
  onQuickAddToCart,
  isAdmin = false,
  onEdit,
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  const displayName = language === 'bn' && product.nameBn ? product.nameBn : product.name;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="group bg-stone-900/90 border border-amber-500/15 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between">
      
      {/* Top Image Box */}
      <div 
        onClick={() => onOpenDetails(product)}
        className="relative aspect-square w-full bg-stone-950 overflow-hidden cursor-pointer"
      >
        <img
          src={product.images[0]}
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Hover Secondary Image if available */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={`${displayName} hover`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
          />
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(product);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg uppercase tracking-wider flex items-center gap-1 transition-all transform active:scale-95 duration-150 border border-amber-600/20"
            >
              <Pencil className="w-3 h-3" />
              <span>{language === 'bn' ? 'সংশোধন' : 'Edit'}</span>
            </button>
          )}

          {product.discountPercent && product.discountPercent > 0 && (
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-extrabold text-[11px] px-2.5 py-1 rounded-md shadow-md uppercase tracking-wide">
              -{product.discountPercent}% {t.discount}
            </span>
          )}

          {product.isTrending && (
            <span className="bg-stone-950/80 backdrop-blur-md text-amber-400 border border-amber-500/40 text-[10px] font-semibold px-2 py-0.5 rounded uppercase">
              Trending
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {product.stock <= 0 ? (
            <span className="bg-rose-950/80 text-rose-400 border border-rose-500/40 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{t.outOfStock}</span>
            </span>
          ) : product.stock <= 5 ? (
            <span className="bg-amber-950/80 text-amber-400 border border-amber-500/40 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{t.lowStock}</span>
            </span>
          ) : (
            <span className="bg-stone-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{t.inStock}</span>
            </span>
          )}
        </div>

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="px-4 py-2 rounded-full bg-stone-900/90 hover:bg-amber-500 text-stone-100 hover:text-stone-950 font-semibold text-xs border border-amber-500/40 transition-colors flex items-center gap-1.5 shadow-xl"
          >
            <Eye className="w-4 h-4" />
            <span>{t.quickView}</span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        
        <div>
          {/* Category Tag */}
          <span className="text-[9px] sm:text-[10px] uppercase font-semibold text-amber-400/90 tracking-widest block mb-0.5 sm:mb-1">
            {product.gender.toUpperCase()} • {product.category}
          </span>

          {/* Product Name */}
          <h3 
            onClick={() => onOpenDetails(product)}
            className="text-xs sm:text-sm font-bold text-stone-100 hover:text-amber-400 transition-colors cursor-pointer line-clamp-2 leading-snug min-h-[2.25rem]"
          >
            {displayName}
          </h3>
        </div>

        {/* Price Box */}
        <div className="flex items-baseline gap-2 pt-0.5 sm:pt-1">
          <span className="text-sm sm:text-base font-extrabold text-amber-400 font-serif">
            ৳ {product.price.toLocaleString()}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-[10px] sm:text-xs text-stone-500 line-through">
              ৳ {product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Colors Preview */}
        {product.colors && product.colors.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-stone-400 uppercase font-medium">{t.availableColors}:</span>
            <div className="flex items-center gap-1">
              {product.colors.slice(0, 4).map((col, idx) => (
                <span
                  key={idx}
                  title={col}
                  className="px-1.5 py-0.5 text-[9px] rounded bg-stone-800 text-stone-300 border border-stone-700 font-medium"
                >
                  {col}
                </span>
              ))}
              {product.colors.length > 4 && (
                <span className="text-[9px] text-stone-400">+{product.colors.length - 4}</span>
              )}
            </div>
          </div>
        )}

        {/* Sizes Preview */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            <span className="text-[9px] sm:text-[10px] text-stone-400 uppercase font-medium mr-0.5 sm:mr-1 flex-shrink-0">{t.availableSizes}:</span>
            {product.sizes.map((sz, idx) => (
              <span
                key={idx}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center text-[9px] sm:text-[10px] font-bold bg-stone-950 text-amber-400/90 border border-amber-500/20 flex-shrink-0"
              >
                {sz}
              </span>
            ))}
          </div>
        )}

        {/* Bottom CTA Button */}
        <div className="pt-1 sm:pt-2 flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onOpenDetails(product)}
            className="flex-1 py-2 px-2 sm:px-3 rounded-lg bg-stone-800 hover:bg-amber-500 text-stone-200 hover:text-stone-950 text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 border border-amber-500/20 cursor-pointer min-h-[36px]"
          >
            <span>{t.buyNow}</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>

          <button
            onClick={handleCopyLink}
            title={t.copyProductLink}
            className={`p-2 rounded-lg border transition-all flex items-center justify-center cursor-pointer min-w-[36px] min-h-[36px] ${
              copied
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                : 'bg-stone-800 hover:bg-stone-700 border-amber-500/20 text-stone-300 hover:text-amber-400'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
};
