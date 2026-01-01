import React, { useState, useEffect } from 'react';
import { NewOrderForm, AppConfig } from '../types';
import { Plus, Trash2, Save, ShoppingBag, User } from 'lucide-react';

interface OrderFormProps {
  onSubmit: (data: NewOrderForm) => void;
  initialData?: NewOrderForm;
  isEditing?: boolean;
  config: AppConfig;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onSubmit, initialData, isEditing = false, config }) => {
  const defaultStatus = config.statuses[0] || "قيد التنفيذ";
  const defaultSource = config.sources[0] || "المتجر";
  const defaultType = config.productTypes[0] || "تيشيرت";
  const defaultSize = config.productSizes[0] || "M";

  const [formData, setFormData] = useState<NewOrderForm>({
    customerName: '',
    phone: '',
    address: '',
    source: defaultSource,
    status: defaultStatus,
    notes: '',
    items: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
        setFormData(prev => ({
            ...prev,
            source: defaultSource,
            status: defaultStatus
        }));
    }
  }, [initialData, defaultSource, defaultStatus]);

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        type: defaultType,
        color: '',
        size: defaultSize,
        quantity: 1,
        price: 0
      }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone) {
      alert('يرجى ملء بيانات العميل الأساسية');
      return;
    }
    if (formData.items.length === 0) {
      alert('يرجى إضافة منتج واحد على الأقل');
      return;
    }
    onSubmit(formData);
    
    if (!isEditing) {
      setFormData({
          customerName: '',
          phone: '',
          address: '',
          source: defaultSource,
          status: defaultStatus,
          notes: '',
          items: []
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 animate-fade-in pb-20 md:pb-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Plus size={24} />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            {isEditing ? 'تعديل الأوردر' : 'إضافة أوردر جديد'}
          </h2>
          <p className="text-gray-500 text-xs md:text-sm font-medium">أدخل بيانات العميل والمنتجات</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Customer Data */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold">
            <User size={20} />
            <h3>بيانات العميل</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">اسم العميل</label>
              <input
                required
                type="text"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-black font-bold"
                value={formData.customerName}
                onChange={e => setFormData({...formData, customerName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">رقم الموبايل</label>
              <input
                required
                type="tel"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-black font-bold font-mono"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">العنوان</label>
              <textarea
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-20 resize-none bg-white text-black font-bold"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">المصدر</label>
              <select
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-black font-bold"
                value={formData.source}
                onChange={e => setFormData({...formData, source: e.target.value})}
              >
                {config.sources.map(src => <option key={src} value={src}>{src}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">الحالة</label>
              <select
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-black font-bold"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                {config.statuses.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Order Items */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold">
              <ShoppingBag size={20} />
              <h3>عناصر الأوردر</h3>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-bold transition-colors border border-blue-100 shadow-sm"
            >
              <Plus size={16} />
              إضافة منتج
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-dashed border border-slate-200">
                    لا يوجد منتجات في هذا الأوردر بعد
                </div>
            )}
            {formData.items.map((item, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                <div className="flex flex-col md:flex-row md:items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">النوع</label>
                    <select
                      className="w-full p-2 text-sm border border-slate-300 rounded-lg bg-white text-black font-bold"
                      value={item.type}
                      onChange={e => updateItem(index, 'type', e.target.value)}
                    >
                      {config.productTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-1 md:w-24">
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">اللون</label>
                        <input
                        type="text"
                        className="w-full p-2 text-sm border border-slate-300 rounded-lg bg-white text-black font-bold"
                        value={item.color}
                        onChange={e => updateItem(index, 'color', e.target.value)}
                        />
                    </div>
                    <div className="flex-1 md:w-24">
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">المقاس</label>
                        <select
                        className="w-full p-2 text-sm border border-slate-300 rounded-lg bg-white text-black font-bold"
                        value={item.size}
                        onChange={e => updateItem(index, 'size', e.target.value)}
                        >
                        {config.productSizes.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1 md:w-20">
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">الكمية</label>
                        <input
                        type="number"
                        min="1"
                        className="w-full p-2 text-sm border border-slate-300 rounded-lg bg-white text-black text-center font-black"
                        value={item.quantity}
                        onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        />
                    </div>
                    <div className="flex-1 md:w-24">
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">السعر</label>
                        <input
                        type="number"
                        min="0"
                        className="w-full p-2 text-sm border border-slate-300 rounded-lg bg-white text-black font-black"
                        value={item.price}
                        onChange={e => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                        />
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-start md:w-auto pt-2 md:pt-0 gap-4">
                     <div className="text-lg font-black text-blue-700 md:mb-2 min-w-[80px] text-left">
                        {(item.quantity * item.price).toLocaleString()}
                     </div>
                     <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="md:mb-1 p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                        title="حذف المنتج"
                        >
                        <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end items-center gap-4 border-t border-slate-200 pt-4">
             <div className="text-xl font-bold text-gray-800">
                 الإجمالي: <span className="text-blue-700 font-black">{calculateTotal().toLocaleString()} ج.م</span>
             </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3.5 px-6 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {isEditing ? 'تحديث الأوردر' : 'حفظ الأوردر'}
        </button>
      </form>
    </div>
  );
};