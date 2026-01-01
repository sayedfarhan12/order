import React, { useState } from 'react';
import { Factory, Plus, Trash2, CheckCircle, Clock, X, Package, Search, Edit3, ShoppingBag, AlertTriangle } from 'lucide-react';
import { FactoryOrder, FactorySubItem, AppConfig } from '../types';

interface FactoryOrdersViewProps {
  orders: FactoryOrder[];
  onUpdate: (orders: FactoryOrder[]) => void;
  config: AppConfig;
}

export const FactoryOrdersView: React.FC<FactoryOrdersViewProps> = ({ orders, onUpdate, config }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'waiting' | 'received'>('all');

  const [formReference, setFormReference] = useState('');
  const [formItems, setFormItems] = useState<FactorySubItem[]>([]);
  const [formStatus, setFormStatus] = useState<FactoryOrder['status']>('waiting');

  const resetForm = () => {
    setFormReference('');
    setFormItems([]);
    setFormStatus('waiting');
    setEditingId(null);
    setIsFormOpen(false);
  };

  const openAddForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (order: FactoryOrder) => {
    setEditingId(order.id);
    setFormReference(order.orderReference);
    setFormItems([...order.items]);
    setFormStatus(order.status);
    setIsFormOpen(true);
  };

  const addFormItem = () => {
    setFormItems([...formItems, {
      type: config.productTypes[0] || '',
      size: config.productSizes[0] || '',
      color: '',
      quantity: 1
    }]);
  };

  const removeFormItem = (index: number) => {
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const updateFormItem = (index: number, field: keyof FactorySubItem, value: any) => {
    const newItems = [...formItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormItems(newItems);
  };

  const saveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (formItems.length === 0) {
      alert('يرجى إضافة قطعة واحدة على الأقل');
      return;
    }

    if (editingId) {
      onUpdate(orders.map(o => o.id === editingId ? {
        ...o,
        orderReference: formReference,
        items: formItems,
        status: formStatus
      } : o));
    } else {
      onUpdate([{
        id: `fac-${Date.now()}`,
        orderReference: formReference,
        status: 'waiting',
        createdAt: new Date().toISOString(),
        items: formItems
      }, ...orders]);
    }
    resetForm();
  };

  const updateStatus = (id: string, status: FactoryOrder['status']) => {
    onUpdate(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const confirmDelete = () => {
    if (deleteConfirmationId) {
      onUpdate(orders.filter(o => o.id !== deleteConfirmationId));
      setDeleteConfirmationId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => 
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.color.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (activeFilter === 'all') return matchesSearch;
    return matchesSearch && order.status === activeFilter;
  });

  const getStatusLabel = (status: string) => status === 'waiting' ? 'قيد الانتظار' : 'تم الاستلام';
  const getStatusColor = (status: string) => status === 'waiting' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-green-100 text-green-700 border-green-200';

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 h-full flex flex-col bg-slate-50 overflow-hidden animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm"><Factory size={24} /></div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">طلبيات المصنع</h2>
            <p className="text-xs text-gray-500 font-medium">إدارة النواقص والقطع المطلوبة</p>
          </div>
        </div>
        <button onClick={openAddForm} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 font-black shadow-lg shadow-indigo-200">
          <Plus size={20} /> إضافة طلب
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="بحث عن طلب أو منتج..."
            className="w-full pl-4 pr-10 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black font-bold shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar shrink-0">
          {['all', 'waiting', 'received'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-xs font-black whitespace-nowrap transition-all border
                    ${activeFilter === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {f === 'all' ? 'الكل' : getStatusLabel(f)} ({f === 'all' ? orders.length : orders.filter(i => i.status === f).length})
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-2xl border border-dashed border-slate-300">
            <Package size={48} className="mb-4 opacity-20" />
            <p className="font-bold">لا توجد طلبيات مطابقة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:border-indigo-200 transition-colors">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-gray-400 block mb-1">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                    <h3 className="font-black text-slate-900">{order.orderReference || 'طلب بدون مرجع'}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="flex-1 p-4 space-y-2.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-indigo-700 border border-slate-200 shadow-sm text-xs">
                          {item.quantity}
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{item.type}</p>
                          <p className="text-[10px] font-bold text-slate-500">{item.size} - {item.color}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-50/50 border-t border-slate-100 grid grid-cols-3 gap-2">
                  <button onClick={() => updateStatus(order.id, order.status === 'waiting' ? 'received' : 'waiting')} className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition-all shadow-sm ${order.status === 'waiting' ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'}`}>
                    {order.status === 'waiting' ? <CheckCircle size={14} /> : <Clock size={14} />} {order.status === 'waiting' ? 'استلام' : 'انتظار'}
                  </button>
                  <button onClick={() => openEditForm(order)} className="flex items-center justify-center gap-1.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-black hover:bg-slate-50 transition-colors">
                    <Edit3 size={14} /> تعديل
                  </button>
                  <button onClick={() => setDeleteConfirmationId(order.id)} className="flex items-center justify-center gap-1.5 py-2 bg-white border border-red-100 text-red-600 rounded-lg text-xs font-black hover:bg-red-50 transition-colors">
                    <Trash2 size={14} /> حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteConfirmationId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center">
             <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4 shadow-sm"><AlertTriangle size={32} /></div>
             <h3 className="text-xl font-black text-slate-900 mb-2">تأكيد الحذف</h3>
             <p className="text-slate-600 mb-6 text-sm font-bold">هل أنت متأكد من حذف هذا الطلب المصنعي؟</p>
             <div className="flex gap-3 w-full">
                <button onClick={() => setDeleteConfirmationId(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold transition-colors">إلغاء</button>
                <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold transition-all shadow-md shadow-red-200">حذف</button>
             </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full h-full md:h-auto md:max-w-2xl md:max-h-[90vh] md:rounded-2xl overflow-hidden flex flex-col shadow-2xl ring-1 ring-slate-200">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-black text-indigo-800 flex items-center gap-2"><Factory size={20} /> {editingId ? 'تعديل طلب المصنع' : 'إضافة طلب للمصنع'}</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full border"><X size={20} /></button>
            </div>

            <form onSubmit={saveOrder} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-black text-slate-500 mb-2">المرجع (رقم الأوردر أو اسم العميل)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أوردر #1005"
                  className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-black font-black"
                  value={formReference}
                  onChange={(e) => setFormReference(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-black text-slate-700 flex items-center gap-2"><ShoppingBag size={18} className="text-indigo-600" /> القطع المطلوبة ({formItems.length})</h4>
                  <button type="button" onClick={addFormItem} className="text-xs bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100 font-black hover:bg-indigo-100 transition-colors flex items-center gap-1">
                    <Plus size={14} /> إضافة قطعة
                  </button>
                </div>

                <div className="space-y-3">
                  {formItems.map((item, index) => (
                    <div key={index} className="p-4 bg-white rounded-xl border border-slate-200 relative animate-fade-in shadow-sm">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 mb-1">المنتج</label>
                          <select className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-slate-50 text-black font-black" value={item.type} onChange={(e) => updateFormItem(index, 'type', e.target.value)}>
                            {config.productTypes.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 mb-1">المقاس</label>
                          <select className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-slate-50 text-black font-black" value={item.size} onChange={(e) => updateFormItem(index, 'size', e.target.value)}>
                            {config.productSizes.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 mb-1">اللون</label>
                          <input type="text" required placeholder="أسود.." className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-slate-50 text-black font-black" value={item.color} onChange={(e) => updateFormItem(index, 'color', e.target.value)} />
                        </div>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="block text-[10px] font-black text-slate-400 mb-1">الكمية</label>
                            <input type="number" min="1" className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-slate-50 text-center font-black text-black" value={item.quantity} onChange={(e) => updateFormItem(index, 'quantity', parseInt(e.target.value) || 1)} />
                          </div>
                          <button type="button" onClick={() => removeFormItem(index)} className="p-2.5 text-red-500 bg-red-50 rounded-lg border border-red-100"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
                <Package size={22} /> {editingId ? 'تحديث الطلب' : 'حفظ الطلب'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};