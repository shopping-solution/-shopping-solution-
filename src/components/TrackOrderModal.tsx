import React, { useState, useEffect } from 'react';
import {
  Package, Search, RefreshCw, CheckCircle2, Clock, Truck, XCircle, AlertCircle,
  MessageSquare, Phone, Printer, X, Zap, ChevronRight, ShieldCheck
} from 'lucide-react';
import { Order, Language, SiteSettings } from '../types';
import { translations } from '../data/translations';
import { formatWhatsappNumber, generateOrderReceiptText } from '../utils/formatters';
import { fetchLiveTrackingApi } from '../utils/api';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  language: Language;
  siteSettings: SiteSettings;
  onRefreshOrders?: () => Promise<void>;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  orders,
  language,
  siteSettings,
  onRefreshOrders,
}) => {
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem('lastOrderPhone') || localStorage.getItem('lastOrderId') || '';
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const t = translations[language];

  // Auto-refresh orders every 5 seconds when modal is open for REAL-TIME status updates
  useEffect(() => {
    if (!isOpen) return;

    // Load initial query if empty
    if (!searchQuery) {
      const savedPhone = localStorage.getItem('lastOrderPhone') || localStorage.getItem('lastOrderId');
      if (savedPhone) setSearchQuery(savedPhone);
    }

    const interval = setInterval(async () => {
      const cleanQ = searchQuery.trim().toLowerCase().replace(/[\s\-\+]/g, '');
      const matched = orders.filter((o) => {
        if (!cleanQ) return true;
        const cleanMobile = (o.customer.mobileNumber || '').toLowerCase().replace(/[\s\-\+]/g, '');
        const cleanId = (o.id || '').toLowerCase();
        return cleanMobile.includes(cleanQ) || cleanId.includes(cleanQ);
      });

      const activeTrackingOrders = matched.filter(
        o => o.courierTrackingId && o.status !== 'Delivered' && o.status !== 'Cancelled'
      );

      if (activeTrackingOrders.length > 0) {
        try {
          await Promise.all(activeTrackingOrders.map(o => fetchLiveTrackingApi(o.id)));
        } catch (e) {
          console.warn('Auto live-tracking update error:', e);
        }
      }

      if (onRefreshOrders) {
        setIsRefreshing(true);
        await onRefreshOrders();
        setIsRefreshing(false);
        setLastRefreshedAt(new Date());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, onRefreshOrders, searchQuery, orders]);

  if (!isOpen) return null;

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const cleanQ = searchQuery.trim().toLowerCase().replace(/[\s\-\+]/g, '');
    const matched = orders.filter((o) => {
      if (!cleanQ) return true;
      const cleanMobile = (o.customer.mobileNumber || '').toLowerCase().replace(/[\s\-\+]/g, '');
      const cleanId = (o.id || '').toLowerCase();
      return cleanMobile.includes(cleanQ) || cleanId.includes(cleanQ);
    });

    const activeTrackingOrders = matched.filter(
      o => o.courierTrackingId && o.status !== 'Delivered' && o.status !== 'Cancelled'
    );

    if (activeTrackingOrders.length > 0) {
      try {
        await Promise.all(activeTrackingOrders.map(o => fetchLiveTrackingApi(o.id)));
      } catch (e) {
        console.warn('Manual live-tracking update error:', e);
      }
    }

    if (onRefreshOrders) {
      await onRefreshOrders();
    }
    setIsRefreshing(false);
    setLastRefreshedAt(new Date());
  };

  // Filter matching orders by phone number or order ID
  const cleanQuery = searchQuery.trim().toLowerCase().replace(/[\s\-\+]/g, '');

  const matchedOrders = orders.filter((o) => {
    if (!cleanQuery) return true; // show all user's recent if query empty or user has orders

    const cleanMobile = (o.customer.mobileNumber || '').toLowerCase().replace(/[\s\-\+]/g, '');
    const cleanId = (o.id || '').toLowerCase();

    return cleanMobile.includes(cleanQuery) || cleanId.includes(cleanQuery);
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Confirmed':
        return (
          <div className="bg-emerald-950/90 border-2 border-emerald-500 rounded-xl p-3 text-emerald-200 flex items-center justify-between gap-3 shadow-lg shadow-emerald-950/50 animate-pulse">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/50 flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-sm text-emerald-300">
                  {language === 'en' ? '✅ ORDER CONFIRMED BY ADMIN!' : '✅ অর্ডার কনফার্মড করা হয়েছে!'}
                </p>
                <p className="text-[11px] text-emerald-400/90">
                  {language === 'en'
                    ? 'Your order has been verified and is being prepared for dispatch.'
                    : 'আপনার অর্ডারটি ভেরিফাই করা হয়েছে এবং প্যাকের কাজ চলছে।'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-emerald-500 text-stone-950 rounded-md flex-shrink-0">
              CONFIRMED
            </span>
          </div>
        );

      case 'Processing':
        return (
          <div className="bg-cyan-950/90 border border-cyan-500/50 rounded-xl p-3 text-cyan-200 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/40 flex-shrink-0">
                <Clock className="w-5 h-5 text-cyan-400 animate-spin" />
              </div>
              <div>
                <p className="font-bold text-sm text-cyan-300">
                  {language === 'en' ? '⚙️ Order Processing & Packaging' : '⚙️ অর্ডার প্রসেসিং ও প্যাকিং চলছে'}
                </p>
                <p className="text-[11px] text-cyan-400/80">
                  {language === 'en'
                    ? 'Products are being packed and checked for quality control.'
                    : 'পণ্য কোয়ালিটি চেক করে সুন্দরভাবে প্যাকেজিং করা হচ্ছে।'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-cyan-500 text-stone-950 rounded-md flex-shrink-0">
              PROCESSING
            </span>
          </div>
        );

      case 'Shipped':
        return (
          <div className="bg-blue-950/90 border border-blue-500/50 rounded-xl p-3 text-blue-200 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/40 flex-shrink-0">
                <Truck className="w-5 h-5 text-blue-400 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-sm text-blue-300">
                  {language === 'en' ? '🚚 Handed Over to Courier' : '🚚 ডেলিভারির জন্য কুরিয়ারে পাঠানো হয়েছে'}
                </p>
                <p className="text-[11px] text-blue-400/80">
                  {language === 'en'
                    ? 'Parcel is on its way to your delivery location.'
                    : 'পার্সেলটি আপনার দেওয়া ঠিকানায় পৌঁছানোর পথে।'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-blue-500 text-stone-950 rounded-md flex-shrink-0">
              SHIPPED
            </span>
          </div>
        );

      case 'Delivered':
        return (
          <div className="bg-purple-950/90 border border-purple-500/50 rounded-xl p-3 text-purple-200 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/40 flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="font-bold text-sm text-purple-300">
                  {language === 'en' ? '🎉 Order Successfully Delivered' : '🎉 অর্ডার সফলভাবে ডেলিভারি সম্পন্ন হয়েছে'}
                </p>
                <p className="text-[11px] text-purple-400/80">
                  {language === 'en'
                    ? 'Thank you for shopping with SHOPPING SOLUTION!'
                    : 'শপিং সলিউশনের সাথে থাকার জন্য আপনাকে অনেক ধন্যবাদ!'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-purple-500 text-stone-950 rounded-md flex-shrink-0">
              DELIVERED
            </span>
          </div>
        );

      case 'Cancelled':
        return (
          <div className="bg-rose-950/90 border border-rose-500/50 rounded-xl p-3 text-rose-200 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 border border-rose-500/40 flex-shrink-0">
                <XCircle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <p className="font-bold text-sm text-rose-300">
                  {language === 'en' ? '❌ Order Cancelled' : '❌ অর্ডারটি বাতিল করা হয়েছে'}
                </p>
                <p className="text-[11px] text-rose-400/80">
                  {language === 'en' ? 'Contact admin support for details.' : 'বিস্তারিত জানতে এডমিন হেল্পলাইনে যোগাযোগ করুন।'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-rose-500 text-stone-950 rounded-md flex-shrink-0">
              CANCELLED
            </span>
          </div>
        );

      default:
        // Pending
        return (
          <div className="bg-amber-950/80 border border-amber-500/40 rounded-xl p-3 text-amber-200 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30 flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-sm text-amber-300">
                  {language === 'en' ? '⏳ Pending Admin Confirmation' : '⏳ অর্ডারটি এডমিন কনফার্মেশনের জন্য অপেক্ষমাণ'}
                </p>
                <p className="text-[11px] text-amber-400/80">
                  {language === 'en'
                    ? 'Our team will review your order shortly.'
                    : 'এডমিন টিম শীঘ্রই অর্ডারটি ভেরিফাই করে কনফার্ম করবেন।'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-amber-500 text-stone-950 rounded-md flex-shrink-0">
              PENDING
            </span>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="relative bg-stone-900 border border-amber-500/30 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden text-stone-100 my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-950 px-5 py-4 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-stone-950 shadow-md">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
                <span>{language === 'en' ? 'Track Your Order & Live Status' : 'অর্ডার ট্র্যাক ও রিয়েল-টাইম স্টেটাস'}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE
                </span>
              </h2>
              <p className="text-[10px] text-stone-400">
                {language === 'en'
                  ? 'Enter your mobile number or order ID to check real-time order confirmation'
                  : 'অর্ডারের রিয়েল-টাইম কনফার্মেশন ও স্টেটাস দেখতে মোবাইল নম্বর বা অর্ডার নম্বর লিখুন'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Search Bar & Manual Refresh Bar */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? 'Enter mobile number (e.g. 01712345678) or Order ID (e.g. SS-12345)...'
                      : 'মোবাইল নম্বর (যেমন 01712345678) বা অর্ডার নম্বর (যেমন SS-12345) লিখুন...'
                  }
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="w-full sm:w-auto px-4 py-2 bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-200 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 border border-stone-700 flex-shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
                <span>{language === 'en' ? 'Refresh Status' : 'রিফ্রেশ করুন'}</span>
              </button>
            </div>

            {/* Live Indicator Note */}
            <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-900">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Zap className="w-3 h-3 animate-pulse" />
                <span>
                  {language === 'en'
                    ? 'Auto-syncing with server every 5s for real-time status changes.'
                    : 'সার্ভারের সাথে প্রতি ৫ সেকান্ড পর পর অটো-সিংকিং হচ্ছে।'}
                </span>
              </div>
              <span>
                {language === 'en' ? 'Last synced:' : 'সর্বশেষ আপডেট:'} {lastRefreshedAt.toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Orders Display List */}
          {matchedOrders.length === 0 ? (
            <div className="p-8 text-center bg-stone-950/50 border border-stone-800/80 rounded-2xl space-y-3">
              <Package className="w-12 h-12 text-stone-600 mx-auto" />
              <h3 className="text-sm font-bold text-stone-300">
                {language === 'en' ? 'No Matching Orders Found' : 'কোনো অর্ডার খুঁজে পাওয়া যায়নি'}
              </h3>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                {searchQuery
                  ? language === 'en'
                    ? `No orders found for query "${searchQuery}". Please verify the mobile number or order ID.`
                    : `"${searchQuery}" এর কোনো অর্ডার রেকর্ড পাওয়া যায়নি। মোবাইল নম্বর বা অর্ডার আইডি সঠিক রয়েছে কিনা যাচাই করুন।`
                  : language === 'en'
                  ? 'Please enter your phone number or Order ID in the box above to track your order status.'
                  : 'আপনার অর্ডারের সঠিক অবস্থা দেখতে ও ট্র্যাক করতে উপরে মোবাইল নম্বর বা অর্ডার নম্বর টাইপ করুন।'}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs text-amber-400 font-semibold px-1">
                <span>{language === 'en' ? `Found ${matchedOrders.length} Order(s)` : `মোট ${matchedOrders.length} টি অর্ডার পাওয়া গেছে`}</span>
              </div>

              {matchedOrders.map((order) => {
                const cleanWhatsapp = formatWhatsappNumber(siteSettings.adminWhatsapp);
                const orderReceiptText = generateOrderReceiptText(order, 'status_update_customer');
                const whatsappChatUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(orderReceiptText)}`;

                return (
                  <div
                    key={order.id}
                    className="bg-stone-950/90 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-4 hover:border-amber-500/40 transition-all shadow-xl"
                  >
                    {/* Real-time Order Status Header Banner */}
                    {getStatusBadge(order.status)}

                    {/* Courier Tracking Status Stepper */}
                    {order.courierTrackingId && (
                      <div className="bg-stone-900 border border-stone-800/80 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-stone-800/60 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded-md border border-amber-500/20">
                              {order.courierName} Delivery
                            </span>
                            <span className="text-stone-400 text-xs">Tracking ID:</span>
                            <span className="font-mono font-bold text-stone-200 text-xs">{order.courierTrackingId}</span>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(order.courierTrackingId || '');
                              alert('Tracking ID copied!');
                            }}
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
                          >
                            Copy ID
                          </button>
                        </div>

                        {/* Visually stunning progress stepper */}
                        <div className="relative pt-2">
                          <div className="absolute left-4 top-[24px] bottom-[24px] w-0.5 bg-stone-800 sm:left-auto sm:top-5 sm:bottom-auto sm:left-6 sm:right-6 sm:h-0.5 sm:w-auto sm:bg-stone-800"></div>
                          
                          {/* Colored line representing progress */}
                          <div 
                            className="absolute left-4 top-[24px] w-0.5 bg-amber-500 transition-all duration-500 sm:left-auto sm:top-5 sm:h-0.5 sm:bg-amber-500"
                            style={{
                              bottom: order.status === 'Delivered' ? '24px' : order.status === 'Shipped' ? '50%' : '75%',
                              width: typeof window !== 'undefined' && window.innerWidth >= 640 ? (order.status === 'Delivered' ? '100%' : order.status === 'Shipped' ? '66%' : order.status === 'Processing' ? '33%' : '0%') : '0.5px',
                              height: typeof window !== 'undefined' && window.innerWidth < 640 ? 'auto' : '2px'
                            }}
                          ></div>

                          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-2 relative z-10">
                            {/* Step 1: Confirmed */}
                            <div className="flex sm:flex-col items-center gap-3 sm:gap-1.5 text-left sm:text-center sm:flex-1">
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs transition-all ${
                                ['Confirmed', 'Processing', 'Shipped', 'Delivered'].includes(order.status)
                                  ? 'bg-amber-500 border-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                                  : 'bg-stone-900 border-stone-800 text-stone-500'
                              }`}>
                                ✓
                              </div>
                              <div>
                                <p className="font-bold text-xs text-stone-200">Confirmed</p>
                                <p className="text-[9px] text-stone-500">Order confirmed</p>
                              </div>
                            </div>

                            {/* Step 2: Processing */}
                            <div className="flex sm:flex-col items-center gap-3 sm:gap-1.5 text-left sm:text-center sm:flex-1">
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs transition-all ${
                                ['Processing', 'Shipped', 'Delivered'].includes(order.status)
                                  ? 'bg-amber-500 border-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                                  : 'bg-stone-900 border-stone-800 text-stone-500'
                              }`}>
                                ⚙️
                              </div>
                              <div>
                                <p className="font-bold text-xs text-stone-200">Processing</p>
                                <p className="text-[9px] text-stone-500">Packed & prepared</p>
                              </div>
                            </div>

                            {/* Step 3: Shipped */}
                            <div className="flex sm:flex-col items-center gap-3 sm:gap-1.5 text-left sm:text-center sm:flex-1">
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs transition-all ${
                                ['Shipped', 'Delivered'].includes(order.status)
                                  ? 'bg-amber-500 border-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                                  : 'bg-stone-900 border-stone-800 text-stone-500'
                              }`}>
                                🚚
                              </div>
                              <div>
                                <p className="font-bold text-xs text-stone-200">Shipped</p>
                                <p className="text-[9px] text-stone-500">In transit</p>
                              </div>
                            </div>

                            {/* Step 4: Delivered */}
                            <div className="flex sm:flex-col items-center gap-3 sm:gap-1.5 text-left sm:text-center sm:flex-1">
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs transition-all ${
                                order.status === 'Delivered'
                                  ? 'bg-amber-500 border-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                                  : 'bg-stone-900 border-stone-800 text-stone-500'
                              }`}>
                                🎁
                              </div>
                              <div>
                                <p className="font-bold text-xs text-stone-200">Delivered</p>
                                <p className="text-[9px] text-stone-500">Received successfully</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Meta Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-3 text-xs">
                      <div>
                        <span className="text-stone-400">{t.orderId}: </span>
                        <span className="font-mono font-bold text-amber-400 text-sm">#{order.id}</span>
                      </div>
                      <div className="text-stone-400">
                        <span>Date: </span>
                        <span className="text-stone-200">{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-900/60 p-3 rounded-xl border border-stone-800">
                      <div>
                        <p className="text-stone-400 font-semibold mb-1">👤 Customer Information:</p>
                        <p className="font-bold text-stone-100">{order.customer.fullName}</p>
                        <p className="text-amber-400 font-mono">{order.customer.mobileNumber}</p>
                      </div>
                      <div>
                        <p className="text-stone-400 font-semibold mb-1">📍 Delivery Location:</p>
                        <p className="text-stone-200 leading-snug">
                          {order.customer.houseNumber}, {order.customer.village}, {order.customer.upazila}, {order.customer.district}, {order.customer.division}
                        </p>
                        {order.customer.optionalDetails && (
                          <p className="text-[11px] text-stone-400 italic mt-0.5">Note: {order.customer.optionalDetails}</p>
                        )}
                      </div>
                    </div>

                    {/* Items List */}
                    <div>
                      <p className="text-xs font-semibold text-stone-300 mb-2">🛒 Ordered Items ({order.items.length}):</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-3 bg-stone-900/90 border border-stone-800/80 p-2.5 rounded-lg text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              {item.product.images && item.product.images[0] && (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-10 h-10 object-cover rounded-md border border-stone-800"
                                />
                              )}
                              <div>
                                <p className="font-bold text-stone-100 line-clamp-1">{item.product.name}</p>
                                <p className="text-[10px] text-stone-400">
                                  Size: <span className="text-amber-400 font-medium">{item.selectedSize}</span> | Color: <span className="text-amber-400 font-medium">{item.selectedColor}</span>
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-stone-200">৳{item.product.price} × {item.quantity}</p>
                              <p className="text-amber-400 font-bold">৳{item.product.price * item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Billing Summary */}
                    <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800/80 text-xs space-y-1.5">
                      <div className="flex justify-between text-stone-400">
                        <span>Subtotal:</span>
                        <span>৳{order.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-stone-400">
                        <span>Delivery Charge:</span>
                        <span>৳{order.deliveryFee}</span>
                      </div>
                      <div className="flex justify-between text-stone-100 font-bold text-sm pt-1 border-t border-stone-800">
                        <span>Grand Total:</span>
                        <span className="text-amber-400 font-mono text-base">৳{order.totalAmount}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-stone-400 pt-1">
                        <span>Payment Method: <strong className="text-stone-200">{order.paymentMethod}</strong></span>
                        {order.transactionId && <span>TrxID: <strong className="text-amber-400 font-mono">{order.transactionId}</strong></span>}
                      </div>
                    </div>

                    {/* Quick Action Footer */}
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-stone-800/80">
                      <a
                        href={whatsappChatUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat on Admin WhatsApp</span>
                      </a>

                      <a
                        href={`tel:${siteSettings.adminPhone}`}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>Call Support ({siteSettings.adminPhone})</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
