import React, { useState, useMemo } from 'react';
import { X, Search, CheckSquare, Square } from 'lucide-react';
import { Product, Language } from '../types';

interface AdminFeaturedCollectionModalProps {
  language: Language;
  products: Product[];
  onClose: () => void;
  onSave: (updatedProducts: Product[]) => void;
}

export const AdminFeaturedCollectionModal: React.FC<AdminFeaturedCollectionModalProps> = ({
  language,
  products,
  onClose,
  onSave,
}) => {
  const [search, setSearch] = useState('');
  const [tempProducts, setTempProducts] = useState<Product[]>([...products]);

  const filtered = useMemo(() => {
    return tempProducts.filter((p) => {
      const q = search.toLowerCase();
      const nameMatch = p.name.toLowerCase().includes(q) || (p.nameBn && p.nameBn.includes(q));
      const catMatch = p.category.toLowerCase().includes(q);
      return nameMatch || catMatch;
    });
  }, [tempProducts, search]);

  const handleToggleFeature = (id: string) => {
    setTempProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isNewAdded: !p.isNewAdded } : p))
    );
  };

  const handleSave = () => {
    onSave(tempProducts);
  };

  const featuredCount = tempProducts.filter((p) => p.isNewAdded).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-stone-900 border border-amber-500/40 w-full max-w-xl rounded-2xl p-5 sm:p-6 text-stone-100 space-y-4 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <h3 className="font-serif font-bold text-lg text-amber-400">
              {language === 'bn' ? 'ফিচার্ড কালেকশন পরিচালনা করুন' : 'Manage Featured Collection'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed">
          {language === 'bn'
            ? 'হোম পেজের "নতুন কালেকশন" (Fresh Arrivals) সেকশনে কোন প্রোডাক্টগুলো দেখাবেন তা এখান থেকে টিক দিয়ে সিলেক্ট করুন।'
            : 'Select which products should appear in the "Fresh Arrivals" section on the home page.'}
        </p>

        {/* Search & Stats */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-stone-950 p-3 rounded-xl border border-stone-800">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'bn' ? 'প্রোডাক্ট খুঁজুন...' : 'Search products...'}
              className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div className="text-xs text-amber-400 font-bold shrink-0">
            {language === 'bn' ? 'নির্বাচিত পণ্য:' : 'Featured:'} {featuredCount} / {tempProducts.length}
          </div>
        </div>

        {/* Products List Scrollable Area */}
        <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1 divide-y divide-stone-800/40">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-xs">
              {language === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি।' : 'No products found.'}
            </div>
          ) : (
            filtered.map((product) => {
              const nameText = language === 'bn' && product.nameBn ? product.nameBn : product.name;
              return (
                <div
                  key={product.id}
                  onClick={() => handleToggleFeature(product.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer select-none hover:bg-stone-950/40 ${
                    product.isNewAdded
                      ? 'border border-amber-500/10 bg-amber-500/5'
                      : 'border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnail */}
                    <img
                      src={product.images[0]}
                      alt={nameText}
                      className="w-10 h-10 rounded-lg object-cover bg-stone-950 border border-stone-800"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-100 line-clamp-1">{nameText}</p>
                      <p className="text-[10px] text-stone-400">
                        ৳ {product.price.toLocaleString()} • {product.gender} • {product.category}
                      </p>
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div className="text-amber-400 hover:scale-110 transition-transform">
                    {product.isNewAdded ? (
                      <CheckSquare className="w-5 h-5 fill-amber-500 text-stone-900" />
                    ) : (
                      <Square className="w-5 h-5 text-stone-600" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold transition-colors"
          >
            {language === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs shadow-md transition-colors"
          >
            {language === 'bn' ? 'পরিবর্তন সেভ করুন' : 'Save Featured List'}
          </button>
        </div>
      </div>
    </div>
  );
};
