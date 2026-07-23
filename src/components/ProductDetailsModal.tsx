import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, Zap, AlertCircle, Plus, Minus, ShieldCheck, Truck, Share2, Copy, Trash2, Star, Camera, Upload, MessageSquare } from 'lucide-react';
import { Product, Language, CartItem, Review } from '../types';
import { translations } from '../data/translations';
import { fetchReviewsApi, createReviewApi, deleteReviewApi } from '../utils/api';

interface ProductDetailsModalProps {
  product: Product | null;
  language: Language;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onDirectBuyNow: (item: CartItem) => void;
  isAdmin?: boolean;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  language,
  onClose,
  onAddToCart,
  onDirectBuyNow,
  isAdmin = false,
}) => {
  if (!product) return null;

  const t = translations[language];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Reviews state
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(false);
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewerMessage, setReviewerMessage] = useState<string>('');
  const [reviewerRating, setReviewerRating] = useState<number>(5);
  const [reviewerImage, setReviewerImage] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  // Load reviews when product changes
  useEffect(() => {
    if (product?.id) {
      loadReviews();
    }
  }, [product?.id]);

  const loadReviews = async () => {
    if (!product?.id) return;
    setIsLoadingReviews(true);
    const data = await fetchReviewsApi(product.id);
    if (data) {
      const sorted = [...data].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setReviewsList(sorted);
    }
    setIsLoadingReviews(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setReviewerImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id) return;

    if (!reviewerName.trim()) {
      setReviewError(language === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please enter your name.');
      return;
    }
    if (!reviewerMessage.trim()) {
      setReviewError(language === 'bn' ? 'অনুগ্রহ করে আপনার মতামত বা মেসেজ লিখুন।' : 'Please enter your review message.');
      return;
    }

    setReviewError(null);
    setIsSubmittingReview(true);

    const newReview: Review = {
      productId: product.id,
      reviewerName: reviewerName.trim(),
      reviewerMessage: reviewerMessage.trim(),
      reviewerRating,
      reviewerImage: reviewerImage || undefined,
    };

    const result = await createReviewApi(newReview);
    if (result) {
      setReviewSuccess(true);
      setReviewerName('');
      setReviewerMessage('');
      setReviewerRating(5);
      setReviewerImage('');
      loadReviews();
      setTimeout(() => setReviewSuccess(false), 4000);
    } else {
      setReviewError(language === 'bn' ? 'রিভিউ সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Failed to submit review. Please try again.');
    }
    setIsSubmittingReview(false);
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই রিভিউটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this review?')) {
      return;
    }
    const success = await deleteReviewApi(reviewId);
    if (success) {
      setReviewsList(prev => prev.filter(r => r.id !== reviewId));
    } else {
      alert(language === 'bn' ? 'মুছে ফেলতে ব্যর্থ হয়েছে।' : 'Failed to delete review.');
    }
  };

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="relative bg-stone-900 border border-amber-500/30 w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl text-stone-100 my-auto"
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

        {/* Reviews Section */}
        <div className="border-t border-stone-800 bg-stone-950/40 px-6 py-8 sm:px-8">
          <h3 className="text-lg font-serif font-bold text-amber-400 mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <span>{language === 'bn' ? 'গ্রাহকদের রিভিউ ও মতামত' : 'Customer Reviews & Feedback'}</span>
            <span className="text-xs bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full font-sans font-normal">
              {reviewsList.length}
            </span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Submit a Review Form (Left Side, 5 Cols) */}
            <div className="lg:col-span-5 space-y-4 bg-stone-900/60 p-5 rounded-xl border border-stone-800">
              <h4 className="text-sm font-bold text-stone-200 uppercase tracking-wider mb-2">
                {language === 'bn' ? 'রিভিউ দিন' : 'Write a Review'}
              </h4>

              {reviewSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs flex items-center gap-2 mb-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {language === 'bn'
                      ? 'আপনার রিভিউটি সফলভাবে সাবমিট হয়েছে!'
                      : 'Your review has been successfully submitted!'}
                  </span>
                </div>
              )}

              {reviewError && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-lg text-rose-300 text-xs flex items-center gap-2 mb-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Reviewer Name */}
                <div>
                  <label className="text-[11px] font-bold text-stone-400 uppercase block mb-1">
                    {language === 'bn' ? 'আপনার নাম' : 'Your Name'} <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: সাব্বির আহমেদ' : 'e.g. Sabbir Ahmed'}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-stone-600"
                    required
                  />
                </div>

                {/* Rating Selector */}
                <div>
                  <label className="text-[11px] font-bold text-stone-400 uppercase block mb-1">
                    {language === 'bn' ? 'রেটিং দিন' : 'Rating'} <span className="text-amber-400">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const isActive = starValue <= reviewerRating;
                      return (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() => setReviewerRating(starValue)}
                          className="p-1 focus:outline-none transition-transform active:scale-110 cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 transition-all ${
                              isActive ? 'fill-amber-400 text-amber-400' : 'text-stone-700 hover:text-stone-500'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Review Message */}
                <div>
                  <label className="text-[11px] font-bold text-stone-400 uppercase block mb-1">
                    {language === 'bn' ? 'আপনার মন্তব্য / মেসেজ' : 'Your Message'} <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={reviewerMessage}
                    onChange={(e) => setReviewerMessage(e.target.value)}
                    placeholder={
                      language === 'bn'
                        ? 'প্রোডাক্টটি কেমন লেগেছে বা আপনার অভিজ্ঞতা শেয়ার করুন...'
                        : 'Share your experience with this product...'
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-stone-600 resize-none"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="text-[11px] font-bold text-stone-400 uppercase block mb-1">
                    {language === 'bn' ? 'ছবি আপলোড করুন (ঐচ্ছিক)' : 'Upload Picture (Optional)'}
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 hover:border-amber-500/40 transition-all text-stone-300 hover:text-stone-100 text-xs font-semibold cursor-pointer shrink-0">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>{language === 'bn' ? 'ছবি নির্বাচন করুন' : 'Choose Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {reviewerImage && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-stone-800 bg-stone-950 shrink-0">
                        <img
                          src={reviewerImage}
                          alt="Review Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setReviewerImage('')}
                          className="absolute -top-1 -right-1 bg-rose-600 text-white p-0.5 rounded-full hover:bg-rose-500 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-600 disabled:cursor-not-allowed text-stone-950 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  {isSubmittingReview ? (
                    <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{language === 'bn' ? 'রিভিউ সাবমিট করুন' : 'Submit Review'}</span>
                </button>
              </form>
            </div>

            {/* Existing Reviews List (Right Side, 7 Cols) */}
            <div className="lg:col-span-7 space-y-4 max-h-[420px] overflow-y-auto pr-1">
              <h4 className="text-sm font-bold text-stone-200 uppercase tracking-wider mb-2">
                {language === 'bn' ? 'সকল রিভিউ' : 'All Reviews'}
              </h4>

              {isLoadingReviews ? (
                <div className="flex flex-col items-center justify-center py-12 text-stone-500 text-xs">
                  <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span>{language === 'bn' ? 'রিভিউ লোড হচ্ছে...' : 'Loading reviews...'}</span>
                </div>
              ) : reviewsList.length === 0 ? (
                <div className="text-center py-16 bg-stone-900/20 rounded-xl border border-dashed border-stone-800 p-6 flex flex-col items-center justify-center gap-3">
                  <MessageSquare className="w-10 h-10 text-stone-700 animate-pulse" />
                  <p className="text-stone-400 text-xs font-medium">
                    {language === 'bn'
                      ? 'এখনো কোনো রিভিউ দেওয়া হয়নি।'
                      : 'No reviews yet for this product.'}
                  </p>
                  <p className="text-stone-600 text-[10px]">
                    {language === 'bn'
                      ? 'পণ্যটি পেয়ে প্রথম রিভিউটি আপনি দিন!'
                      : 'Be the first to share your experience!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewsList.map((rev) => {
                    return (
                      <div
                        key={rev.id}
                        className="p-4 bg-stone-900/40 border border-stone-800 rounded-xl relative group hover:border-amber-500/20 transition-all flex flex-col sm:flex-row gap-4"
                      >
                        {/* Admin Delete Action */}
                        {isAdmin && (
                          <button
                            onClick={() => rev.id && handleDeleteReview(rev.id)}
                            className="absolute top-3 right-3 p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-all border border-transparent hover:border-rose-500/20 cursor-pointer"
                            title={language === 'bn' ? 'রিভিউ ডিলিট করুন' : 'Delete Review'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Review Content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-100">{rev.reviewerName}</span>
                            <span className="text-[10px] text-stone-500">
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                            </span>
                          </div>

                          {/* Star rating */}
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.reviewerRating ? 'fill-amber-400 text-amber-400' : 'text-stone-800'
                                }`}
                              />
                            ))}
                          </div>

                          <p className="text-xs text-stone-300 font-light leading-relaxed whitespace-pre-line">
                            {rev.reviewerMessage}
                          </p>
                        </div>

                        {/* Review Attached Image */}
                        {rev.reviewerImage && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden border border-stone-800 bg-stone-950 shrink-0 self-start sm:self-center">
                            <img
                              src={rev.reviewerImage}
                              alt="Review attachment"
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                              onClick={() => {
                                const newTab = window.open();
                                if (newTab) {
                                  newTab.document.write(`<img src="${rev.reviewerImage}" style="max-width:100%; max-height:100%; margin:auto; display:block;" />`);
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
