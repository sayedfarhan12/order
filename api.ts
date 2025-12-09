import { Order, OrderItem, AppConfig } from './types';

export const CloudService = {
  async fetchData() {
    try {
      const response = await fetch('/api/db');
      
      // Handle Local Environment (Vite dev server usually returns 404 or HTML for unknown routes)
      if (response.status === 404 || response.headers.get('content-type')?.includes('text/html')) {
        return { status: 'local', data: null };
      }

      if (!response.ok) {
        throw new Error(`Cloud Error: ${response.status}`);
      }

      const data = await response.json();
      return { status: 'connected', data };
    } catch (error) {
      console.warn("Cloud fetch failed:", error);
      return { status: 'error', error };
    }
  },

  async saveData(orders: Order[], items: OrderItem[], config: AppConfig) {
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orders, items, config })
      });

      if (response.status === 404) throw new Error('Local Mode');
      if (!response.ok) throw new Error('Failed to save to Vercel Cloud');
      
      return await response.json();
    } catch (error) {
      console.error("Cloud save failed:", error);
      throw error;
    }
  }
};