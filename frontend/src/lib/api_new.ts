export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Helper function to get organization ID from localStorage
function getOrgId() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('current_org_id');
  }
  return null;
}

export async function postData(endpoint: string, data: any) {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${normalizedEndpoint}`;
  
  // Get organization ID for the header
  const orgId = getOrgId();
  
  console.log(`Making POST request to ${url} with data:`, data);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(orgId && { 'x-org-id': orgId }), // Add x-org-id header if available
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

export async function getData(endpoint: string) {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${normalizedEndpoint}`;
  
  // Get organization ID for the header
  const orgId = getOrgId();
  
  console.log(`Making GET request to ${url}`);
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        ...(orgId && { 'x-org-id': orgId }), // Add x-org-id header if available
      },
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