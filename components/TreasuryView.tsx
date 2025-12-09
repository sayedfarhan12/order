import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Plus, Trash2, Edit2, Calendar, TrendingUp, TrendingDown, Save, X } from 'lucide-react';

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

  // Sort transactions by date descending
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="p-6 space-y-6 h-full flex flex-col overflow-hidden animate-fade-in">
      <div className="flex justify-between items-center mb-2 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="text-blue-600" />
          الخزينة (Treasury)
        </h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-bold shadow-sm"
        >
          <Plus size={20} />
          تسجيل بند جديد
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">الرصيد الحالي</p>
            <p className={`text-3xl font-bold font-mono ${stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {stats.balance.toLocaleString()} ج.م
            </p>
          </div>
          <div className={`p-3 rounded-full ${stats.balance >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
            <Wallet size={28} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">إجمالي الوارد (بيع)</p>
            <p className="text-2xl font-bold text-emerald-600 font-mono">
              +{stats.totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">إجمالي الصادر (شراء)</p>
            <p className="text-2xl font-bold text-red-600 font-mono">
              -{stats.totalExpense.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-full text-red-600">
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
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  وارد (بيع)
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
                  صادر (شراء/مصروفات)
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
                  placeholder="مثال: فاتورة كهرباء، بيع مباشر..."
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

      {/* Transactions Table */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-0">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
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
            <table className="w-full text-sm text-right">
              <thead className="bg-gray-50 text-gray-600 font-medium sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="px-6 py-3">النوع</th>
                  <th className="px-6 py-3">الوصف</th>
                  <th className="px-6 py-3 text-center">التاريخ</th>
                  <th className="px-6 py-3 text-left">المبلغ</th>
                  <th className="px-6 py-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
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
                            if(window.confirm('هل أنت متأكد من حذف هذا البند؟')) {
                              onDeleteTransaction(item.id);
                              if (editingId === item.id) {
                                resetForm();
                              }
                            }
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
          )}
        </div>
      </div>
    </div>
  );
};