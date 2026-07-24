import React, { useState, useEffect } from 'react';
import { X, Upload, CheckCircle2, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Product, Language, GenderCategory, SubCategory } from '../types';
import { translations } from '../data/translations';

interface AdminProductModalProps {
  language: Language;
  product: Product | null; // Null if adding a new product
  onClose: () => void;
  onSave: (product: Product) => void;
  preSetIsNewAdded?: boolean; // Set true if we're adding specifically from the Featured collection section
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  language,
  product,
  onClose,
  onSave,
  preSetIsNewAdded = false,
}) => {
  const t = translations[language];

  // Form State
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [gender, setGender] = useState<GenderCategory>('men');
  const [category, setCategory] = useState<SubCategory>('T-Shirt');
  const [price, setPrice] = useState<number>(1000);
  const [oldPrice, setOldPrice] = useState<number>(1200);
  const [stock, setStock] = useState<number>(20);
  const [images, setImages] = useState<string[]>([]);
  const [rawImagesInput, setRawImagesInput] = useState('');
  const [colors, setColors] = useState('Black, White, Navy');
  const [sizes, setSizes] = useState('S, M, L, XL');
  const [description, setDescription] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [isTrending, setIsTrending] = useState(false);
  const [isBestSelling, setIsBestSelling] = useState(false);
  const [isNewAdded, setIsNewAdded] = useState(false);

  // Initialize form with product data if editing
  useEffect(() => {
    if (product) {
      setName(product.name);
      setNameBn(product.nameBn || '');
      setGender(product.gender);
      setCategory(product.category);
      setPrice(product.price);
      setOldPrice(product.oldPrice || product.price);
      setStock(product.stock);
      setImages([...product.images]);
      setRawImagesInput(product.images.join(', '));
      setColors(product.colors.join(', '));
      setSizes(product.sizes.join(', '));
      setDescription(product.description);
      setDescriptionBn(product.descriptionBn || '');
      setIsTrending(!!product.isTrending);
      setIsBestSelling(!!product.isBestSelling);
      setIsNewAdded(!!product.isNewAdded);
    } else {
      // Create mode
      setName('');
      setNameBn('');
      setGender('men');
      setCategory('T-Shirt');
      setPrice(1200);
      setOldPrice(1500);
      setStock(25);
      const defaultImg = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800';
      setImages([defaultImg]);
      setRawImagesInput(defaultImg);
      setColors('Black, White, Navy');
      setSizes('S, M, L, XL');
      setDescription('Premium luxury fashion tailored for maximum comfort.');
      setDescriptionBn('প্রিমিয়াম কোয়ালিটি পোশাক।');
      setIsTrending(true);
      setIsBestSelling(false);
      setIsNewAdded(preSetIsNewAdded);
    }
  }, [product, preSetIsNewAdded]);

  // Handle local image file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files) as File[];
    const newImages: string[] = [];
    let processedCount = 0;

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
        }
        processedCount++;
        if (processedCount === fileArray.length) {
          setImages((prev) => {
            const updated = [...prev, ...newImages];
            setRawImagesInput(updated.join(', '));
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      setRawImagesInput(updated.join(', '));
      return updated;
    });
  };

  const handleRawImagesChange = (val: string) => {
    setRawImagesInput(val);
    const parsed = val.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    setImages(parsed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let imageArray = images.filter((url) => url.trim().length > 0);
    if (imageArray.length === 0) {
      imageArray = rawImagesInput
        .split(',')
        .map((url) => url.trim())
        .filter((url) => url.length > 0);
    }

    const colorArray = colors
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const sizeArray = sizes
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const discountPct = oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;

    const updatedProduct: Product = {
      id: product ? product.id : `prod-${Date.now()}`,
      name,
      nameBn: nameBn || undefined,
      gender,
      category,
      price,
      oldPrice: oldPrice || undefined,
      discountPercent: discountPct || undefined,
      stock,
      inStock: stock > 0,
      images: imageArray.length > 0 ? imageArray : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'],
      colors: colorArray,
      sizes: sizeArray,
      description,
      descriptionBn: descriptionBn || undefined,
      isTrending,
      isBestSelling,
      isNewAdded,
      createdAt: product ? product.createdAt : new Date().toISOString(),
    };

    onSave(updatedProduct);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-stone-900 border border-amber-500/40 w-full max-w-2xl rounded-2xl p-5 sm:p-6 text-stone-100 space-y-4 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <h3 className="font-serif font-bold text-lg text-amber-400">
              {product ? (language === 'bn' ? 'প্রোডাক্ট সংশোধন করুন' : 'Edit Product') : (language === 'bn' ? 'নতুন প্রোডাক্ট যোগ করুন' : 'Add New Product')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                {language === 'bn' ? 'পণ্যের নাম (ইংরেজি) *' : 'Product Name (English) *'}:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                {language === 'bn' ? 'পণ্যের নাম (বাংলা)' : 'Product Name (Bangla)'}:
              </label>
              <input
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                {t.gender} *:
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as GenderCategory)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none transition-colors"
              >
                <option value="men">{t.men}</option>
                <option value="women">{t.women}</option>
                <option value="unisex">{t.unisex}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                {t.category} *:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SubCategory)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none transition-colors"
              >
                <option value="T-Shirt">{t.tshirt}</option>
                <option value="Shirt">{t.shirt}</option>
                <option value="Polo">{t.polo}</option>
                <option value="Pants">{t.pants}</option>
                <option value="Baggy">{t.baggy}</option>
                <option value="Bootcut">{t.bootcut}</option>
                <option value="Jeans">{t.jeans}</option>
                <option value="Hoodie">{t.hoodie}</option>
                <option value="Dress">{t.dress}</option>
                <option value="Traditional">{t.traditional}</option>
                <option value="Watch">{t.watch}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                {language === 'bn' ? 'বিক্রয় মূল্য (৳) *' : 'Price (৳) *'}:
              </label>
              <input
                type="number"
                required
                min="1"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                {language === 'bn' ? 'পূর্বের মূল্য (৳) (ঐচ্ছিক)' : 'Regular/Old Price (৳) (Optional)'}:
              </label>
              <input
                type="number"
                min="0"
                value={oldPrice}
                onChange={(e) => setOldPrice(Number(e.target.value))}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                {t.stockQuantity} *:
              </label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                {t.availableColors} (Comma-separated):
              </label>
              <input
                type="text"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                placeholder="Black, White, Navy, Maroon"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-300 mb-1">
                {t.availableSizes} (Comma-separated):
              </label>
              <input
                type="text"
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                placeholder="S, M, L, XL, XXL, 30, 32, 34"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Images Box */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-stone-300">
                {language === 'bn' ? 'পণ্যের ছবিসমূহ' : 'Product Images'}:
              </label>

              {/* Gallery upload */}
              <div className="flex flex-wrap items-center gap-3 bg-stone-950 p-3 rounded-xl border border-stone-800">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'গ্যালারি থেকে যোগ করুন' : 'Upload from Device'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[10px] text-stone-400">
                  {language === 'bn' ? '(ক্যামেরা বা মেমোরি থেকে যেকোনো ছবি আপলোড করতে পারেন)' : '(JPEG, PNG, WEBP)'}
                </span>
              </div>

              {/* Grid Preview */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-950 border border-stone-800 group shadow-md"
                    >
                      <img
                        src={imgUrl}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-0.5 shadow transition-all opacity-90 group-hover:opacity-100"
                        title={t.removeImage}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Image URLs text input */}
              <div className="pt-1">
                <span className="block text-[10px] text-stone-400 mb-1">
                  {language === 'bn' ? 'অথবা ছবির ডিরেক্ট লিংক দিন (কমা দিয়ে একাধিক)' : 'Or enter image direct URLs (separated by commas)'}:
                </span>
                <input
                  type="text"
                  required={images.length === 0}
                  value={rawImagesInput}
                  onChange={(e) => handleRawImagesChange(e.target.value)}
                  placeholder="https://images.com/pic1.jpg, https://images.com/pic2.jpg"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-300 mb-1">
                {language === 'bn' ? 'পণ্যের বিবরণ (ইংরেজি) *' : 'Product Description (English) *'}:
              </label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-300 mb-1">
                {language === 'bn' ? 'পণ্যের বিবরণ (বাংলা)' : 'Product Description (Bangla)'}:
              </label>
              <textarea
                rows={2}
                value={descriptionBn}
                onChange={(e) => setDescriptionBn(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Tag checkboxes */}
          <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/60 space-y-2.5">
            <span className="block text-[11px] font-bold text-amber-400/90 uppercase tracking-wider">
              {language === 'bn' ? 'প্রোডাক্ট ক্যাটাগরি ও প্রদর্শন ট্যাগ' : 'Display Tag Flags'}:
            </span>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-300 select-none">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded"
                />
                <span>{language === 'bn' ? 'ট্রেন্ডিং কালেকশনে দেখান' : 'Show in Trending Section'}</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-stone-300 select-none">
                <input
                  type="checkbox"
                  checked={isBestSelling}
                  onChange={(e) => setIsBestSelling(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded"
                />
                <span>{language === 'bn' ? 'বেস্ট সেলিং কালেকশনে দেখান' : 'Show in Best Selling Section'}</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-stone-300 select-none">
                <input
                  type="checkbox"
                  checked={isNewAdded}
                  onChange={(e) => setIsNewAdded(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded"
                />
                <span className="text-amber-400 font-bold">{language === 'bn' ? 'নতুন কালেকশন / ফিচার্ড লিস্টে দেখান' : 'Show in Fresh Arrivals / Featured List'}</span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs shadow-md transition-colors"
            >
              {language === 'bn' ? 'পণ্য সংরক্ষণ করুন' : 'Save Product Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
