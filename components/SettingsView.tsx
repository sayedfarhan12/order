import React, { useState, useRef } from 'react';
import { Plus, X, Settings as SettingsIcon, Trash2, Check, Cloud, Download, Upload, FileJson } from 'lucide-react';
import { AppConfig, Order, OrderItem } from '../types';

interface ListManagerProps {
  title: string;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
}

const ListManager: React.FC<ListManagerProps> = ({ 
  title, 
  items, 
  onAdd, 
  onRemove 
}) => {
  const [newItem, setNewItem] = useState('');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim() && !items.includes(newItem.trim())) {
      onAdd(newItem.trim());
      setNewItem('');
    }
  };

  const confirmDelete = (item: string) => {
    onRemove(item);
    setItemToDelete(null);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">{title}</h3>
      
      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 max-h-60">
        <ul className="space-y-2">
          {items.map((item) => (
            <li 
              key={item} 
              className={`flex justify-between items-center px-3 py-2 rounded-lg border transition-all ${
                itemToDelete === item 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-gray-50 border-gray-100 hover:border-blue-200'
              }`}
            >
              {itemToDelete === item ? (
                <div className="flex items-center justify-between w-full animate-fade-in">
                  <span className="text-red-600 font-medium text-sm">تأكيد الحذف؟</span>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => confirmDelete(item)}
                      className="bg-red-500 text-white p-1.5 rounded-md hover:bg-red-600 transition-colors shadow-sm"
                      title="تأكيد الحذف"
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => setItemToDelete(null)}
                      className="bg-white text-gray-600 border border-gray-200 p-1.5 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
                      title="إلغاء"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-gray-700 font-medium select-none truncate ml-2 flex-1" title={item}>{item}</span>
                  <button 
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </li>
          ))}
          {items.length === 0 && (
            <li className="text-center text-gray-500 py-4 text-sm italic">
              القائمة فارغة
            </li>
          )}
        </ul>
      </div>

      {/* Add New */}
      <form onSubmit={handleAdd} className="flex gap-2 pt-2 border-t border-gray-100">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="إضافة جديد..."
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
        />
        <button 
          type="submit"
          disabled={!newItem.trim()}
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[40px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
        </button>
      </form>
    </div>
  );
};

interface SettingsViewProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  orders: Order[];
  orderItems: OrderItem[];
  onImportData: (data: any) => void;
  onExportData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  config, 
  onUpdateConfig,
  onImportData,
  onExportData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateList = (key: keyof AppConfig, newList: string[]) => {
    onUpdateConfig({
      ...config,
      [key]: newList
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.orders && json.items) {
          if (window.confirm('سيتم استبدال جميع البيانات الحالية بالبيانات الموجودة في الملف. هل أنت متأكد؟')) {
            onImportData(json);
          }
        } else {
          alert('ملف غير صالح. تأكد من اختيار ملف النسخة الاحتياطية الصحيح.');
        }
      } catch (error) {
        alert('حدث خطأ أثناء قراءة الملف.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar animate-fade-in pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-slate-800 p-2 rounded-lg text-white">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إعدادات التطبيق</h2>
          <p className="text-gray-500">إدارة البيانات، النسخ الاحتياطي، والربط السحابي (Vercel)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Backup & Restore Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-green-600"></div>
          <div className="flex items-center gap-2 mb-4 text-emerald-700">
            <FileJson size={24} />
            <h3 className="text-lg font-bold">النسخ الاحتياطي اليدوي</h3>
          </div>
          <p className="text-sm text-gray-600 mb-6">
             حفظ البيانات كملف على جهازك للأمان أو لنقلها.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onExportData}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-lg hover:bg-emerald-100 transition-colors font-bold"
            >
              <Download size={20} />
              تحميل نسخة (Export)
            </button>
            <button 
              onClick={handleImportClick}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900 transition-colors font-bold shadow-lg shadow-gray-200"
            >
              <Upload size={20} />
              استعادة نسخة (Import)
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".json" 
              className="hidden" 
            />
          </div>
        </div>

        {/* Vercel KV Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <div className="flex items-center gap-2 mb-4 text-blue-800">
            <Cloud size={24} />
            <h3 className="text-lg font-bold">Vercel KV Storage</h3>
          </div>
          <p className="text-sm text-gray-600 mb-6">
             التطبيق مرتبط الآن بقاعدة بيانات Vercel KV الداخلية. يتم حفظ البيانات تلقائياً.
          </p>
          
          <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-100">
            <div className="flex items-center gap-2 font-bold mb-2">
               <Check size={16} /> حالة النظام:
            </div>
            يتم الاتصال بقاعدة البيانات تلقائياً عند وجود اتصال بالإنترنت. في حالة انقطاع الإنترنت، يتم الحفظ محلياً ثم المزامنة لاحقاً.
          </div>
        </div>
      </div>

      {/* Lists Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <ListManager 
          title="أنواع المنتجات" 
          items={config.productTypes} 
          onAdd={(item) => updateList('productTypes', [...config.productTypes, item])}
          onRemove={(item) => updateList('productTypes', config.productTypes.filter(i => i !== item))}
        />

        <ListManager 
          title="المقاسات المتاحة" 
          items={config.productSizes} 
          onAdd={(item) => updateList('productSizes', [...config.productSizes, item])}
          onRemove={(item) => updateList('productSizes', config.productSizes.filter(i => i !== item))}
        />

        <ListManager 
          title="مصادر الأوردر" 
          items={config.sources} 
          onAdd={(item) => updateList('sources', [...config.sources, item])}
          onRemove={(item) => updateList('sources', config.sources.filter(i => i !== item))}
        />

        <ListManager 
          title="حالات الأوردر" 
          items={config.statuses} 
          onAdd={(item) => updateList('statuses', [...config.statuses, item])}
          onRemove={(item) => updateList('statuses', config.statuses.filter(i => i !== item))}
        />
      </div>
    </div>
  );
};