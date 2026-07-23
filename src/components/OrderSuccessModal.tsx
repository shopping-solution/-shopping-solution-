import React from 'react';
import { CheckCircle2, MessageSquare, Mail, Printer, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Order, SiteSettings, Language } from '../types';
import { translations } from '../data/translations';

interface OrderSuccessModalProps {
  order: Order | null;
  siteSettings: SiteSettings;
  language: Language;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  siteSettings,
  language,
  onClose,
}) => {
  if (!order) return null;

  const t = translations[language];

  // Generate WhatsApp Message text
  const cleanPhone = siteSettings.adminWhatsapp.replace(/[^0-9]/g, '');
  const itemsText = order.items
    .map(
      (item) =>
        `• ${item.product.name} [Size: ${item.selectedSize}, Color: ${item.selectedColor}, Qty: ${item.quantity}] = ৳${item.product.price * item.quantity}`
    )
    .join('\n');

  const rawWhatsappMsg = `*NEW ORDER NOTIFICATION - SHOPPING SOLUTION*
Order ID: #${order.id}
Time: ${new Date(order.createdAt).toLocaleString()}

*CUSTOMER DETAILS:*
Name: ${order.customer.fullName}
Phone: ${order.customer.mobileNumber}
Address: ${order.customer.houseNumber}, ${order.customer.village}, ${order.customer.upazila}, ${order.customer.district}, ${order.customer.division}
${order.customer.optionalDetails ? `Notes: ${order.customer.optionalDetails}` : ''}

*ORDERED ITEMS:*
${itemsText}

*PAYMENT SUMMARY:*
Subtotal: ৳${order.subtotal}
Delivery Fee: ৳${order.deliveryFee}
Total Amount: ৳${order.totalAmount}
Payment Method: ${order.paymentMethod}
${order.transactionId ? `Trx ID: ${order.transactionId}` : ''}`;

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(rawWhatsappMsg)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        className="relative bg-stone-900 border border-amber-500/40 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-stone-100 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-6 text-stone-950 text-center space-y-2">
          <div className="w-14 h-14 bg-stone-950 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight">
            {t.orderConfirmedTitle}
          </h2>
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-900">
            {t.orderId}: <span className="font-mono text-base font-extrabold">#{order.id}</span>
          </p>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto print:max-h-none">
          
          <p className="text-xs sm:text-sm text-stone-300 text-center font-light leading-relaxed">
            {t.thankYouMessage}
          </p>

          {/* Quick Notification Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.notifyAdminWhatsapp}</span>
            </a>

            <button
              onClick={() => {
                alert(
                  language === 'en'
                    ? `Simulated order notification sent to Admin Gmail (${siteSettings.adminEmail})!`
                    : `এডমিন জিমেইলে (${siteSettings.adminEmail}) অর্ডারের নোটিফিকেশন পাঠানো হয়েছে!`
                );
              }}
              className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4 text-amber-400" />
              <span>{t.notifyAdminGmail}</span>
            </button>
          </div>

          {/* Invoice Print View */}
          <div className="bg-stone-950 p-5 rounded-xl border border-stone-800 space-y-4 text-xs">
            
            <div className="flex justify-between items-start border-b border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-amber-400">SHOPPING SOLUTION</h3>
                <p className="text-[10px] text-stone-400">Date: {new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                  {order.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4 text-stone-300">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Customer Name:</span>
                <p className="font-bold text-stone-100">{order.customer.fullName}</p>
                <p className="text-stone-400">{order.customer.mobileNumber}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Address:</span>
                <p className="text-stone-300">
                  {order.customer.houseNumber}, {order.customer.village}, {order.customer.upazila}, {order.customer.district}, {order.customer.division}
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border-t border-stone-800 pt-3">
              <span className="text-[10px] uppercase font-bold text-stone-500 block mb-2">Items Ordered:</span>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-stone-300 text-xs">
                    <div>
                      <p className="font-bold text-stone-200">{item.product.name}</p>
                      <p className="text-[10px] text-stone-400">
                        Size: {item.selectedSize} | Color: {item.selectedColor} | Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-serif font-bold text-amber-400">
                      ৳ {(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border-t border-stone-800 pt-3 space-y-1.5 text-stone-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>৳ {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>৳ {order.deliveryFee}</span>
              </div>
              <div className="flex justify-between font-bold text-amber-400 text-sm pt-1 border-t border-stone-800">
                <span>Total Amount:</span>
                <span className="font-serif">৳ {order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-400 pt-1">
                <span>Payment Method:</span>
                <span className="font-bold text-stone-200">
                  {order.paymentMethod} {order.transactionId ? `(Trx: ${order.transactionId})` : ''}
                </span>
              </div>
            </div>

          </div>

          {/* Bottom Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
            <button
              onClick={handlePrint}
              className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>{t.printInvoice}</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.continueShopping}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
