import React, { useMemo, useState } from 'react';
import { DollarSign, ShoppingBag, FileText, Activity, Eye, X, User, Phone, MapPin, Package, MessageCircle, Calendar } from 'lucide-react';
import { Order, OrderItem, OrderStatus } from '../types';

interface DashboardProps {
  orders: Order[];
  orderItems: OrderItem[];
}

export const Dashboard: React.FC<DashboardProps> = ({ orders, orderItems }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Calculations
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    const calculateOrderTotal = (orderId: number) => {
      return orderItems
        .filter(item => item.orderId === orderId.toString())
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const totalSales = orders
      .filter(o => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.RETURNED)
      .reduce((sum, order) => sum + calculateOrderTotal(order.id), 0);

    const ordersToday = orders.filter(o => o.createdAt.startsWith(today)).length;
    
    // Active orders: Not Delivered, Not Cancelled, and Not Returned
    const activeOrders = orders.filter(o => 
      o.status !== OrderStatus.DELIVERED && 
      o.status !== OrderStatus.CANCELLED && 
      o.status !== OrderStatus.RETURNED
    ).length;

    return {
      totalSales,
      totalOrders: orders.length,
      activeOrders,
      ordersToday,
    };
  }, [orders, orderItems]);

  const getOrderItemsForModal = (orderId: number) => {
    return orderItems.filter(item => item.orderId === orderId.toString());
  };

  const getOrderTotal = (orderId: number) => {
    return getOrderItemsForModal(orderId).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getWhatsAppLink = (order: Order) => {
    const sanitizedPhone = order.phone.replace(/[\s-]/g, '');
    const message = encodeURIComponent(`مرحباً ${order.customerName}، بخصوص طلبك رقم ${order.id}`);
    return `https://wa.me/${sanitizedPhone}?text=${message}`;
  };

  const getStatusColor = (status: string) => {
    if (status === OrderStatus.PENDING) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (status === OrderStatus.CANCELLED) return 'bg-red-100 text-red-800 border-red-200';
    if (status === OrderStatus.RETURNED) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (status === OrderStatus.DELIVERED) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  // Filter orders: Remove Delivered, Sort by Date Descending
  const recentOrders = orders
    .filter(o => o.status !== OrderStatus.DELIVERED)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-6 space-y-6 animate-fade-in flex flex-col h-full overflow-hidden">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex-shrink-0">لوحة التحكم (Dashboard)</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        {/* Total Sales */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">إجمالي المبيعات</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalSales.toLocaleString()} ج.م</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">إجمالي الأوردرات</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
            <FileText size={24} />
          </div>
        </div>

         {/* Active Orders */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">الأوردرات الجارية</p>
            <p className="text-2xl font-bold text-gray-800">{stats.activeOrders}</p>
          </div>
          <div className="p-3 bg-orange-100 rounded-full text-orange-600">
            <Activity size={24} />
          </div>
        </div>

        {/* Orders Today */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">أوردرات اليوم</p>
            <p className="text-2xl font-bold text-gray-800">{stats.ordersToday}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <ShoppingBag size={24} />
          </div>
        </div>
      </div>

      {/* Tables Section - Full Width, Flexible Height */}
      <div className="flex-1 min-h-0 mt-4 flex flex-col">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex-shrink-0">أحدث الأوردرات النشطة</h3>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-sm text-right relative border-collapse">
              <thead className="text-gray-600 bg-gray-50 sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4 font-semibold bg-gray-50">الرقم</th>
                  <th className="py-3 px-4 font-semibold bg-gray-50">العميل</th>
                  <th className="py-3 px-4 font-semibold bg-gray-50 text-center">التفاصيل</th>
                  <th className="py-3 px-4 font-semibold bg-gray-50">الحالة</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="text-center py-10 text-gray-500">لا توجد أوردرات نشطة حالياً</td>
                    </tr>
                ) : (
                    recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-gray-500">#{order.id}</td>
                        <td className="py-3 px-4 font-semibold text-gray-800">{order.customerName}</td>
                        <td className="py-3 px-4 text-center">
                            <button
                                onClick={() => setSelectedOrder(order)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-medium transition-colors"
                            >
                                <Eye size={14} />
                                عرض التفاصيل
                            </button>
                        </td>
                        <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block
                            ${order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                            order.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-800' : 
                            order.status === OrderStatus.RETURNED ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'}`}>
                            {order.status}
                        </span>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-gray-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2.5 rounded-lg text-white shadow-sm">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">أوردر #{selectedOrder.id}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                     <Calendar size={14}/>
                     {new Date(selectedOrder.createdAt).toLocaleString('ar-EG')}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white space-y-6">
              
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Details */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    <User size={18} className="text-blue-600"/>
                    بيانات العميل
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-gray-500 mt-1"><User size={16}/></span>
                      <div>
                        <span className="block text-xs text-gray-500">اسم العميل</span>
                        <span className="text-sm font-bold text-gray-900">{selectedOrder.customerName}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-gray-500 mt-1"><Phone size={16}/></span>
                      <div>
                        <span className="block text-xs text-gray-500">رقم الموبايل</span>
                        <a href={`tel:${selectedOrder.phone}`} className="text-sm font-bold text-gray-900 hover:text-blue-600 font-mono">
                          {selectedOrder.phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-gray-500 mt-1"><MapPin size={16}/></span>
                      <div>
                        <span className="block text-xs text-gray-500">العنوان</span>
                        <span className="text-sm font-bold text-gray-900 leading-snug">{selectedOrder.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    <Activity size={18} className="text-blue-600"/>
                    معلومات الطلب
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 font-medium">حالة الطلب</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 font-medium">مصدر الطلب</span>
                      <span className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 shadow-sm">
                        {selectedOrder.source}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                      <span className="text-sm text-gray-700 font-medium">إجمالي المبلغ</span>
                      <span className="text-lg font-black text-blue-700">
                         {getOrderTotal(selectedOrder.id).toLocaleString()} ج.م
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gray-100 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                      <h4 className="flex items-center gap-2 text-base font-bold text-gray-900">
                          <Package size={18} className="text-blue-600"/>
                          المنتجات ({getOrderItemsForModal(selectedOrder.id).length})
                      </h4>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-right">
                          <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
                            <tr>
                              <th className="px-5 py-3 font-bold">المنتج</th>
                              <th className="px-5 py-3 font-bold">التفاصيل</th>
                              <th className="px-5 py-3 font-bold text-center">الكمية</th>
                              <th className="px-5 py-3 font-bold">السعر</th>
                              <th className="px-5 py-3 font-bold">الإجمالي</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {getOrderItemsForModal(selectedOrder.id).map((item, idx) => (
                              <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                                <td className="px-5 py-4 font-bold text-gray-900">{item.type}</td>
                                <td className="px-5 py-4 text-gray-900">
                                   <div className="flex items-center gap-2">
                                      <span className="inline-block px-2 py-0.5 rounded border bg-gray-50 text-xs font-bold border-gray-200 text-black">{item.size}</span>
                                      <span className="inline-block px-2 py-0.5 rounded border bg-gray-50 text-xs font-bold border-gray-200 text-black">{item.color}</span>
                                   </div>
                                </td>
                                <td className="px-5 py-4 text-center font-mono font-bold text-gray-900">{item.quantity}</td>
                                <td className="px-5 py-4 font-mono font-bold text-gray-900">{item.price.toLocaleString()}</td>
                                <td className="px-5 py-4 font-mono font-black text-gray-900">{(item.price * item.quantity).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50 border-t border-gray-200">
                              <tr>
                                  <td colSpan={4} className="px-5 py-4 font-bold text-gray-900 text-left">الإجمالي الكلي</td>
                                  <td className="px-5 py-4 font-black text-xl text-blue-700">
                                      {getOrderTotal(selectedOrder.id).toLocaleString()} ج.م
                                  </td>
                              </tr>
                          </tfoot>
                      </table>
                  </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-amber-800 mb-2">
                      <FileText size={16}/>
                      ملاحظات
                  </h4>
                  <p className="text-sm text-gray-900 font-medium leading-relaxed">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <div className="flex gap-3">
                <a 
                  href={getWhatsAppLink(selectedOrder)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-all shadow-sm text-sm font-bold"
                >
                  <MessageCircle size={18} />
                  تواصل واتساب
                </a>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 rounded-lg transition-all font-bold text-sm shadow-sm"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};