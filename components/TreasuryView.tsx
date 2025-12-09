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
  
  // Form State
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

  // Sort transactions by date descending
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 h-full flex flex-col overflow-hidden animate-fade-in bg-slate-50">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="text-blue-600" size={24} />
          <span>الخزينة</span>
        </h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-bold shadow-sm text-sm md:text-base"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">تسجيل بند جديد</span>
          <span className="inline sm:hidden">جديد</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 flex-shrink-0">
        {/* Balance */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-gray-500 font-medium mb-1">الرصيد الحالي</p>
            <p className={`text-2xl md:text-3xl font-bold font-mono ${stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {stats.balance.toLocaleString()} <span className="text-sm">ج.م</span>
            </p>
          </div>
          <div className={`p-2 md:p-3 rounded-full ${stats.balance >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
            <Wallet size={28} />
          </div>
        </div>

        {/* Income */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-gray-500 font-medium mb-1">إجمالي الوارد (بيع)</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-600 font-mono">
              +{stats.totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="p-2 md:p-3 bg-emerald-50 rounded-full text-emerald-600">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Expense */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-gray-500 font-medium mb-1">إجمالي الصادر (شراء)</p>
            <p className="text-xl md:text-2xl font-bold text-red-600 font-mono">
              -{stats.totalExpense.toLocaleString()}
            </p>
          </div>
          <div className="p-2 md:p-3 bg-red-50 rounded-full text-red-600">
            <TrendingDown size={24} />
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">
                {editingId ? 'تعديل بند' : 'تسجيل حركة جديدة'}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'income'})}
                  className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    formData.type === 'income' 
                      ? 'bg-emerald-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ArrowUpCircle size={16} />
                  وارد
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'expense'})}
                  className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    formData.type === 'expense' 
                      ? 'bg-red-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ArrowDownCircle size={16} />
                  صادر
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (ج.م)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-left font-mono"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="مثال: فاتورة كهرباء..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                <input
                  type="date"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  حفظ العملية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center">
             <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4 shadow-sm">
                <AlertTriangle size={32} />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">تأكيد الحذف</h3>
             <p className="text-gray-600 mb-6 text-sm">
                هل أنت متأكد من حذف هذا البند من الخزينة؟
             </p>
             <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteConfirmationId(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors shadow-md shadow-red-200"
                >
                  حذف
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="flex-1 bg-white/50 md:bg-white rounded-xl md:shadow-sm md:border md:border-gray-200 overflow-hidden flex flex-col min-h-0">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center hidden md:flex">
          <h3 className="font-bold text-gray-700">سجل المعاملات</h3>
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
            {transactions.length} عملية
          </span>
        </div>
        
        <div className="overflow-y-auto custom-scrollbar flex-1">
          {sortedTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
              <Wallet size={48} className="mb-4 opacity-50" />
              <p>لا توجد معاملات مسجلة بعد</p>
            </div>
          ) : (
            <>
              {/* Desktop View: Table */}
              <table className="w-full text-sm text-right hidden md:table">
                <thead className="bg-gray-50 text-gray-600 font-medium sticky top-0 shadow-sm z-10">
                  <tr>
                    <th className="px-6 py-3">النوع</th>
                    <th className="px-6 py-3">الوصف</th>
                    <th className="px-6 py-3 text-center">التاريخ</th>
                    <th className="px-6 py-3 text-left">المبلغ</th>
                    <th className="px-6 py-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {sortedTransactions.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.type === 'income' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.type === 'income' ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                          {item.type === 'income' ? 'وارد' : 'صادر'}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-800">{item.description}</td>
                      <td className="px-6 py-3 text-center text-gray-500 font-mono text-xs">
                        {item.date}
                      </td>
                      <td className={`px-6 py-3 text-left font-mono font-bold text-base ${
                        item.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {item.type === 'expense' ? '-' : '+'}{item.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="تعديل"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(item.id);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile View: Cards */}
              <div className="md:hidden space-y-3 pb-20">
                {sortedTransactions.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                     <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2">
                          <span className={`p-1.5 rounded-full ${
                            item.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {item.type === 'income' ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                          </span>
                          <div>
                            <h4 className="font-bold text-gray-800 text-sm">{item.description}</h4>
                            <span className="text-xs text-gray-500 block">{item.date}</span>
                          </div>
                       </div>
                       <div className={`font-mono font-bold text-lg ${
                          item.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {item.type === 'expense' ? '-' : '+'}{item.amount.toLocaleString()}
                       </div>
                     </div>
                     
                     <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-50">
                        <button
                          onClick={() => handleEdit(item)}
                          className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg"
                        >
                          <Edit2 size={14} /> تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg"
                        >
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