import React, { useState, useEffect } from 'react';
import { NewOrderForm, AppConfig } from '../types';
import { Plus, Trash2, Save, ShoppingBag, User } from 'lucide-react';

interface OrderFormProps {
  onSubmit: (data: NewOrderForm) => void;
  initialData?: NewOrderForm;
  isEditing?: boolean;
  config: AppConfig; // Receive dynamic config
}

export const OrderForm: React.FC<OrderFormProps> = ({ onSubmit, initialData, isEditing = false, config }) => {
  // Safe defaults if config is somehow empty
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

  // Load initial data if provided (Edit Mode)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
        // Reset defaults when switching to add mode if needed
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
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Plus size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'تعديل الأوردر' : 'إضافة أوردر جديد'}
          </h2>
          <p className="text-gray-500 text-sm">
            {isEditing ? 'تعديل بيانات العميل والمنتجات' : 'أدخل بيانات العميل والمنتجات'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Customer Data */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-blue-600 font-semibold">
            <User size={20} />
            <h3>بيانات العميل</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل</label>
              <input
                required
                type="text"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                value={formData.customerName}
                onChange={e => setFormData({...formData, customerName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الموبايل</label>
              <input
                required
                type="tel"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
              <textarea
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none bg-white text-gray-900"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المصدر</label>
              <select
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                value={formData.source}
                onChange={e => setFormData({...formData, source: e.target.value})}
              >
                {config.sources.map(src => <option key={src} value={src}>{src}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
              <select
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                {config.statuses.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Order Items */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-blue-600 font-semibold">
              <ShoppingBag size={20} />
              <h3>عناصر الأوردر</h3>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium transition-colors"
            >
              <Plus size={16} />
              إضافة منتج
            </button>
          </div>

          <div className="space-y-3">
            {formData.items.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-dashed border border-gray-200">
                    لا يوجد منتجات في هذا الأوردر بعد
                </div>
            )}
            {formData.items.map((item, index) => (
              <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
                <div className="w-full md:w-1/5">
                  <label className="block text-xs text-gray-500 mb-1">النوع</label>
                  <select
                    className="w-full p-2 text-sm border rounded bg-white text-gray-900"
                    value={item.type}
                    onChange={e => updateItem(index, 'type', e.target.value)}
                  >
                    {config.productTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="w-1/2 md:w-1/6">
                  <label className="block text-xs text-gray-500 mb-1">اللون</label>
                  <input
                    type="text"
                    className="w-full p-2 text-sm border rounded bg-white text-gray-900"
                    value={item.color}
                    onChange={e => updateItem(index, 'color', e.target.value)}
                  />
                </div>
                <div className="w-1/2 md:w-1/6">
                  <label className="block text-xs text-gray-500 mb-1">المقاس</label>
                  <select
                    className="w-full p-2 text-sm border rounded bg-white text-gray-900"
                    value={item.size}
                    onChange={e => updateItem(index, 'size', e.target.value)}
                  >
                    {config.productSizes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="w-1/2 md:w-1/6">
                  <label className="block text-xs text-gray-500 mb-1">الكمية</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2 text-sm border rounded bg-white text-gray-900"
                    value={item.quantity}
                    onChange={e => updateItem(index, 'quantity', parseInt(e.target.value))}
                  />
                </div>
                <div className="w-1/2 md:w-1/6">
                  <label className="block text-xs text-gray-500 mb-1">السعر</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full p-2 text-sm border rounded bg-white text-gray-900"
                    value={item.price}
                    onChange={e => updateItem(index, 'price', parseFloat(e.target.value))}
                  />
                </div>
                <div className="w-full md:w-auto pt-2 md:pt-0">
                    <div className="text-sm font-bold text-gray-700 md:mb-3 md:mx-2 text-left">
                        {(item.quantity * item.price).toLocaleString()} ج.م
                    </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="absolute -left-2 -top-2 md:static md:text-red-500 md:p-2 md:hover:bg-red-50 md:rounded bg-red-500 text-white rounded-full p-1 shadow-sm md:shadow-none"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end items-center gap-4 border-t pt-4">
             <div className="text-xl font-bold text-gray-800">
                 الإجمالي: <span className="text-blue-600">{calculateTotal().toLocaleString()} ج.م</span>
             </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {isEditing ? 'تحديث الأوردر' : 'حفظ الأوردر'}
        </button>
      </form>
    </div>
  );
};