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
    // 1. Sales and Real Profit
    const validOrders = orders.filter(o => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.RETURNED);
    
    let totalSalesAmount = 0;
    let totalCostAmount = 0;

    validOrders.forEach(order => {
        const items = orderItems.filter(item => item.orderId === order.id.toString());
        items.forEach(item => {
            totalSalesAmount += (item.price * item.quantity);
            totalCostAmount += ((item.costPrice || 0) * item.quantity);
        });
    });

    const realProfitFromSales = totalSalesAmount - totalCostAmount;

    // Categories safeguard
    const categories = config?.transactionCategories || [];

    // 2. Treasury Analysis (Income vs Expense)
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const incomeByCategory = categories.map(cat => {
        const amount = incomeTransactions
            .filter(t => t.category === cat)
            .reduce((sum, t) => sum + t.amount, 0);
        const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
        return { name: cat, amount, percentage };
    }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const expenseByCategory = categories.map(cat => {
        const amount = expenseTransactions
            .filter(t => t.category === cat)
            .reduce((sum, t) => sum + t.amount, 0);
        const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
        return { name: cat, amount, percentage };
    }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

    return {
      totalOrdersCount: orders.length,
      totalSalesAmount,
      totalCostAmount,
      realProfitFromSales,
      totalIncome,
      totalExpense,
      netTreasuryBalance: totalIncome - totalExpense,
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
      <div className={`p-3 rounded-2xl ${colorClass.replace('text-', 'bg-').replace('600', '50').replace('emerald', 'emerald').replace('indigo', 'indigo').replace('blue', 'blue')}`}>
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
          <div className="text-center py-6 flex flex-col items-center gap-2">
            <Tag size={32} className="text-gray-200" />
            <p className="text-gray-400 text-xs font-bold">لا توجد بيانات مسجلة لهذا التصنيف</p>
          </div>
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
              <p className="text-[10px] text-gray-400 text-left font-bold">{item.percentage.toFixed(1)}%</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 h-full overflow-y-auto custom-scrollbar animate-fade-in bg-slate-50 pb-24">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm">
          <BarChart3 size={24} />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">إجماليات المتجر</h2>
          <p className="text-xs text-gray-500 font-medium">تحليل شامل للمبيعات، الأرباح، والخزينة</p>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="الربح الفعلي للمبيعات" 
          value={`${analytics.realProfitFromSales.toLocaleString()} ج.م`} 
          icon={TrendingUp} 
          colorClass="text-emerald-600" 
          subtitle="إجمالي البيع - إجمالي التكلفة"
        />
        <StatCard 
          title="إجمالي المبيعات" 
          value={`${analytics.totalSalesAmount.toLocaleString()} ج.م`} 
          icon={ShoppingBag} 
          colorClass="text-indigo-600" 
          subtitle="الأوردرات غير الملغية"
        />
        <StatCard 
          title="صافي رصيد الخزينة" 
          value={`${analytics.netTreasuryBalance.toLocaleString()} ج.م`} 
          icon={DollarSign} 
          colorClass={analytics.netTreasuryBalance >= 0 ? "text-blue-600" : "text-red-600"} 
          subtitle="إجمالي الوارد - إجمالي الصادر"
        />
        <StatCard 
          title="إجمالي التكاليف" 
          value={`${analytics.totalCostAmount.toLocaleString()} ج.م`} 
          icon={Package} 
          colorClass="text-amber-600" 
          subtitle="تكلفة البضاعة المباعة"
        />
      </div>

      {/* Secondary Details */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">عدد الأوردرات</p>
            <p className="text-xl font-black text-slate-800 font-mono">{analytics.totalOrdersCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">متوسط ربح الأوردر</p>
            <p className="text-xl font-black text-emerald-600 font-mono">
                {analytics.totalOrdersCount > 0 ? (analytics.realProfitFromSales / analytics.totalOrdersCount).toLocaleString(undefined, {maximumFractionDigits:0}) : 0}
            </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">هامش الربح</p>
            <p className="text-xl font-black text-indigo-600 font-mono">
                {analytics.totalSalesAmount > 0 ? ((analytics.realProfitFromSales / analytics.totalSalesAmount) * 100).toFixed(1) : 0}%
            </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">إجمالي المصروفات</p>
            <p className="text-xl font-black text-red-600 font-mono">{analytics.totalExpense.toLocaleString()}</p>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BreakdownList 
          title="واردات الخزينة" 
          data={analytics.incomeByCategory} 
          type="income" 
        />
        <BreakdownList 
          title="مصاريف الخزينة" 
          data={analytics.expenseByCategory} 
          type="expense" 
        />
      </div>

      {/* Profit Note */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-start gap-4">
         <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
            <TrendingUp size={24} />
         </div>
         <div>
            <h4 className="font-black text-emerald-900 mb-1">الربح الصافي النهائي</h4>
            <p className="text-sm text-emerald-800 leading-relaxed font-bold">
                بعد خصم جميع المصاريف المسجلة في الخزينة ({analytics.totalExpense.toLocaleString()} ج.م) من أرباح المبيعات ({analytics.realProfitFromSales.toLocaleString()} ج.م)، 
                يصبح صافي ربح المتجر الفعلي هو <span className="text-indigo-700 underline">{(analytics.realProfitFromSales - analytics.totalExpense).toLocaleString()} ج.م</span>.
            </p>
         </div>
      </div>
    </div>
  );
};