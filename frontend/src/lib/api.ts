export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Function to decode JWT token
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

// Helper function to get organization ID from localStorage
export function getOrgId() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('current_org_id');
  }
  return null;
}

// Helper function to get access token from localStorage
export function getAccessToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

// Helper function to get user email from JWT token
export function getUserEmail() {
  const token = getAccessToken();
  if (!token) return null;
  
  const decoded = parseJwt(token);
  return decoded?.email || null;
}

export async function postData(endpoint: string, data: any) {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${normalizedEndpoint}`;
  
  // Get organization ID and access token for headers
  const orgId = getOrgId();
  const accessToken = getAccessToken();
  
  try {
    // Log the request for debugging
    console.log(`Making POST request to: ${url}`);
    console.log(`Request headers:`, { 
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...(!normalizedEndpoint.startsWith('/auth') && orgId && { 'x-org-id': orgId }),
    });
    console.log(`Request body:`, data);
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }), // Add Authorization header if available
        // Add x-org-id header for all requests except auth endpoints
        ...(!normalizedEndpoint.startsWith('/auth') && orgId && { 'x-org-id': orgId }),
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Request failed with status ${res.status}:`, errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Network error in POST request to:', url, error);
    // Check if it's a CORS error or network issue
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('This might be a CORS error or the backend server is not running');
      throw new Error('Unable to connect to the server. Please make sure the backend is running.');
    }
    throw error;
  }
}

export async function getData(endpoint: string) {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${normalizedEndpoint}`;
  
  // Get organization ID and access token for headers
  const orgId = getOrgId();
  const accessToken = getAccessToken();
  
  try {
    // Log the request for debugging
    console.log(`Making GET request to: ${url}`);
    console.log(`Request headers:`, { 
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...(!normalizedEndpoint.startsWith('/auth') && orgId && { 'x-org-id': orgId }),
    });
    
    const res = await fetch(url, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }), // Add Authorization header if available
        // Add x-org-id header for all requests except auth endpoints
        ...(!normalizedEndpoint.startsWith('/auth') && orgId && { 'x-org-id': orgId }),
      },
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`GET request failed with status ${res.status}:`, errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    console.log(`GET request successful from: ${url}`);
    return res.json();
  } catch (error) {
    console.error('Network error in GET request to:', url, error);
    // Check if it's a CORS error or network issue
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('This might be a CORS error or the backend server is not running');
      throw new Error('Unable to connect to the server. Please make sure the backend is running.');
    }
    throw error;
  }
}

export async function putData(endpoint: string, data: any) {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${normalizedEndpoint}`;
  
  // Get organization ID and access token for headers
  const orgId = getOrgId();
  const accessToken = getAccessToken();
  
  try {
    // Log the request for debugging
    console.log(`Making PUT request to: ${url}`);
    console.log(`Request headers:`, { 
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...(!normalizedEndpoint.startsWith('/auth') && orgId && { 'x-org-id': orgId }),
    });
    console.log(`Request body:`, data);
    
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }), // Add Authorization header if available
        // Add x-org-id header for all requests except auth endpoints
        ...(!normalizedEndpoint.startsWith('/auth') && orgId && { 'x-org-id': orgId }),
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`PUT request failed with status ${res.status}:`, errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    console.log(`PUT request successful to: ${url}`);
    return res.json();
  } catch (error) {
    console.error('Network error in PUT request to:', url, error);
    // Check if it's a CORS error or network issue
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('This might be a CORS error or the backend server is not running');
      throw new Error('Unable to connect to the server. Please make sure the backend is running.');
    }
    throw error;
  }
}

export async function deleteData(endpoint: string) {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${normalizedEndpoint}`;
  
  // Get organization ID and access token for headers
  const orgId = getOrgId();
  const accessToken = getAccessToken();
  
  try {
    // Log the request for debugging
    console.log(`Making DELETE request to: ${url}`);
    console.log(`Request headers:`, { 
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...(!normalizedEndpoint.startsWith('/auth') && orgId && { 'x-org-id': orgId }),
    });
    
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }), // Add Authorization header if available
        // Add x-org-id header for all requests except auth endpoints
        ...(!normalizedEndpoint.startsWith('/auth') && orgId && { 'x-org-id': orgId }),
      },
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`DELETE request failed with status ${res.status}:`, errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    console.log(`DELETE request successful to: ${url}`);
    return res.json();
  } catch (error) {
    console.error('Network error in DELETE request to:', url, error);
    // Check if it's a CORS error or network issue
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('This might be a CORS error or the backend server is not running');
      throw new Error('Unable to connect to the server. Please make sure the backend is running.');
    }
    throw error;
  }
}

// New function for file uploads
export async function uploadFile(file: File, taskId?: string, projectId?: string) {
  const url = `${API_URL}/files/upload`;
  
  // Get organization ID and access token for headers
  const orgId = getOrgId();
  const accessToken = getAccessToken();
  
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('file', file);
  
  // Add taskId or projectId if provided
  if (taskId) {
    formData.append('taskId', taskId);
  }
  if (projectId) {
    formData.append('projectId', projectId);
  }
  
  try {
    // Log the request for debugging
    console.log(`Making file upload request to: ${url}`);
    console.log(`Upload headers:`, {
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...(orgId && { 'x-org-id': orgId }),
    });
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }), // Add Authorization header if available
        // Add x-org-id header for all requests except auth endpoints
        ...(orgId && { 'x-org-id': orgId }),
      },
      body: formData,
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`File upload failed with status ${res.status}:`, errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    console.log(`File upload successful to: ${url}`);
    return res.json();
  } catch (error) {
    console.error('Network error in file upload request to:', url, error);
    // Check if it's a CORS error or network issue
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('This might be a CORS error or the backend server is not running');
      throw new Error('Unable to connect to the server. Please make sure the backend is running.');
    }
    throw error;
  }
}

// Function to get files for a task
export async function getTaskFiles(taskId: string) {
  return getData(`/files/task/${taskId}`);
}

// Function to delete a file
export async function deleteFile(fileId: string) {
  return deleteData(`/files/${fileId}`);
}
