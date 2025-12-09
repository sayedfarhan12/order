import React, { useState } from 'react';
import { Order, OrderItem, OrderStatus as DefaultOrderStatus } from '../types';
import { MessageCircle, Eye, Search, Filter, Pencil, Trash2, X, MapPin, Phone, User, Calendar, FileText, Package, Activity, AlertTriangle, ChevronDown } from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  orderItems: OrderItem[];
  onStatusChange: (id: number, newStatus: string) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (id: number) => void;
  statuses: string[]; // Dynamic statuses
}

type FilterType = 'ALL' | 'TODAY' | string;

interface TabButtonProps {
  label: string;
  filterValue: FilterType;
  count?: number;
  isActive: boolean;
  onClick: (value: FilterType) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, filterValue, count, isActive, onClick }) => (
  <button
    onClick={() => onClick(filterValue)}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-2 border
      ${isActive 
        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
        : 'border-transparent text-gray-600 hover:bg-gray-100'}`}
  >
    {label} 
    {count !== undefined && (
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
        ${isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
        {count}
      </span>
    )}
  </button>
);

export const OrdersView: React.FC<OrdersViewProps> = ({ 
  orders, 
  orderItems, 
  onStatusChange,
  onEditOrder,
  onDeleteOrder,
  statuses
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);

  const getOrderTotal = (orderId: number) => {
    return orderItems
      .filter(item => item.orderId === orderId.toString())
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getOrderItems = (orderId: number) => {
    return orderItems.filter(item => item.orderId === orderId.toString());
  };

  const getWhatsAppLink = (order: Order) => {
    // Sanitize phone number (remove spaces, dashes)
    const sanitizedPhone = order.phone.replace(/[\s-]/g, '');
    const message = encodeURIComponent(`مرحباً ${order.customerName}، بخصوص طلبك رقم ${order.id}`);
    return `https://wa.me/${sanitizedPhone}?text=${message}`;
  };

  const getStatusColor = (status: string) => {
    // Basic color mapping for known statuses, fallback for dynamic ones
    switch (status) {
      case DefaultOrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800 border-green-200';
      case DefaultOrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case DefaultOrderStatus.READY:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case DefaultOrderStatus.SHIPPED:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case DefaultOrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      case DefaultOrderStatus.RETURNED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        // Default color for user-added statuses
        return 'bg-indigo-50 text-indigo-600 border-indigo-200';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      order.phone.includes(searchTerm);

    if (!matchesSearch) return false;

    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'TODAY') {
      const today = new Date().toISOString().split('T')[0];
      return order.createdAt.startsWith(today);
    }
    return order.status === activeFilter;
  });

  return (
    <div className="p-4 md:p-6 h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4 flex-shrink-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">الأوردرات</h2>
        <div className="relative w-full md:w-auto">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="بحث (اسم، موبايل، رقم)..." 
            className="w-full pl-4 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none md:w-80 bg-white text-gray-900 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs / Filters */}
      <div className="flex overflow-x-auto pb-2 mb-4 gap-2 custom-scrollbar flex-shrink-0">
        <TabButton 
          label="الكل" 
          filterValue="ALL" 
          count={orders.length} 
          isActive={activeFilter === 'ALL'}
          onClick={setActiveFilter}
        />
        <TabButton 
          label="اليوم" 
          filterValue="TODAY" 
          count={orders.filter(o => o.createdAt.startsWith(new Date().toISOString().split('T')[0])).length} 
          isActive={activeFilter === 'TODAY'}
          onClick={setActiveFilter}
        />
        {statuses.map(status => (
          <TabButton 
            key={status} 
            label={status} 
            filterValue={status} 
            count={orders.filter(o => o.status === status).length}
            isActive={activeFilter === status}
            onClick={setActiveFilter}
          />
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden bg-white/50 rounded-xl md:bg-white md:shadow md:border md:border-gray-200 flex flex-col min-h-0">
        <div className="overflow-y-auto custom-scrollbar flex-1 p-0.5 md:p-0">
          
          {filteredOrders.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-gray-500">
               <Search size={48} className="mb-4 text-gray-300" />
               <p>لا توجد أوردرات مطابقة للبحث</p>
             </div>
          ) : (
            <>
              {/* --- DESKTOP VIEW (Table) --- */}
              <table className="w-full text-sm text-right whitespace-nowrap hidden md:table">
                <thead className="bg-gray-50 text-gray-700 font-semibold sticky top-0 z-10 shadow-sm border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">رقم الأوردر</th>
                    <th className="px-6 py-4">اسم العميل</th>
                    <th className="px-6 py-4">رقم الموبايل</th>
                    <th className="px-6 py-4">العنوان</th>
                    <th className="px-6 py-4">الحالة</th>
                    <th className="px-6 py-4">الإجمالي</th>
                    <th className="px-6 py-4">التاريخ</th>
                    <th className="px-6 py-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-gray-600 font-medium cursor-pointer hover:text-blue-600 hover:underline" onClick={() => setSelectedOrder(order)}>
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{order.customerName}</td>
                      <td className="px-6 py-4 font-mono text-gray-600">{order.phone}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={order.address}>{order.address}</td>
                      <td className="px-6 py-4">
                        <select 
                          value={order.status}
                          onChange={(e) => onStatusChange(order.id, e.target.value)}
                          className={`text-xs font-bold rounded-full px-3 py-1.5 border outline-none cursor-pointer appearance-none ${getStatusColor(order.status)}`}
                        >
                          {statuses.map(status => (
                            <option key={status} value={status} className="bg-white text-gray-900">{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {getOrderTotal(order.id).toLocaleString()} ج.م
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="عرض التفاصيل"
                          >
                            <Eye size={18} />
                          </button>
                          <a 
                            href={getWhatsAppLink(order)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="واتساب"
                          >
                            <MessageCircle size={18} />
                          </a>
                          <button 
                            type="button"
                            onClick={() => onEditOrder(order)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="تعديل"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmationId(order.id);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* --- MOBILE VIEW (Cards) --- */}
              <div className="md:hidden space-y-3 pb-20">
                {filteredOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Card Header */}
                    <div className="p-4 border-b border-gray-50 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-xs font-mono text-gray-400">#{order.id}</span>
                           <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">{order.customerName}</h3>
                        <p className="text-gray-500 text-sm mt-0.5">{order.phone}</p>
                      </div>
                      <div className="text-left">
                        <div className="font-black text-blue-600 text-lg mb-1">{getOrderTotal(order.id).toLocaleString()} ج.م</div>
                        <div className="relative">
                           <select 
                            value={order.status}
                            onChange={(e) => onStatusChange(order.id, e.target.value)}
                            className={`w-full text-xs font-bold rounded-lg pl-2 pr-6 py-1.5 border appearance-none ${getStatusColor(order.status)}`}
                          >
                            {statuses.map(status => (
                              <option key={status} value={status} className="bg-white text-gray-900">{status}</option>
                            ))}
                          </select>
                          <ChevronDown size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Actions */}
                    <div className="grid grid-cols-4 divide-x divide-x-reverse divide-gray-100 bg-gray-50">
                       <button 
                         onClick={() => setSelectedOrder(order)}
                         className="p-3 flex items-center justify-center text-indigo-600 active:bg-indigo-100"
                       >
                         <Eye size={20} />
                       </button>
                       <a 
                         href={getWhatsAppLink(order)}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="p-3 flex items-center justify-center text-green-600 active:bg-green-100"
                       >
                         <MessageCircle size={20} />
                       </a>
                       <button 
                         onClick={() => onEditOrder(order)}
                         className="p-3 flex items-center justify-center text-blue-600 active:bg-blue-100"
                       >
                         <Pencil size={20} />
                       </button>
                       <button 
                         onClick={() => setDeleteConfirmationId(order.id)}
                         className="p-3 flex items-center justify-center text-red-600 active:bg-red-100"
                       >
                         <Trash2 size={20} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center">
             <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4 shadow-sm">
                <AlertTriangle size={32} />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">تأكيد الحذف</h3>
             <p className="text-gray-600 mb-6 text-sm">
                هل أنت متأكد من حذف الأوردر رقم <span className="font-bold text-gray-900 font-mono">#{deleteConfirmationId}</span>؟
             </p>
             <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteConfirmationId(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => {
                    onDeleteOrder(deleteConfirmationId);
                    setDeleteConfirmationId(null);
                  }}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors shadow-md shadow-red-200"
                >
                  حذف
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] md:rounded-xl flex flex-col overflow-hidden ring-1 ring-gray-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm hidden md:block">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">أوردر #{selectedOrder.id}</h3>
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

            {/* Modal Body */}
            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1 bg-white space-y-4 md:space-y-6">
              
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Details */}
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

                {/* Order Details */}
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

              {/* Products Table (Responsive) */}
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                          <Package size={16} className="text-blue-600"/>
                          المنتجات ({getOrderItems(selectedOrder.id).length})
                      </h4>
                  </div>
                  
                  {/* Desktop Table */}
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
                            {getOrderItems(selectedOrder.id).map((item, idx) => (
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

                  {/* Mobile Product Cards */}
                  <div className="md:hidden divide-y divide-gray-100 bg-white">
                    {getOrderItems(selectedOrder.id).map((item, idx) => (
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

              {/* Notes */}
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

            {/* Footer */}
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