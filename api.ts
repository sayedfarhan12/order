import { Order, OrderItem, AppConfig, Transaction } from './types';

export interface ApiResponse {
  status: 'connected' | 'local' | 'error';
  data: {
    orders?: Order[];
    items?: OrderItem[];
    config?: AppConfig;
    transactions?: Transaction[];
  } | null;
  error: any | null;
}

export const CloudService = {
  async fetchData(): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/db');
      
      const isVercel = window.location.hostname.includes('vercel.app');

      // Handle 404:
      // If on Vercel/Production, 404 means the API route is broken/missing -> Error
      // If on Localhost, 404 means we are just developing locally -> Local Mode
      if (response.status === 404 || response.headers.get('content-type')?.includes('text/html')) {
        if (isVercel) {
          console.error("API Route not found on Vercel. Check vercel.json");
          throw new Error("Configuration Error: API Route Not Found");
        }
        return { status: 'local', data: null, error: null };
      }

      if (!response.ok) {
        throw new Error(`Cloud Error: ${response.status}`);
      }

      const data = await response.json();
      return { status: 'connected', data, error: null };
    } catch (error) {
      console.warn("Cloud fetch failed:", error);
      return { status: 'error', data: null, error };
    }
  },

  async saveData(orders: Order[], items: OrderItem[], config: AppConfig, transactions: Transaction[]) {
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orders, items, config, transactions })
      });

      if (response.status === 404) {
         const isVercel = window.location.hostname.includes('vercel.app');
         if (isVercel) throw new Error('API Route Missing');
         throw new Error('Local Mode');
      }
      
      if (!response.ok) throw new Error('Failed to save to Vercel Cloud');
      
      return await response.json();
    } catch (error) {
      console.error("Cloud save failed:", error);
      throw error;
    }
  }
};