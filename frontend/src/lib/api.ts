import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3002', 
});

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export async function postData(endpoint: string, data: any) {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${normalizedEndpoint}`;
  
  console.log(`Making POST request to ${url} with data:`, data);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    console.log(`Response status: ${res.status}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Request failed with status ${res.status}:`, errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
}