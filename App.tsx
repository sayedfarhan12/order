import React, { useState, useEffect } from 'react';
import { LayoutDashboard, List, PlusCircle, Menu, X, Shirt, Settings as SettingsIcon } from 'lucide-react';
import { INITIAL_ORDERS, INITIAL_ORDER_ITEMS } from './constants';
import { Order, OrderItem, NewOrderForm, AppConfig, OrderStatus, OrderSource, ProductType, ProductSize } from './types';
import { Dashboard } from './components/Dashboard';
import { OrdersView } from './components/OrdersView';
import { OrderForm } from './components/OrderForm';
import { SettingsView } from './components/SettingsView';

// Simple Router enum
enum Route {
  DASHBOARD = 'dashboard',
  ORDERS = 'orders',
  NEW_ORDER = 'new-order',
  SETTINGS = 'settings'
}

function App() {
  const [activeRoute, setActiveRoute] = useState<Route>(Route.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Database State (Simulated)
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(INITIAL_ORDER_ITEMS);

  // Configuration State (Settings)
  const [appConfig, setAppConfig] = useState<AppConfig>({
    statuses: Object.values(OrderStatus),
    sources: Object.values(OrderSource),
    productTypes: Object.values(ProductType),
    productSizes: Object.values(ProductSize)
  });

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<NewOrderForm | undefined>(undefined);

  // Load from local storage on mount (optional simulation)
  useEffect(() => {
    // In a real app, we would fetch data here
  }, []);

  const handleSaveOrder = (formData: NewOrderForm) => {
    if (editingId) {
       // Update existing order
       setOrders(prev => prev.map(o => o.id === editingId ? {
         ...o,
         customerName: formData.customerName,
         phone: formData.phone,
         address: formData.address,
         source: formData.source,
         status: formData.status,
         notes: formData.notes
       } : o));

       // Remove old items and add new ones (simulating full update)
       const keptItems = orderItems.filter(item => item.orderId !== editingId.toString());
       const newItems: OrderItem[] = formData.items.map((item, idx) => ({
        ...item,
        id: `item-${editingId}-${Date.now()}-${idx}`,
        orderId: editingId.toString()
       }));
       
       setOrderItems([...keptItems, ...newItems]);
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
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleDeleteOrder = (id: number) => {
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

  const NavItem = ({ route, icon: Icon, label }: { route: Route, icon: any, label: string }) => (
    <button
      onClick={() => {
        setActiveRoute(route);
        // Reset edit state when switching manually
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
          <NavItem route={Route.SETTINGS} icon={SettingsIcon} label="الإعدادات" />
        </nav>

        <div className="absolute bottom-0 w-full p-6 text-center text-xs text-gray-400">
          إصدار 1.2.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between md:justify-end">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-200">
              S
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">Sayed Farhan</span>
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
          {activeRoute === Route.SETTINGS && (
            <SettingsView 
              config={appConfig}
              onUpdateConfig={setAppConfig}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;