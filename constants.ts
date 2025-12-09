import { Order, OrderItem, OrderSource, OrderStatus, ProductSize, ProductType, Transaction } from "./types";

export const INITIAL_ORDERS: Order[] = [
  {
    id: 1001,
    customerName: "أحمد محمد",
    phone: "01012345678",
    address: "القاهرة، مدينة نصر، شارع الطيران",
    source: OrderSource.FACEBOOK,
    status: OrderStatus.DELIVERED,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    notes: "يرجى الاتصال قبل الوصول",
  },
  {
    id: 1002,
    customerName: "سارة علي",
    phone: "01198765432",
    address: "الإسكندرية، سموحة",
    source: OrderSource.INSTAGRAM,
    status: OrderStatus.PENDING,
    createdAt: new Date().toISOString(), // Today
    notes: "",
  },
  {
    id: 1003,
    customerName: "محمود حسن",
    phone: "01234567890",
    address: "الجيزة، الدقي",
    source: OrderSource.STORE,
    status: OrderStatus.READY,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    notes: "تغليف هدايا",
  },
  {
    id: 1004,
    customerName: "كريم يحيى",
    phone: "01000000000",
    address: "المنصورة، شارع المشاية",
    source: OrderSource.WHATSAPP,
    status: OrderStatus.CANCELLED,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    notes: "العميل ألغى الطلب",
  }
];

export const INITIAL_ORDER_ITEMS: OrderItem[] = [
  { id: "item-1", orderId: "1001", type: ProductType.HOODIE, color: "أسود", size: ProductSize.L, quantity: 1, price: 450 },
  { id: "item-2", orderId: "1001", type: ProductType.PANTS, color: "بيج", size: "32" as any, quantity: 1, price: 250 },
  { id: "item-3", orderId: "1002", type: ProductType.TSHIRT, color: "أبيض", size: ProductSize.M, quantity: 2, price: 150 },
  { id: "item-4", orderId: "1003", type: ProductType.SWEATSHIRT, color: "كحلي", size: ProductSize.XL, quantity: 1, price: 350 },
  { id: "item-5", orderId: "1004", type: ProductType.HOODIE, color: "رمادي", size: ProductSize.XXL, quantity: 1, price: 500 },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];