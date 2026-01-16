import React, { useMemo } from 'react';
import { Transaction, Order, OrderItem, AppConfig, OrderStatus } from '../types';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package, ShoppingBag, PieChart, Tag, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface TotalsViewProps {
  transactions: Transaction[];
  orders: Order[];
  orderItems: OrderItem[];
  config: AppConfig;
}

export const TotalsView: React.FC<TotalsViewProps> = ({ transactions, orders, orderItems, config }) => {
  
  const analytics = useMemo(() => {
    // 1. Basic Order Stats
    const totalOrdersCount = orders.length;
    
    const calculateOrderTotal = (orderId: number) => {
      return orderItems
        .filter(item => item.orderId === orderId.toString())
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const totalSalesAmount = orders
      .filter(o => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.RETURNED)
      .reduce((sum, order) => sum + calculateOrderTotal(order.id), 0);

    // 2. Income Breakdown
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const incomeByCategory = config.transactionCategories.map(cat => {
        const amount = incomeTransactions
            .filter(t => t.category === cat)
            .reduce((sum, t) => sum + t.amount, 0);
        const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
        return { name: cat, amount, percentage };
    }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

    // 3. Expense Breakdown
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const expenseByCategory = config.transactionCategories.map(cat => {
        const amount = expenseTransactions
            .filter(t => t.category === cat)
            .reduce((sum, t) => sum + t.amount, 0);
        const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
        return { name: cat, amount, percentage };
    }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

    return {
      totalOrdersCount,
      totalSalesAmount,
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      incomeByCategory,
      expenseByCategory
    };
  }, [transactions, orders, orderItems, config]);

  const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 font-bold mb-1">{title}</p>
        <p className={`text-2xl font-black font-mono ${colorClass}`}>{value}</p>
        {subtitle && <p className="text-[10px] text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-2xl ${colorClass.replace('text-', 'bg-').replace('600', '50')}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  const BreakdownList = ({ title, data, type }: { title: string, data: any[], type: 'income' | 'expense' }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-50 flex items-center gap-2 bg-slate-50">
        {type === 'income' ? <ArrowUpCircle size={18} className="text-emerald-600" /> : <ArrowDownCircle size={18} className="text-red-600" />}
        <h3 className="font-black text-slate-800">{title}</h3>
      </div>
      <div className="p-4 space-y-4">
        {data.length === 0 ? (
          <p className="text-center py-6 text-gray-400 text-sm">لا توجد بيانات مسجلة</p>
        ) : (
          data.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">{item.name}</span>
                <span className={type === 'income' ? 'text-emerald-600' : 'text-red-600'}>
                  {item.amount.toLocaleString()} ج.م
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-gray-400 text-left">{item.percentage.toFixed(1)}%</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 h-full overflow-y-auto custom-scrollbar animate-fade-in bg-slate-50 pb-20">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm">
          <BarChart3 size={24} />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">إجماليات المتجر</h2>
          <p className="text-xs text-gray-500 font-medium">تحليل شامل للمبيعات، الإيرادات، والمصروفات</p>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="صافي رصيد الخزينة" 
          value={`${analytics.netProfit.toLocaleString()} ج.م`} 
          icon={DollarSign} 
          colorClass={analytics.netProfit >= 0 ? "text-blue-600" : "text-red-600"} 
          subtitle="إجمالي الوارد - إجمالي الصادر"
        />
        <StatCard 
          title="إجمالي المبيعات" 
          value={`${analytics.totalSalesAmount.toLocaleString()} ج.م`} 
          icon={ShoppingBag} 
          colorClass="text-indigo-600" 
          subtitle="الأوردرات غير الملغية"
        />
        <StatCard 
          title="إجمالي الوارد" 
          value={`${analytics.totalIncome.toLocaleString()} ج.م`} 
          icon={TrendingUp} 
          colorClass="text-emerald-600" 
        />
        <StatCard 
          title="إجمالي الصادر" 
          value={`${analytics.totalExpense.toLocaleString()} ج.م`} 
          icon={TrendingDown} 
          colorClass="text-red-600" 
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">عدد الأوردرات</p>
            <p className="text-xl font-black text-slate-800 font-mono">{analytics.totalOrdersCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">متوسط قيمة الأوردر</p>
            <p className="text-xl font-black text-indigo-600 font-mono">
                {analytics.totalOrdersCount > 0 ? (analytics.totalSalesAmount / analytics.totalOrdersCount).toLocaleString(undefined, {maximumFractionDigits:0}) : 0}
            </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">عدد حركات الخزينة</p>
            <p className="text-xl font-black text-slate-800 font-mono">{transactions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">الأرباح التقديرية</p>
            <p className="text-xl font-black text-emerald-600 font-mono">{(analytics.totalSalesAmount * 0.3).toLocaleString(undefined, {maximumFractionDigits:0})}</p>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BreakdownList 
          title="تحليل الوارد حسب التصنيف" 
          data={analytics.incomeByCategory} 
          type="income" 
        />
        <BreakdownList 
          title="تحليل الصادر حسب التصنيف" 
          data={analytics.expenseByCategory} 
          type="expense" 
        />
      </div>

      {/* Summary Note */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
         <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <PieChart size={24} />
         </div>
         <div>
            <h4 className="font-black text-blue-900 mb-1">ملخص الأداء</h4>
            <p className="text-sm text-blue-800 leading-relaxed font-medium">
                تمثل المبيعات {analytics.incomeByCategory.find(i => i.name === 'مبيعات')?.percentage.toFixed(1) || 0}% من إجمالي واردات الخزينة. 
                أكبر بند للمصروفات حالياً هو <span className="font-black">{analytics.expenseByCategory[0]?.name || 'غير محدد'}</span> بمبلغ {analytics.expenseByCategory[0]?.amount.toLocaleString() || 0} ج.م.
            </p>
         </div>
      </div>
    </div>
  );
};