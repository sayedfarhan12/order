import { createClient } from 'redis';

// Use the provided Redis URL. 
// In a real production environment, it is recommended to move this to Vercel Environment Variables (REDIS_URL).
const REDIS_URL = process.env.REDIS_URL || 'redis://default:OjbJUpZk6rWmKrpayVUVc5YwKU6Fy013@redis-19140.c98.us-east-1-4.ec2.cloud.redislabs.com:19140';

// Global client variable to allow connection reuse across function invocations in Vercel
let client;

async function getRedisClient() {
  if (!client) {
    client = createClient({
      url: REDIS_URL,
      socket: {
        connectTimeout: 10000 // 10 seconds timeout
      }
    });

    client.on('error', (err) => console.error('Redis Client Error', err));
    
    await client.connect();
  } else if (!client.isOpen) {
    // Reconnect if connection was closed
    await client.connect();
  }
  
  return client;
}

export default async function handler(request, response) {
  // Common CORS and Headers setup could go here if needed, but usually handled by Vercel

  try {
    const redis = await getRedisClient();

    if (request.method === 'GET') {
      const dataString = await redis.get('happy_store_data');
      // Redis stores data as a string, parse it back to JSON
      const data = dataString ? JSON.parse(dataString) : null;
      return response.status(200).json(data);
    } 
    
    else if (request.method === 'POST') {
      const body = request.body;
      
      // Ensure body is an object before stringifying
      const dataToSave = typeof body === 'string' ? body : JSON.stringify(body);
      
      await redis.set('happy_store_data', dataToSave);
      return response.status(200).json({ success: true });
    }
    
    return response.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error("Database Operation Error:", error);
    // Return 500 so the frontend knows it's a server error, not a missing route
    return response.status(500).json({ 
      error: 'Database connection failed', 
      details: error.message 
    });
  }
}