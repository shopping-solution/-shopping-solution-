import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Smartphone, ShieldCheck, MapPin, CreditCard, AlertCircle, Truck } from 'lucide-react';
import { CartItem, CustomerAddress, PaymentMethod, SiteSettings, Language, Order } from '../types';
import { BANGLADESH_DIVISIONS } from '../data/bangladeshData';
import { translations } from '../data/translations';

interface CheckoutModalProps {
  isOpen: boolean;
  language: Language;
  cart: CartItem[];
  siteSettings: SiteSettings;
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  language,
  cart,
  siteSettings,
  onClose,
  onOrderPlaced,
}) => {
  if (!isOpen || cart.length === 0) return null;

  const t = translations[language];

  // Address state
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedDivisionIndex, setSelectedDivisionIndex] = useState<number>(0);
  const [selectedDistrictIndex, setSelectedDistrictIndex] = useState<number>(0);
  const [selectedUpazilaIndex, setSelectedUpazilaIndex] = useState<number>(0);
  const [customUpazila, setCustomUpazila] = useState('');
  const [village, setVillage] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [optionalDetails, setOptionalDetails] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [transactionId, setTransactionId] = useState('');

  // Validation error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived current division / district / upazila
  const currentDivisionObj = BANGLADESH_DIVISIONS[selectedDivisionIndex] || BANGLADESH_DIVISIONS[0];
  const safeDistrictIndex = selectedDistrictIndex < currentDivisionObj.districts.length ? selectedDistrictIndex : 0;
  const currentDistrictObj = currentDivisionObj.districts[safeDistrictIndex] || currentDivisionObj.districts[0];
  
  const upazilasList = currentDistrictObj?.upazilas || [];
  const safeUpazilaIndex = selectedUpazilaIndex < upazilasList.length ? selectedUpazilaIndex : 0;
  const currentUpazilaObj = upazilasList[safeUpazilaIndex];

  // Delivery fee calculation
  const isInsideDhaka = currentDivisionObj.en.toLowerCase() === 'dhaka' && currentDistrictObj.en.toLowerCase() === 'dhaka';
  const deliveryFee = isInsideDhaka
    ? siteSettings.deliveryFeeInsideDhaka
    : siteSettings.deliveryFeeOutsideDhaka;

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalAmount = subtotal + deliveryFee;

  // Reset district/upazila indexes on division change
  const handleDivisionChange = (index: number) => {
    setSelectedDivisionIndex(index);
    setSelectedDistrictIndex(0);
    setSelectedUpazilaIndex(0);
    setCustomUpazila('');
  };

  const handleDistrictChange = (index: number) => {
    setSelectedDistrictIndex(index);
    setSelectedUpazilaIndex(0);
    setCustomUpazila('');
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // Field Validations
    if (!fullName.trim()) {
      setErrorMessage(language === 'en' ? 'Please enter your Full Name' : 'অনুগ্রহ করে আপনার নাম লিখুন');
      return;
    }

    const cleanMobile = mobileNumber.replace(/[^0-9]/g, '');
    if (cleanMobile.length < 11) {
      setErrorMessage(language === 'en' ? 'Please enter a valid 11-digit mobile number' : 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন');
      return;
    }

    if (!village.trim()) {
      setErrorMessage(language === 'en' ? 'Please enter your Village / Area / Union' : 'গ্রাম বা এলাকার নাম দিন');
      return;
    }

    if (!houseNumber.trim()) {
      setErrorMessage(language === 'en' ? 'Please enter House or Road number' : 'বাসা বা রোড নম্বর লিখুন');
      return;
    }

    // Determine Upazila value
    let finalUpazila = '';
    if (selectedUpazilaIndex >= upazilasList.length) {
      finalUpazila = customUpazila.trim();
    } else if (currentUpazilaObj) {
      finalUpazila = language === 'bn' ? currentUpazilaObj.bn : currentUpazilaObj.en;
    }

    if (!finalUpazila) {
      setErrorMessage(language === 'en' ? 'Please select or enter your Upazila / Thana' : 'উপজেলা বা থানা নির্বাচন অথবা প্রদান করুন');
      return;
    }

    // Transaction ID required for bKash or Nagad
    if ((paymentMethod === 'bKash' || paymentMethod === 'Nagad') && !transactionId.trim()) {
      setErrorMessage(t.trxIdRequired);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const customerAddress: CustomerAddress = {
      fullName: fullName.trim(),
      mobileNumber: cleanMobile,
      division: language === 'bn' ? currentDivisionObj.bn : currentDivisionObj.en,
      district: language === 'bn' ? currentDistrictObj.bn : currentDistrictObj.en,
      upazila: finalUpazila,
      village: village.trim(),
      houseNumber: houseNumber.trim(),
      optionalDetails: optionalDetails.trim(),
    };

    const newOrder: Order = {
      id: `SS-${Math.floor(10000 + Math.random() * 90000)}`,
      customer: customerAddress,
      items: cart,
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod,
      transactionId: (paymentMethod === 'bKash' || paymentMethod === 'Nagad') ? transactionId.trim().toUpperCase() : undefined,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onOrderPlaced(newOrder);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        className="relative bg-stone-900 border border-amber-500/30 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden text-stone-100 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-stone-950 px-6 py-4 border-b border-amber-500/20 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-100">
              {t.checkoutTitle}
            </h2>
            <p className="text-xs text-amber-400/90 font-light">
              {t.checkoutSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 rounded-full hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Validation Alert */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-lg text-rose-300 text-xs flex items-center gap-2 animate-bounce">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Customer Info & Delivery Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-stone-800 pb-2">
              <MapPin className="w-4 h-4" />
              <span>1. Delivery Address Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {t.fullName} <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tanvir Hossen"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {t.mobileNumber} <span className="text-amber-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. 01712345678"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Division Select */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {t.division} <span className="text-amber-400">*</span>
                </label>
                <select
                  value={selectedDivisionIndex}
                  onChange={(e) => handleDivisionChange(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                >
                  {BANGLADESH_DIVISIONS.map((div, idx) => (
                    <option key={div.en} value={idx}>
                      {language === 'bn' ? div.bn : div.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Select */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {t.district} <span className="text-amber-400">*</span>
                </label>
                <select
                  value={selectedDistrictIndex}
                  onChange={(e) => handleDistrictChange(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                >
                  {currentDivisionObj.districts.map((dist, idx) => (
                    <option key={dist.en} value={idx}>
                      {language === 'bn' ? dist.bn : dist.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upazila Select */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {t.upazila} <span className="text-amber-400">*</span>
                </label>
                <select
                  value={selectedUpazilaIndex}
                  onChange={(e) => setSelectedUpazilaIndex(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                >
                  {upazilasList.map((upz, idx) => (
                    <option key={upz.en} value={idx}>
                      {language === 'bn' ? upz.bn : upz.en}
                    </option>
                  ))}
                  <option value={upazilasList.length}>
                    {language === 'bn' ? 'অন্যান্য (নিজে লিখুন)' : 'Other (Type manually)'}
                  </option>
                </select>

                {selectedUpazilaIndex >= upazilasList.length && (
                  <input
                    type="text"
                    required
                    value={customUpazila}
                    onChange={(e) => setCustomUpazila(e.target.value)}
                    placeholder={language === 'bn' ? 'আপনার উপজেলা / থানার নাম লিখুন' : 'Enter your Upazila / Thana'}
                    className="mt-2 w-full bg-stone-950 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                  />
                )}
              </div>

              {/* Village / Area */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {t.village} <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Sector 4 / Mohakhali"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* House / Road Number */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {t.houseNumber} <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder="e.g. House #14, Road #05, Flat 3B"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Optional Instructions */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {t.optionalDetails}
                </label>
                <textarea
                  rows={2}
                  value={optionalDetails}
                  onChange={(e) => setOptionalDetails(e.target.value)}
                  placeholder="e.g. Call before delivery"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Methods */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-stone-800 pb-2">
              <CreditCard className="w-4 h-4" />
              <span>2. Payment Options</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* bKash option */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('bKash');
                  setErrorMessage(null);
                }}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  paymentMethod === 'bKash'
                    ? 'bg-pink-950/40 border-pink-500 text-pink-300 ring-1 ring-pink-500'
                    : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div>
                  <p className="text-xs font-extrabold text-pink-400">bKash Send Money</p>
                  <p className="text-[10px] text-stone-400">Merchant/Personal</p>
                </div>
                {paymentMethod === 'bKash' && <CheckCircle className="w-4 h-4 text-pink-400" />}
              </button>

              {/* Nagad option */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('Nagad');
                  setErrorMessage(null);
                }}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  paymentMethod === 'Nagad'
                    ? 'bg-orange-950/40 border-orange-500 text-orange-300 ring-1 ring-orange-500'
                    : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div>
                  <p className="text-xs font-extrabold text-orange-400">Nagad Send Money</p>
                  <p className="text-[10px] text-stone-400">Personal Number</p>
                </div>
                {paymentMethod === 'Nagad' && <CheckCircle className="w-4 h-4 text-orange-400" />}
              </button>

              {/* Cash on Delivery option */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('COD');
                  setErrorMessage(null);
                }}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  paymentMethod === 'COD'
                    ? 'bg-amber-950/40 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                    : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div>
                  <p className="text-xs font-extrabold text-amber-400">Cash on Delivery</p>
                  <p className="text-[10px] text-stone-400">Pay when received</p>
                </div>
                {paymentMethod === 'COD' && <CheckCircle className="w-4 h-4 text-amber-400" />}
              </button>
            </div>

            {/* If bKash or Nagad Selected: Display Number & Transaction ID Input */}
            {(paymentMethod === 'bKash' || paymentMethod === 'Nagad') && (
              <div className="p-4 bg-stone-950 border border-amber-500/30 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span className="text-xs text-stone-300 font-medium">
                    {t.sendPaymentTo} ({paymentMethod}):
                  </span>
                  <span className="text-sm font-extrabold font-mono text-amber-400">
                    {paymentMethod === 'bKash' ? siteSettings.bkashNumber : siteSettings.nagadNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-300">
                  <span>{t.totalAmount}:</span>
                  <span className="font-serif font-bold text-amber-400">
                    ৳ {totalAmount.toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-1">
                    {t.transactionId} <span className="text-rose-400">* Required</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => {
                      setTransactionId(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder={t.trxIdPlaceholder}
                    className="w-full bg-stone-900 border border-amber-500/50 rounded-lg px-3 py-2 text-xs font-mono tracking-wider text-amber-300 placeholder-stone-600 focus:outline-none"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    * Enter the Trx ID received after sending ৳{totalAmount.toLocaleString()} to our {paymentMethod} number.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Summary Breakdown */}
          <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-2 text-xs">
            <div className="flex justify-between text-stone-400">
              <span>{t.subtotal}:</span>
              <span className="font-serif text-stone-200">৳ {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.deliveryFee} ({isInsideDhaka ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
              </span>
              <span className="font-serif text-stone-200">৳ {deliveryFee}</span>
            </div>
            <div className="flex justify-between text-amber-400 font-bold text-sm pt-2 border-t border-stone-800">
              <span>{t.totalAmount}:</span>
              <span className="font-serif font-extrabold text-base">৳ {totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-sm tracking-wide shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>{t.orderProcessing}</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{t.placeOrder} (৳ {totalAmount.toLocaleString()})</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
