import React, { useState, useEffect } from 'react';
import { LayoutDashboard, List, PlusCircle, Menu, X, Shirt, Settings as SettingsIcon, RefreshCw, Loader2, Cloud, Download, CloudOff, AlertCircle, RefreshCcw, Wallet } from 'lucide-react';
import { INITIAL_ORDERS, INITIAL_ORDER_ITEMS, INITIAL_TRANSACTIONS } from './constants';
import { Order, OrderItem, NewOrderForm, AppConfig, OrderStatus, OrderSource, ProductType, ProductSize, Transaction } from './types';
import { Dashboard } from './components/Dashboard';
import { OrdersView } from './components/OrdersView';
import { OrderForm } from './components/OrderForm';
import { SettingsView } from './components/SettingsView';
import { TreasuryView } from './components/TreasuryView';
import { CloudService } from './api';

// Simple Router enum
enum Route {
  DASHBOARD = 'dashboard',
  ORDERS = 'orders',
  NEW_ORDER = 'new-order',
  TREASURY = 'treasury',
  SETTINGS = 'settings'
}

// Storage Keys
const STORAGE_KEYS = {
  ORDERS: 'happy_store_orders',
  ITEMS: 'happy_store_items',
  CONFIG: 'happy_store_config',
  TRANSACTIONS: 'happy_store_transactions'
};

type ConnectionStatus = 'loading' | 'connected' | 'local' | 'error' | 'syncing';

function App() {
  const [activeRoute, setActiveRoute] = useState<Route>(Route.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // Configuration State
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

  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // 1. Initial Load
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      // Load Local Data First
      try {
        const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
        const savedItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
        const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        
        if (savedOrders) setOrders(JSON.parse(savedOrders));
        else setOrders(INITIAL_ORDERS);
        
        if (savedItems) setOrderItems(JSON.parse(savedItems));
        else setOrderItems(INITIAL_ORDER_ITEMS);

        if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
        else setTransactions(INITIAL_TRANSACTIONS);

      } catch (e) {
        console.error("Local load error", e);
      }

      // Try Cloud Fetch
      const result = await CloudService.fetchData();
      
      if (result.status === 'connected' && result.data) {
        if (result.data.orders) setOrders(result.data.orders);
        if (result.data.items) setOrderItems(result.data.items);
        if (result.data.config) setAppConfig(result.data.config);
        if (result.data.transactions) setTransactions(result.data.transactions);
        
        // Sync to local
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(result.data.orders || []));
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(result.data.items || []));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(result.data.transactions || []));
        if (result.data.config) localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(result.data.config));
        
        setConnectionStatus('connected');
        setErrorMessage("");
      } else if (result.status === 'local') {
        setConnectionStatus('local');
      } else {
        setConnectionStatus('error');
        const errorMsg = result.error && typeof result.error === 'object' && 'message' in result.error 
            ? (result.error as any).message 
            : "فشل الاتصال";
        setErrorMessage(errorMsg);
      }
      
      setLoading(false);
    };

    initData();
  }, []);

  // 2. Persist on changes (Auto-Save)
  useEffect(() => {
    const saveData = async () => {
        // Always Save to Local
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(orderItems));
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(appConfig));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

        // Sync to Cloud
        if (connectionStatus !== 'local' && connectionStatus !== 'loading') {
            try {
                await CloudService.saveData(orders, orderItems, appConfig, transactions);
                setConnectionStatus('connected');
                setErrorMessage("");
            } catch (e: any) {
                if (e.message === 'Local Mode') {
                   setConnectionStatus('local');
                } else {
                   console.warn("Background sync failed");
                   setConnectionStatus('error');
                   setErrorMessage("فشل الحفظ التلقائي");
                }
            }
        }
    };
    
    // Debounce to prevent too many requests
    const timeout = setTimeout(saveData, 2000);
    return () => clearTimeout(timeout);
  }, [orders, orderItems, appConfig, transactions, connectionStatus]);

  // Manual Sync Function
  const handleForceSync = async () => {
    setLoading(true);
    try {
      await CloudService.saveData(orders, orderItems, appConfig, transactions);
      setConnectionStatus('connected');
      setErrorMessage("");
      alert('تم رفع البيانات للسحابة بنجاح! يمكنك الآن فتح التطبيق من جهاز آخر.');
    } catch (e: any) {
      console.error(e);
      setConnectionStatus('error');
      setErrorMessage(e.message || "فشل المزامنة");
      alert(`فشل الاتصال بالسحابة: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<NewOrderForm | undefined>(undefined);

  const handleExportData = () => {
    const data = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      orders,
      items: orderItems,
      config: appConfig,
      transactions
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `happy-store-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = async (data: any) => {
    setLoading(true);
    try {
      if (data.orders) setOrders(data.orders);
      if (data.items) setOrderItems(data.items);
      if (data.config) setAppConfig(data.config);
      if (data.transactions) setTransactions(data.transactions);
      
      // Force Local Save
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data.orders || []));
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(data.items || []));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions || []));
      if(data.config) localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(data.config));

      // Force Cloud Save
      if (connectionStatus !== 'local') {
        try {
          await CloudService.saveData(
            data.orders || [], 
            data.items || [], 
            data.config || appConfig,
            data.transactions || []
          );
          setConnectionStatus('connected');
          setErrorMessage("");
        } catch (e: any) {
          console.warn("Cloud sync failed during import");
          setConnectionStatus('error');
          setErrorMessage("فشل الحفظ بعد الاستيراد");
        }
      }

      alert('تم استعادة البيانات بنجاح!');
      setActiveRoute(Route.DASHBOARD);
    } catch (error) {
      console.error("Import error", error);
      alert("حدث خطأ أثناء استعادة النسخة");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrder = async (formData: NewOrderForm) => {
    setLoading(true);
    try {
      if (editingId) {
        // Update existing order
        const updatedOrder: Order = {
          ...orders.find(o => o.id === editingId)!,
          customerName: formData.customerName,
          phone: formData.phone,
          address: formData.address,
          source: formData.source,
          status: formData.status,
          notes: formData.notes
        };

        const newItems: OrderItem[] = formData.items.map((item, idx) => ({
          ...item,
          id: `item-${editingId}-${Date.now()}-${idx}`,
          orderId: editingId.toString()
        }));

        setOrders(prev => prev.map(o => o.id === editingId ? updatedOrder : o));
        
        // Remove old items for this order and add new ones
        const otherItems = orderItems.filter(item => item.orderId !== editingId.toString());
        setOrderItems([...otherItems, ...newItems]);
        
        alert('تم تحديث الأوردر بنجاح!');
        setEditingId(null);
        setEditFormData(undefined);

      } else {
        // Create new order
        const newOrderId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1001;
        
        const newOrder: Order = {
          id: newOrderId,
          customerName: formData.customerName,
          phone: formData.phone,
          address: formData.address,
          source: formData.source,
          status: formData.status,
          createdAt: new Date().toISOString(),
          notes: formData.notes
        };

        const newItems: OrderItem[] = formData.items.map((item, idx) => ({
          ...item,
          id: `item-${newOrderId}-${idx}`,
          orderId: newOrderId.toString()
        }));

        setOrders([newOrder, ...orders]);
        setOrderItems([...orderItems, ...newItems]);
        
        alert('تم إضافة الأوردر بنجاح!');
      }
      
      setActiveRoute(Route.ORDERS);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleDeleteOrder = (id: number) => {
    if(!window.confirm("هل أنت متأكد من حذف هذا الأوردر؟")) return;
    setOrders(prev => prev.filter(o => o.id !== id));
    setOrderItems(prev => prev.filter(item => item.orderId !== id.toString()));
  };

  const handleEditOrder = (order: Order) => {
    const items = orderItems.filter(item => item.orderId === order.id.toString());
    const formData: NewOrderForm = {
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      source: order.source,
      status: order.status,
      notes: order.notes,
      items: items.map(item => ({
        type: item.type,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      }))
    };
    
    setEditingId(order.id);
    setEditFormData(formData);
    setActiveRoute(Route.NEW_ORDER);
  };

  // Treasury Handlers
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
      onClick={() => {
        setActiveRoute(route);
        if (route === Route.NEW_ORDER && editingId) {
             setEditingId(null);
             setEditFormData(undefined);
        }
        setIsSidebarOpen(false); 
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium
        ${activeRoute === route 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-600 hover:bg-slate-100'}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  const StatusBadge = () => {
    if (connectionStatus === 'connected') {
      return (
        <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border bg-green-50 text-green-700 border-green-200" title="تم الربط بنجاح بقاعدة بيانات Vercel">
           <Cloud size={14} />
           <span className="hidden sm:inline">متصل بالسحابة</span>
        </div>
      );
    }
    if (connectionStatus === 'error') {
      return (
        <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border bg-red-50 text-red-700 border-red-200 animate-pulse cursor-pointer" onClick={() => alert(errorMessage || 'تأكد من إعدادات مشروع Vercel وربط KV Database')} title={errorMessage || "يوجد مشكلة في الاتصال"}>
           <AlertCircle size={14} />
           <span className="hidden sm:inline">{errorMessage ? `خطأ: ${errorMessage}` : 'خطأ اتصال'}</span>
        </div>
      );
    }
    // Local
    return (
      <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border bg-orange-50 text-orange-700 border-orange-200" title="أنت تعمل في بيئة محلية. البيانات محفوظة على هذا الجهاز فقط">
         <CloudOff size={14} />
         <span className="hidden sm:inline">وضع محلي (جهازك)</span>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 right-0 z-30 w-64 bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shirt size={24} />
            </div>
            <h1 className="text-xl font-bold">Happy Store</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <nav className="px-4 space-y-2 mt-4">
          <NavItem route={Route.DASHBOARD} icon={LayoutDashboard} label="لوحة التحكم" />
          <NavItem route={Route.ORDERS} icon={List} label="الأوردرات" />
          <NavItem route={Route.NEW_ORDER} icon={PlusCircle} label={editingId ? "تعديل أوردر" : "إضافة أوردر"} />
          <NavItem route={Route.TREASURY} icon={Wallet} label="الخزينة" />
          <NavItem route={Route.SETTINGS} icon={SettingsIcon} label="الإعدادات" />
        </nav>

        <div className="absolute bottom-0 w-full p-6 text-center text-xs text-gray-400">
          إصدار 2.6 (Treasury Added)
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm">
             <div className="bg-white p-4 rounded-xl shadow-xl flex items-center gap-3">
               <Loader2 className="animate-spin text-blue-600" size={24} />
               <span className="font-bold text-gray-700">جاري المعالجة...</span>
             </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between md:justify-end">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4">
            
            {/* Force Sync Button */}
            <button 
              onClick={handleForceSync}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="مزامنة يدوية مع السحابة"
            >
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Quick Export Button */}
            <button 
              onClick={handleExportData}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors border border-gray-300"
              title="تنزيل نسخة احتياطية الآن"
            >
              <Download size={14} />
              <span className="hidden sm:inline">نسخة احتياطية</span>
            </button>

            <StatusBadge />

            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-200">
              S
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50">
          {activeRoute === Route.DASHBOARD && <Dashboard orders={orders} orderItems={orderItems} />}
          {activeRoute === Route.ORDERS && (
            <OrdersView 
              orders={orders} 
              orderItems={orderItems} 
              onStatusChange={handleStatusChange}
              onEditOrder={handleEditOrder}
              onDeleteOrder={handleDeleteOrder}
              statuses={appConfig.statuses}
            />
          )}
          {activeRoute === Route.NEW_ORDER && (
            <OrderForm 
              onSubmit={handleSaveOrder} 
              initialData={editFormData}
              isEditing={!!editingId}
              config={appConfig}
            />
          )}
          {activeRoute === Route.TREASURY && (
            <TreasuryView 
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}
          {activeRoute === Route.SETTINGS && (
            <SettingsView 
              config={appConfig}
              onUpdateConfig={setAppConfig}
              orders={orders}
              orderItems={orderItems}
              onImportData={handleImportData}
              onExportData={handleExportData}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;