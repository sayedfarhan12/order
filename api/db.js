import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  if (request.method === 'GET') {
    try {
      const data = await kv.get('happy_store_data');
      return response.status(200).json(data || null);
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: 'Failed to fetch data' });
    }
  } else if (request.method === 'POST') {
    try {
      const body = request.body;
      await kv.set('happy_store_data', body);
      return response.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: 'Failed to save data' });
    }
  }
  
  return response.status(405).json({ error: 'Method not allowed' });
}