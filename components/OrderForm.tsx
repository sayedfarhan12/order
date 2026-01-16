import React, { useState, useEffect } from 'react';
import { NewOrderForm, AppConfig, ProductType } from '../types';
import { Plus, Trash2, Save, ShoppingBag, User, DollarSign, MapPin, Phone, FileText, Info } from 'lucide-react';

interface OrderFormProps {
  onSubmit: (data: NewOrderForm) => void;
  initialData?: NewOrderForm;
  isEditing?: boolean;
  config: AppConfig;
}

// Default cost prices mapping
const DEFAULT_COSTS: Record<string, number> = {
  "هودي": 550,
  "سويتشيرت": 400,
  "بنطلون": 450,
  "تيشيرت": 250,
  "شورت": 200
};

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
    const cost = DEFAULT_COSTS[defaultType] || 0;
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        type: defaultType,
        color: '',
        size: defaultSize,
        quantity: 1,
        price: 0,
        costPrice: cost
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
    let updatedItem = { ...newItems[index], [field]: value };
    
    // Auto-fill cost if type changes
    if (field === 'type' && DEFAULT_COSTS[value]) {
        updatedItem.costPrice = DEFAULT_COSTS[value];
    }
    
    newItems[index] = updatedItem;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateProfit = () => {
    return formData.items.reduce((sum, item) => sum + ((item.price - item.costPrice) * item.quantity), 0);
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

  const inputClasses = "w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white text-slate-800 font-bold transition-all placeholder:text-slate-300 shadow-sm";
  const labelClasses = "block text-[11px] font-black text-slate-500 mb-1.5 mr-1 uppercase tracking-wider";

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in pb-32">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
          {isEditing ? <FileText size={28} /> : <Plus size={28} />}
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800">
            {isEditing ? 'تعديل الأوردر' : 'أوردر جديد'}
          </h2>
          <p className="text-slate-500 text-sm font-medium">أكمل البيانات التالية بدقة لضمان سهولة التنفيذ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Customer Data */}
        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <User size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-800">بيانات العميل</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className={labelClasses}>اسم العميل الكامل</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  required
                  type="text"
                  placeholder="أدخل اسم العميل..."
                  className={`${inputClasses} pl-10`}
                  value={formData.customerName}
                  onChange={e => setFormData({...formData, customerName: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className={labelClasses}>رقم الموبايل</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  required
                  type="tel"
                  placeholder="01xxxxxxxxx"
                  className={`${inputClasses} pl-10 font-mono`}
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className={labelClasses}>عنوان التوصيل بالتفصيل</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-4 text-slate-300" size={18} />
                <textarea
                  placeholder="المحافظة، المنطقة، اسم الشارع، رقم العقار..."
                  className={`${inputClasses} pl-10 h-24 resize-none leading-relaxed`}
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClasses}>مصدر الطلب</label>
              <select
                className={inputClasses}
                value={formData.source}
                onChange={e => setFormData({...formData, source: e.target.value})}
              >
                {config.sources.map(src => <option key={src} value={src}>{src}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className={labelClasses}>حالة الأوردر</label>
              <select
                className={`${inputClasses} border-blue-200 bg-blue-50/30`}
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                {config.statuses.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Section 2: Order Items */}
        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500"></div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <ShoppingBag size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-800">أصناف الأوردر</h3>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              <Plus size={18} />
              إضافة منتج
            </button>
          </div>

          <div className="space-y-6">
            {formData.items.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <ShoppingBag size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="font-bold">سلة الأوردر فارغة حالياً</p>
                    <p className="text-xs">اضغط على "إضافة منتج" للبدء</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {formData.items.map((item, index) => (
                    <div key={index} className="group p-5 bg-slate-50/50 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-white transition-all shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                        
                        <div className="md:col-span-3">
                            <label className={labelClasses}>نوع المنتج</label>
                            <select
                            className={inputClasses}
                            value={item.type}
                            onChange={e => updateItem(index, 'type', e.target.value)}
                            >
                            {config.productTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        
                        <div className="md:col-span-3">
                            <label className={labelClasses}>اللون والمقاس</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="اللون"
                                    className="w-2/3 p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none bg-white text-slate-800 font-bold text-sm"
                                    value={item.color}
                                    onChange={e => updateItem(index, 'color', e.target.value)}
                                />
                                <select
                                    className="w-1/3 p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none bg-white text-slate-800 font-bold text-sm"
                                    value={item.size}
                                    onChange={e => updateItem(index, 'size', e.target.value)}
                                >
                                    {config.productSizes.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            <label className={labelClasses}>الكمية</label>
                            <input
                            type="number"
                            min="1"
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none bg-white text-slate-800 text-center font-black"
                            value={item.quantity}
                            onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={`${labelClasses} text-indigo-600`}>سعر البيع</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={16} />
                                <input
                                type="number"
                                min="0"
                                className="w-full p-3 pl-8 border border-indigo-100 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none bg-white text-indigo-700 font-black"
                                value={item.price}
                                onChange={e => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className={`${labelClasses} text-amber-600`}>التكلفة</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-300" size={16} />
                                <input
                                type="number"
                                min="0"
                                className="w-full p-3 pl-8 border border-amber-100 rounded-xl focus:ring-4 focus:ring-amber-100 outline-none bg-white text-amber-700 font-black"
                                value={item.costPrice}
                                onChange={e => updateItem(index, 'costPrice', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-1 flex items-center justify-end">
                            <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm"
                                title="حذف المنتج"
                                >
                                <Trash2 size={20} />
                            </button>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
            )}
          </div>
          
          {/* Summary Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex gap-4 sm:gap-8">
                    <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 text-center shadow-inner">
                        <p className="text-[10px] font-black text-slate-400 mb-1 uppercase">إجمالي البيع</p>
                        <p className="text-2xl font-black text-indigo-600 font-mono">{calculateTotal().toLocaleString()} <span className="text-xs">ج.م</span></p>
                    </div>
                    <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 text-center shadow-inner">
                        <p className="text-[10px] font-black text-emerald-500 mb-1 uppercase">الربح الصافي</p>
                        <p className="text-2xl font-black text-emerald-600 font-mono">{calculateProfit().toLocaleString()} <span className="text-xs">ج.م</span></p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                    <Info size={14} />
                    <span className="text-[10px] font-bold">يتم تحديث الإجماليات تلقائياً بناءً على الكميات والأسعار</span>
                </div>
             </div>
          </div>
        </section>

        {/* Section 3: Notes */}
        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-2 h-full bg-slate-300"></div>
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                    <FileText size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-800">ملاحظات إضافية</h3>
             </div>
             <textarea
                placeholder="أدخل أي تفاصيل إضافية بخصوص الشحن أو التغليف..."
                className={`${inputClasses} h-24 resize-none`}
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
        </section>

        {/* Action Button */}
        <div className="pt-4 pb-10">
            <button
            type="submit"
            className="group w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 px-8 rounded-3xl font-black text-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
            <Save size={24} className="group-hover:rotate-12 transition-transform" />
            {isEditing ? 'تحديث بيانات الأوردر' : 'تأكيد وحفظ الأوردر'}
            </button>
        </div>
      </form>
    </div>
  );
};