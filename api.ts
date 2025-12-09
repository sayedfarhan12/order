import { Order, OrderItem, AppConfig } from './types';

export const CloudService = {
  async fetchData() {
    try {
      const response = await fetch('/api/db');
      if (!response.ok) {
        if (response.status === 404) return null; // Likely local dev without api proxy
        throw new Error('Failed to fetch from Vercel Cloud');
      }
      const data = await response.json();
      return data; // Expected { orders: [], items: [], config: {} }
    } catch (error) {
      console.warn("Cloud fetch skipped/failed (using local data):", error);
      return null;
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

      if (!response.ok) throw new Error('Failed to save to Vercel Cloud');
      return await response.json();
    } catch (error) {
      console.error("Cloud save failed:", error);
      throw error;
    }
  }
};