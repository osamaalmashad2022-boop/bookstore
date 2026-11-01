export interface InvoiceItem {
  title: string;
  price: number;
  quantity: number;
}

export interface InvoiceDetails {
  orderRef: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  governorateName: string;
  streetAddress: string;
  notes?: string;
  items: InvoiceItem[];
  discountAmount: number;
  totalBooksPrice: number;
  shippingFee: number;
  finalTotal: number;
  merchantPhone: string;
}

export function generateWhatsAppMessage(details: InvoiceDetails): string {
  const itemsText = details.items
    .map((item, index) => `${index + 1}. ${item.title} (${item.quantity} × ${item.price} ج.م)`)
    .join('\n');

  let discountLine = '';
  if (details.discountAmount > 0) {
    discountLine = `\n🎁 *خصم باقة مسار القراءة (10%):* -${details.discountAmount} ج.م`;
  }

  const notesLine = details.notes ? `\n📝 *ملاحظات:* ${details.notes}` : '';

  const message = `📚 *طلب جديد من متجر مقبرة الكتب المنسية* (#${details.orderRef})
──────────────────
👤 *العميل:* ${details.customerName}
📱 *الهاتف:* ${details.customerPhone}
📍 *المحافظة:* ${details.governorateName}
🏠 *العنوان:* ${details.streetAddress}${notesLine}

🛒 *الكتب المطلوبة:*
${itemsText}${discountLine}

📦 *إجمالي الكتب بعد الخصم:* ${details.totalBooksPrice - details.discountAmount} ج.م
🚚 *مصاريف الشحن (${details.governorateName}):* ${details.shippingFee} ج.م
💰 *الإجمالي المطلوب عند الاستلام:* *${details.finalTotal} ج.م*
──────────────────
طريقة الدفع: الدفع نقداً عند الاستلام (COD)`;

  return message;
}

export function generateWhatsAppUrl(merchantPhone: string, message: string): string {
  // Clean phone number (remove +, spaces, leading zeros if internationalized)
  let phone = merchantPhone.replace(/\D/g, '');
  if (phone.startsWith('01') && phone.length === 11) {
    phone = '20' + phone.substring(1);
  }
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}

