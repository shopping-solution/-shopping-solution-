/**
 * Helper utility functions for formatting phone numbers, WhatsApp URLs, and Email links.
 */
import { Order } from '../types';

export function formatWhatsappNumber(phoneStr: string): string {
  if (!phoneStr) return '';
  let clean = phoneStr.replace(/[^0-9]/g, '');
  if (!clean) return '';

  // If number starts with 01 (standard 11-digit Bangladesh mobile number e.g. 01712345678)
  if (clean.startsWith('01')) {
    clean = '88' + clean;
  }
  // If number starts with 1 (10 digits e.g. 1712345678)
  else if (clean.startsWith('1') && clean.length === 10) {
    clean = '880' + clean;
  }
  return clean;
}

export function formatPhoneForCall(phoneStr: string): string {
  if (!phoneStr) return '';
  return phoneStr.replace(/[^0-9+]/g, '');
}

export function getGmailComposeUrl(email: string, subject: string, body: string): string {
  const cleanEmail = email ? email.trim() : '';
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(cleanEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function getMailtoUrl(email: string, subject: string, body: string): string {
  const cleanEmail = email ? email.trim() : '';
  return `mailto:${cleanEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function generateOrderReceiptText(
  order: Order,
  type: 'new_order_admin' | 'order_confirmed_customer' | 'status_update_customer'
): string {
  const itemsText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.product.name}*\n   • Size: ${item.selectedSize} | Color: ${item.selectedColor}\n   • Qty: ${item.quantity} × ৳${item.product.price} = *৳${item.product.price * item.quantity}*`
    )
    .join('\n\n');

  let header = '';
  if (type === 'new_order_admin') {
    header = `🚨 *NEW ORDER RECEIVED - SHOPPING SOLUTION* 🚨\n\nAttention Admin, a new order has just been placed by a customer!`;
  } else if (type === 'order_confirmed_customer') {
    header = `✅ *ORDER CONFIRMED & OFFICIAL RECEIPT - SHOPPING SOLUTION* ✅\n\nDear *${order.customer.fullName}*, your order has been successfully *CONFIRMED*! Below is your official receipt:`;
  } else {
    header = `📦 *ORDER STATUS UPDATE - SHOPPING SOLUTION* 📦\n\nDear *${order.customer.fullName}*, your order status has been updated to: *${order.status.toUpperCase()}*!`;
  }

  const addressString = `${order.customer.houseNumber}, ${order.customer.village}, ${order.customer.upazila}, ${order.customer.district}, ${order.customer.division}`;

  return `${header}

----------------------------------------
📄 *OFFICIAL ORDER RECEIPT*
• *Order ID:* #${order.id}
• *Date & Time:* ${new Date(order.createdAt).toLocaleString()}
• *Current Status:* *${order.status.toUpperCase()}*

👤 *CUSTOMER INFORMATION:*
• *Full Name:* ${order.customer.fullName}
• *Mobile Phone:* ${order.customer.mobileNumber}
• *Delivery Address:* ${addressString}
${order.customer.optionalDetails ? `• *Landmark / Notes:* ${order.customer.optionalDetails}\n` : ''}
🛒 *ORDERED ITEMS (${order.items.length}):*
${itemsText}

----------------------------------------
💰 *BILLING & PAYMENT SUMMARY:*
• *Subtotal:* ৳${order.subtotal}
• *Delivery Fee:* ৳${order.deliveryFee}
• *Grand Total:* *৳${order.totalAmount}*
• *Payment Method:* *${order.paymentMethod}*
${order.transactionId ? `• *Transaction ID (TrxID):* *${order.transactionId}*\n` : ''}
----------------------------------------
${
  type === 'new_order_admin'
    ? '⚡ *Action Required:* Please open your Admin Panel to process and confirm this order.'
    : '❤️ Thank you for shopping with SHOPPING SOLUTION! If you have any questions, reply to us directly on WhatsApp.'
}`;
}

