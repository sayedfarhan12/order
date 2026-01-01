import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Plus, Trash2, Edit2, TrendingUp, TrendingDown, Save, X, AlertTriangle } from 'lucide-react';

interface TreasuryViewProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Transaction) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TreasuryView: React.FC<TreasuryViewProps> = ({ 
  transactions, 
  onAddTransaction, 
  onUpdateTransaction,
  onDeleteTransaction 
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<{
    type: 'income' | 'expense';
    amount: string;
    description: string;
    date: string;
  }>({
    type: 'income',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  }, [transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    const transactionData: Transaction = {
      id: editingId || `tr-${Date.now()}`,
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date
    };

    if (editingId) {
      onUpdateTransaction(transactionData);
    } else {
      onAddTransaction(transactionData);
    }

    resetForm();
  };

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      date: transaction.date
    });
    setEditingId(transaction.id);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'income',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmationId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmationId) {
      onDeleteTransaction(deleteConfirmationId);
      if (editingId === deleteConfirmationId) {
        resetForm();
      }
      setDeleteConfirmationId(null);
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 h-full flex flex-col overflow-hidden animate-fade-in bg-slate-50">
      
      <div className="flex justify-between items-center flex-shrink-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="text-blue-600" size={24} />
          <span>الخزينة</span>
        </h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 font-bold shadow-lg shadow-blue-100 text-sm"
        >
          <Plus size={18} />
          <span>بند جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 flex-shrink-0">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold mb-1">الرصيد الحالي</p>
            <p className={`text-2xl md:text-3xl font-black font-mono ${stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {stats.balance.toLocaleString()} <span className="text-sm">ج.م</span>
            </p>
          </div>
          <div className={`p-2 md:p-3 rounded-full ${stats.balance >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
            <Wallet size={28} />
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold mb-1">إجمالي الوارد</p>
            <p className="text-xl md:text-2xl font-black text-emerald-600 font-mono">
              +{stats.totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="p-2 md:p-3 bg-emerald-50 rounded-full text-emerald-600">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold mb-1">إجمالي الصادر</p>
            <p className="text-xl md:text-2xl font-black text-red-600 font-mono">
              -{stats.totalExpense.toLocaleString()}
            </p>
          </div>
          <div className="p-2 md:p-3 bg-red-50 rounded-full text-red-600">
            <TrendingDown size={24} />
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-slate-200">
            <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">
                {editingId ? 'تعديل بند' : 'تسجيل حركة جديدة'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-700 bg-white p-1 rounded-full border">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'income'})}
                  className={`flex-1 py-2 rounded-md text-sm font-black flex items-center justify-center gap-2 transition-all ${
                    formData.type === 'income' 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-slate-200'
                  }`}
                >
                  <ArrowUpCircle size={16} /> وارد
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'expense'})}
                  className={`flex-1 py-2 rounded-md text-sm font-black flex items-center justify-center gap-2 transition-all ${
                    formData.type === 'expense' 
                      ? 'bg-red-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-slate-200'
                  }`}
                >
                  <ArrowDownCircle size={16} /> صادر
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">المبلغ (ج.م)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-left font-black text-black text-lg"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">الوصف</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-bold"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="مثال: فاتورة كهرباء..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">التاريخ</label>
                <input
                  type="date"
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-bold"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                >
                  <Save size={18} /> حفظ العملية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmationId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center">
             <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4 shadow-sm">
                <AlertTriangle size={32} />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">تأكيد الحذف</h3>
             <p className="text-gray-600 mb-6 text-sm font-medium">هل أنت متأكد من حذف هذا البند من الخزينة نهائياً؟</p>
             <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteConfirmationId(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold transition-colors"
                >إلغاء</button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-all shadow-md shadow-red-200"
                >حذف</button>
             </div>
          </div>
        </div>
      )}

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-0">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">سجل المعاملات</h3>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
            {transactions.length} معالجة
          </span>
        </div>
        
        <div className="overflow-y-auto custom-scrollbar flex-1">
          {sortedTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
              <Wallet size={48} className="mb-4 opacity-20" />
              <p>لا توجد معاملات مسجلة بعد</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm text-right hidden md:table">
                <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0 shadow-sm z-10 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">النوع</th>
                    <th className="px-6 py-4">الوصف</th>
                    <th className="px-6 py-4 text-center">التاريخ</th>
                    <th className="px-6 py-4 text-left">المبلغ</th>
                    <th className="px-6 py-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {sortedTransactions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                          item.type === 'income' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {item.type === 'income' ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                          {item.type === 'income' ? 'وارد' : 'صادر'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">{item.description}</td>
                      <td className="px-6 py-4 text-center text-gray-500 font-mono text-xs">{item.date}</td>
                      <td className={`px-6 py-4 text-left font-mono font-black text-base ${
                        item.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {item.type === 'expense' ? '-' : '+'}{item.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteClick(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="md:hidden space-y-3 p-4 bg-gray-50/30 pb-24">
                {sortedTransactions.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                     <div className="flex justify-between items-start mb-3">
                       <div className="flex items-center gap-2">
                          <span className={`p-2 rounded-lg ${
                            item.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {item.type === 'income' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                          </span>
                          <div>
                            <h4 className="font-black text-slate-800 text-sm">{item.description}</h4>
                            <span className="text-[10px] text-gray-400 block font-mono">{item.date}</span>
                          </div>
                       </div>
                       <div className={`font-mono font-black text-lg ${
                          item.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {item.type === 'expense' ? '-' : '+'}{item.amount.toLocaleString()}
                       </div>
                     </div>
                     <div className="flex justify-end gap-2 pt-3 border-t border-gray-50">
                        <button onClick={() => handleEdit(item)} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                          <Edit2 size={14} /> تعديل
                        </button>
                        <button onClick={() => handleDeleteClick(item.id)} className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                          <Trash2 size={14} /> حذف
                        </button>
                     </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};