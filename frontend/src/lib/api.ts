export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

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

export async function postData(endpoint: string, data: any) {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${normalizedEndpoint}`;
  
  // Get organization ID and access token for headers
  const orgId = getOrgId();
  const accessToken = getAccessToken();
  
  try {
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
    console.error('Network error:', error);
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
      console.error(`Request failed with status ${res.status}:`, errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Network error:', error);
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
      console.error(`Request failed with status ${res.status}:`, errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Network error:', error);
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
      console.error(`Request failed with status ${res.status}:`, errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Network error:', error);
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
    
    return res.json();
  } catch (error) {
    console.error('File upload error:', error);
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
