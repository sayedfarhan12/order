export const OrderStatus = {
  PENDING: "قيد التنفيذ",
  READY: "تم التنفيذ",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
  RETURNED: "مرتجع"
} as const;

export const OrderSource = {
  STORE: "المتجر",
  FACEBOOK: "فيسبوك",
  INSTAGRAM: "إنستجرام",
  FRIENDS: "الأصدقاء",
  WHATSAPP: "واتساب"
} as const;

export const ProductType = {
  HOODIE: "هودي",
  TSHIRT: "تيشيرت",
  PANTS: "بنطلون",
  SHORTS: "شورت",
  SWEATSHIRT: "سويتشيرت"
} as const;

export const ProductSize = {
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "XXL"
} as const;

export interface OrderItem {
  id: string;
  orderId: string;
  type: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  source: string;
  status: string;
  createdAt: string;
  notes: string;
  airtableRecordId?: string; // Kept for legacy compatibility if needed
}

export interface NewOrderForm {
  customerName: string;
  phone: string;
  address: string;
  source: string;
  status: string;
  notes: string;
  items: Omit<OrderItem, 'id' | 'orderId'>[];
}

export interface AppConfig {
  statuses: string[];
  sources: string[];
  productTypes: string[];
  productSizes: string[];
}