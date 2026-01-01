import React, { useState, useEffect } from 'react';
import { LayoutDashboard, List, PlusCircle, Menu, X, Shirt, Settings as SettingsIcon, Loader2, Cloud, Download, CloudOff, AlertCircle, RefreshCcw, Wallet, Factory } from 'lucide-react';
import { INITIAL_ORDERS, INITIAL_ORDER_ITEMS, INITIAL_TRANSACTIONS } from './constants';
import { Order, OrderItem, NewOrderForm, AppConfig, OrderStatus, OrderSource, ProductType, ProductSize, Transaction, FactoryOrder } from './types';
import { Dashboard } from './components/Dashboard';
import { OrdersView } from './components/OrdersView';
import { OrderForm } from './components/OrderForm';
import { SettingsView } from './components/SettingsView';
import { TreasuryView } from './components/TreasuryView';
import { FactoryOrdersView } from './components/FactoryOrdersView';
import { CloudService } from './api';

enum Route {
  DASHBOARD = 'dashboard',
  ORDERS = 'orders',
  NEW_ORDER = 'new-order',
  TREASURY = 'treasury',
  FACTORY = 'factory',
  SETTINGS = 'settings'
}

const STORAGE_KEYS = {
  ORDERS: 'happy_store_orders',
  ITEMS: 'happy_store_items',
  CONFIG: 'happy_store_config',
  TRANSACTIONS: 'happy_store_transactions',
  FACTORY: 'happy_store_factory_v2'
};

type ConnectionStatus = 'loading' | 'connected' | 'local' | 'error' | 'syncing';

function App() {
  const [activeRoute, setActiveRoute] = useState<Route>(Route.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return saved ? JSON.parse(saved) : {
        statuses: Object.values(OrderStatus),
        sources: Object.values(OrderSource),
        productTypes: Object.values(ProductType),
        productSizes: Object.values(ProductSize)
      };
    } catch (e) {
      return {
        statuses: Object.values(OrderStatus),
        sources: Object.values(OrderSource),
        productTypes: Object.values(ProductType),
        productSizes: Object.values(ProductSize)
      };
    }
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [factoryOrders, setFactoryOrders] = useState<FactoryOrder[]>([]);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
        const savedItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
        const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        const savedFactory = localStorage.getItem(STORAGE_KEYS.FACTORY);
        
        if (savedOrders) setOrders(JSON.parse(savedOrders));
        else setOrders(INITIAL_ORDERS);
        
        if (savedItems) setOrderItems(JSON.parse(savedItems));
        else setOrderItems(INITIAL_ORDER_ITEMS);

        if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
        else setTransactions(INITIAL_TRANSACTIONS);

        if (savedFactory) setFactoryOrders(JSON.parse(savedFactory));
      } catch (e) {
        console.error("Local load error", e);
      }

      const result = await CloudService.fetchData();
      
      if (result.status === 'connected' && result.data) {
        if (result.data.orders) setOrders(result.data.orders);
        if (result.data.items) setOrderItems(result.data.items);
        if (result.data.config) setAppConfig(result.data.config);
        if (result.data.transactions) setTransactions(result.data.transactions);
        if (result.data.factoryOrders) setFactoryOrders(result.data.factoryOrders);
        
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(result.data.orders || []));
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(result.data.items || []));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(result.data.transactions || []));
        localStorage.setItem(STORAGE_KEYS.FACTORY, JSON.stringify(result.data.factoryOrders || []));
        if (result.data.config) localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(result.data.config));
        
        setConnectionStatus('connected');
        setErrorMessage("");
      } else if (result.status === 'local') {
        setConnectionStatus('local');
      } else {
        setConnectionStatus('error');
        setErrorMessage("فشل الاتصال");
      }
      setLoading(false);
    };
    initData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(orderItems));
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(appConfig));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
        localStorage.setItem(STORAGE_KEYS.FACTORY, JSON.stringify(factoryOrders));

        if (connectionStatus !== 'local' && connectionStatus !== 'loading') {
            try {
                await CloudService.saveData(orders, orderItems, appConfig, transactions, factoryOrders);
                setConnectionStatus('connected');
                setErrorMessage("");
            } catch (e: any) {
                if (e.message !== 'Local Mode') {
                   setConnectionStatus('error');
                   setErrorMessage("فشل الحفظ التلقائي");
                }
            }
        }
    };
    const timeout = setTimeout(saveData, 2000);
    return () => clearTimeout(timeout);
  }, [orders, orderItems, appConfig, transactions, factoryOrders, connectionStatus]);

  const handleForceSync = async () => {
    setLoading(true);
    try {
      await CloudService.saveData(orders, orderItems, appConfig, transactions, factoryOrders);
      setConnectionStatus('connected');
      setErrorMessage("");
      alert('تمت المزامنة بنجاح!');
    } catch (e: any) {
      alert(`فشل المزامنة: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<NewOrderForm | undefined>(undefined);

  const handleExportData = () => {
    const data = { version: "1.7", timestamp: new Date().toISOString(), orders, items: orderItems, config: appConfig, transactions, factoryOrders };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `happy-store-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportData = async (data: any) => {
    setLoading(true);
    try {
      if (data.orders) setOrders(data.orders);
      if (data.items) setOrderItems(data.items);
      if (data.config) setAppConfig(data.config);
      if (data.transactions) setTransactions(data.transactions);
      if (data.factoryOrders) setFactoryOrders(data.factoryOrders);
      alert('تم استعادة البيانات بنجاح!');
      setActiveRoute(Route.DASHBOARD);
    } catch (error) {
      alert("حدث خطأ أثناء الاستعادة");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrder = async (formData: NewOrderForm) => {
    setLoading(true);
    if (editingId) {
      const updatedOrder = { ...orders.find(o => o.id === editingId)!, ...formData };
      const newItems = formData.items.map((item, idx) => ({ ...item, id: `item-${editingId}-${Date.now()}-${idx}`, orderId: editingId.toString() }));
      setOrders(prev => prev.map(o => o.id === editingId ? (updatedOrder as Order) : o));
      setOrderItems([...orderItems.filter(item => item.orderId !== editingId.toString()), ...newItems]);
      setEditingId(null);
    } else {
      const newOrderId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1001;
      const newOrder = { id: newOrderId, ...formData, createdAt: new Date().toISOString() };
      const newItems = formData.items.map((item, idx) => ({ ...item, id: `item-${newOrderId}-${idx}`, orderId: newOrderId.toString() }));
      setOrders([newOrder as Order, ...orders]);
      setOrderItems([...orderItems, ...newItems]);
    }
    setActiveRoute(Route.ORDERS);
    setLoading(false);
  };

  const handleStatusChange = (id: number, newStatus: string) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  
  // FIX: Removed the redundant window.confirm as the UI handles it
  const handleDeleteOrder = (id: number) => { 
    setOrders(prev => prev.filter(o => o.id !== id)); 
    setOrderItems(prev => prev.filter(item => item.orderId !== id.toString())); 
  };

  const handleEditOrder = (order: Order) => {
    const items = orderItems.filter(item => item.orderId === order.id.toString());
    setEditFormData({ ...order, items });
    setEditingId(order.id);
    setActiveRoute(Route.NEW_ORDER);
  };

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const NavItem = ({ route, icon: Icon, label }: { route: Route, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveRoute(route); if (route === Route.NEW_ORDER && editingId) { setEditingId(null); setEditFormData(undefined); } setIsSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${activeRoute === route ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed md:static inset-y-0 right-0 z-30 w-64 bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700">
            <div className="p-2 bg-blue-100 rounded-lg"><Shirt size={24} /></div>
            <h1 className="text-xl font-bold">Happy Store</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500"><X size={24} /></button>
        </div>
        <nav className="px-4 space-y-2 mt-4">
          <NavItem route={Route.DASHBOARD} icon={LayoutDashboard} label="لوحة التحكم" />
          <NavItem route={Route.ORDERS} icon={List} label="الأوردرات" />
          <NavItem route={Route.FACTORY} icon={Factory} label="طلبيات المصنع" />
          <NavItem route={Route.NEW_ORDER} icon={PlusCircle} label={editingId ? "تعديل أوردر" : "إضافة أوردر"} />
          <NavItem route={Route.TREASURY} icon={Wallet} label="الخزينة" />
          <NavItem route={Route.SETTINGS} icon={SettingsIcon} label="الإعدادات" />
        </nav>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {loading && <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm"><div className="bg-white p-4 rounded-xl shadow-xl flex items-center gap-3"><Loader2 className="animate-spin text-blue-600" size={24} /><span className="font-bold text-gray-700">جاري المعالجة...</span></div></div>}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between md:justify-end">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-lg"><Menu size={24} /></button>
          <div className="flex items-center gap-4">
            <button onClick={handleForceSync} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><RefreshCcw size={18} /></button>
            <button onClick={handleExportData} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors border border-gray-300"><Download size={14} /><span className="hidden sm:inline">نسخة احتياطية</span></button>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-200">S</div>
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-slate-50">
          {activeRoute === Route.DASHBOARD && <Dashboard orders={orders} orderItems={orderItems} factoryOrders={factoryOrders} />}
          {activeRoute === Route.ORDERS && <OrdersView orders={orders} orderItems={orderItems} onStatusChange={handleStatusChange} onEditOrder={handleEditOrder} onDeleteOrder={handleDeleteOrder} statuses={appConfig.statuses} />}
          {activeRoute === Route.FACTORY && <FactoryOrdersView orders={factoryOrders} onUpdate={setFactoryOrders} config={appConfig} />}
          {activeRoute === Route.NEW_ORDER && <OrderForm onSubmit={handleSaveOrder} initialData={editFormData} isEditing={!!editingId} config={appConfig} />}
          {activeRoute === Route.TREASURY && <TreasuryView transactions={transactions} onAddTransaction={handleAddTransaction} onUpdateTransaction={handleUpdateTransaction} onDeleteTransaction={handleDeleteTransaction} />}
          {activeRoute === Route.SETTINGS && <SettingsView config={appConfig} onUpdateConfig={setAppConfig} orders={orders} orderItems={orderItems} onImportData={handleImportData} onExportData={handleExportData} />}
        </div>
      </main>
    </div>
  );
}
export default App;