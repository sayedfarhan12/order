import React, { useMemo, useState } from 'react';
import { DollarSign, ShoppingBag, FileText, Activity, Eye, X, User, Phone, MapPin, Package, MessageCircle, Calendar, Factory, Clock, AlertCircle } from 'lucide-react';
import { Order, OrderItem, OrderStatus, FactoryOrder } from '../types';

interface DashboardProps {
  orders: Order[];
  orderItems: OrderItem[];
  factoryOrders: FactoryOrder[];
}

export const Dashboard: React.FC<DashboardProps> = ({ orders, orderItems, factoryOrders }) => {
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

  // Simplified Factory Shortcuts (ONLY items waiting)
  const waitingFactoryItems = useMemo(() => {
    return factoryOrders
      .filter(o => o.status === 'waiting')
      .flatMap(o => o.items.map(i => ({
        ...i,
        ref: o.orderReference
      })));
  }, [factoryOrders]);

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

  const recentOrders = orders
    .filter(o => o.status !== OrderStatus.DELIVERED)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 animate-fade-in flex flex-col h-full overflow-hidden bg-slate-50">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 flex-shrink-0">لوحة التحكم</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 flex-shrink-0">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <p className="text-xs md:text-sm text-gray-500 mb-1">إجمالي المبيعات</p>
            <p className="text-lg md:text-2xl font-bold text-gray-800 font-mono">{stats.totalSales.toLocaleString()} ج.م</p>
          </div>
          <div className="p-2 md:p-3 bg-green-100 rounded-full text-green-600 w-fit">
            <DollarSign size={20} className="md:w-6 md:h-6" />
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <p className="text-xs md:text-sm text-gray-500 mb-1">إجمالي الأوردرات</p>
            <p className="text-lg md:text-2xl font-bold text-gray-800 font-mono">{stats.totalOrders}</p>
          </div>
          <div className="p-2 md:p-3 bg-indigo-100 rounded-full text-indigo-600 w-fit">
            <FileText size={20} className="md:w-6 md:h-6" />
          </div>
        </div>

         <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <p className="text-xs md:text-sm text-gray-500 mb-1">الأوردرات الجارية</p>
            <p className="text-lg md:text-2xl font-bold text-gray-800 font-mono">{stats.activeOrders}</p>
          </div>
          <div className="p-2 md:p-3 bg-orange-100 rounded-full text-orange-600 w-fit">
            <Activity size={20} className="md:w-6 md:h-6" />
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <p className="text-xs md:text-sm text-gray-500 mb-1">أوردرات اليوم</p>
            <p className="text-lg md:text-2xl font-bold text-gray-800 font-mono">{stats.ordersToday}</p>
          </div>
          <div className="p-2 md:p-3 bg-blue-100 rounded-full text-blue-600 w-fit">
            <ShoppingBag size={20} className="md:w-6 md:h-6" />
          </div>
        </div>
      </div>

      {/* Simplified Minimal Factory Shortages (Waiting Only) */}
      {waitingFactoryItems.length > 0 && (
        <div className="flex-shrink-0 flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
           <div className="flex items-center gap-1.5 px-3 border-l border-gray-100 shrink-0">
              <Factory size={16} className="text-indigo-500" />
              <span className="text-xs font-black text-gray-700">النواقص:</span>
           </div>
           <div className="flex gap-2 overflow-x-auto custom-scrollbar py-1">
              {waitingFactoryItems.map((item, idx) => (
                <div key={idx} className="flex-shrink-0 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg flex items-center gap-2">
                   <span className="text-[11px] font-bold text-indigo-800">{item.type}</span>
                   <span className="text-[10px] text-indigo-600 font-medium">{item.size} - {item.color}</span>
                   <span className="w-5 h-5 flex items-center justify-center bg-white rounded text-[10px] font-black text-indigo-700 shadow-sm">
                      {item.quantity}
                   </span>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
             <h3 className="text-lg font-semibold text-gray-700">أحدث الأوردرات النشطة</h3>
             {waitingFactoryItems.length === 0 && <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full border border-green-100">لا توجد نواقص مصنع</span>}
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar p-0">
            {recentOrders.length === 0 ? (
                <div className="text-center py-10 text-gray-500 flex flex-col items-center gap-2">
                   <Package size={40} className="opacity-20" />
                   <p>لا توجد أوردرات نشطة حالياً</p>
                </div>
            ) : (
                <>
                  <table className="w-full text-sm text-right relative border-collapse hidden md:table">
                    <thead className="text-gray-600 bg-gray-50 sticky top-0 z-10 shadow-sm border-b border-gray-100">
                      <tr>
                        <th className="py-3 px-4 font-semibold bg-gray-50">الرقم</th>
                        <th className="py-3 px-4 font-semibold bg-gray-50">العميل</th>
                        <th className="py-3 px-4 font-semibold bg-gray-50 text-center">التفاصيل</th>
                        <th className="py-3 px-4 font-semibold bg-gray-50">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {recentOrders.map(order => (
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
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(order.status)} border`}>
                                {order.status}
                            </span>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                  </table>

                  <div className="md:hidden space-y-3 p-4 bg-gray-50/50 pb-20">
                    {recentOrders.map(order => (
                      <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-xs font-mono text-gray-500 block mb-1">#{order.id}</span>
                            <h4 className="font-bold text-gray-800">{order.customerName}</h4>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} border`}>
                            {order.status}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="w-full py-2 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold border border-indigo-100"
                        >
                          <Eye size={16} />
                          عرض التفاصيل
                        </button>
                      </div>
                    ))}
                  </div>
                </>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full h-full md:h-auto md:rounded-xl md:max-w-4xl md:max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-gray-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm hidden md:block">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">أوردر #{selectedOrder.id}</h3>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                     <Calendar size={12}/>
                     {new Date(selectedOrder.createdAt).toLocaleString('ar-EG')}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-900 bg-gray-100 p-2 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1 bg-white space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                    <User size={16} className="text-blue-600"/>
                    بيانات العميل
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-gray-400 mt-0.5"><User size={14}/></span>
                      <div>
                        <span className="block text-xs text-gray-500">اسم العميل</span>
                        <span className="text-sm font-bold text-gray-900">{selectedOrder.customerName}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-gray-400 mt-0.5"><Phone size={14}/></span>
                      <div>
                        <span className="block text-xs text-gray-500">رقم الموبايل</span>
                        <a href={`tel:${selectedOrder.phone}`} className="text-sm font-bold text-gray-900 hover:text-blue-600 font-mono">
                          {selectedOrder.phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-gray-400 mt-0.5"><MapPin size={14}/></span>
                      <div>
                        <span className="block text-xs text-gray-500">العنوان</span>
                        <span className="text-sm font-bold text-gray-900 leading-snug">{selectedOrder.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                    <Activity size={16} className="text-blue-600"/>
                    معلومات الطلب
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 font-medium">حالة الطلب</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 font-medium">مصدر الطلب</span>
                      <span className="flex items-center gap-1 px-2.5 py-0.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 shadow-sm">
                        {selectedOrder.source}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-1">
                      <span className="text-sm text-gray-700 font-medium">إجمالي المبلغ</span>
                      <span className="text-lg font-black text-blue-700">
                         {getOrderTotal(selectedOrder.id).toLocaleString()} ج.م
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                          <Package size={16} className="text-blue-600"/>
                          المنتجات ({getOrderItemsForModal(selectedOrder.id).length})
                      </h4>
                  </div>
                  
                  <div className="hidden md:block overflow-x-auto">
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
                      </table>
                  </div>

                  <div className="md:hidden divide-y divide-gray-100 bg-white">
                    {getOrderItemsForModal(selectedOrder.id).map((item, idx) => (
                      <div key={idx} className="p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-gray-900">{item.type}</span>
                          <span className="font-mono font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()} ج.م</span>
                        </div>
                        <div className="flex gap-2 text-xs text-gray-600 mb-1">
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">{item.size}</span>
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">{item.color}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                           {item.quantity} x {item.price.toLocaleString()} ج.م
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-between items-center">
                      <span className="font-bold text-gray-900">الإجمالي الكلي</span>
                      <span className="font-black text-xl text-blue-700">
                          {getOrderTotal(selectedOrder.id).toLocaleString()} ج.م
                      </span>
                  </div>
              </div>

              {selectedOrder.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-2">
                      <FileText size={14}/>
                      ملاحظات
                  </h4>
                  <p className="text-sm text-gray-900 font-medium leading-relaxed">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row gap-3">
              <a 
                href={getWhatsAppLink(selectedOrder)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full md:w-auto px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm text-sm font-bold"
              >
                <MessageCircle size={18} />
                تواصل واتساب
              </a>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-full md:w-auto px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 rounded-lg transition-all font-bold text-sm shadow-sm"
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