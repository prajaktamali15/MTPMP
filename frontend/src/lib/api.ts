// Mock data for development
const mockProjects = [
  { id: 1, name: 'Website Redesign', description: 'Redesign company website', createdAt: '2025-12-01', updatedAt: '2025-12-10' },
  { id: 2, name: 'Mobile App', description: 'Develop mobile application', createdAt: '2025-12-05', updatedAt: '2025-12-12' },
  { id: 3, name: 'Marketing Campaign', description: 'Plan marketing campaign', createdAt: '2025-12-08', updatedAt: '2025-12-14' }
];

const mockTasks = [
  { id: 1, title: 'Design homepage', status: 'In Progress', projectId: 1, description: 'Create wireframes for homepage', createdAt: '2025-12-01' },
  { id: 2, title: 'Setup database', status: 'Completed', projectId: 2, description: 'Configure PostgreSQL database', createdAt: '2025-12-05' },
  { id: 3, title: 'Create wireframes', status: 'Pending', projectId: 1, description: 'Design mockups for all pages', createdAt: '2025-12-08' },
  { id: 4, title: 'Write copy', status: 'Pending', projectId: 3, description: 'Create content for marketing materials', createdAt: '2025-12-10' }
];

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Helper function to get organization ID from localStorage
function getOrgId() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('current_org_id');
  }
  return null;
}

// Helper function to simulate API delay
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function postData(endpoint: string, data: any) {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${normalizedEndpoint}`;
  
  // Get organization ID for the header
  const orgId = getOrgId();
  
  console.log(`Making REAL POST request to ${url} with data:`, data);
  
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
      // If it's a 404, fall back to mock data
      if (res.status === 404) {
        console.log('Falling back to mock data for POST request');
        return mockPostData(endpoint, data);
      }
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Network error, falling back to mock data:', error);
    // Fall back to mock data on network errors
    return mockPostData(endpoint, data);
  }
}

export async function getData(endpoint: string) {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${normalizedEndpoint}`;
  
  // Get organization ID for the header
  const orgId = getOrgId();
  
  console.log(`Making REAL GET request to ${url}`);
  
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
      // If it's a 404, fall back to mock data
      if (res.status === 404) {
        console.log('Falling back to mock data for GET request');
        return mockGetData(endpoint);
      }
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Network error, falling back to mock data:', error);
    // Fall back to mock data on network errors
    return mockGetData(endpoint);
  }
}

// Mock implementations for fallback
async function mockPostData(endpoint: string, data: any) {
  // Simulate network delay
  await delay(500);
  
  // Log the request for debugging
  console.log(`Mock POST request to ${endpoint} with data:`, data);
  
  // Handle different endpoints
  if (endpoint === '/projects') {
    // Create new project
    const newProject = {
      id: mockProjects.length + 1,
      ...data,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    mockProjects.push(newProject);
    return newProject;
  } else if (endpoint.startsWith('/projects/') && endpoint.endsWith('/delete')) {
    // Delete project
    const projectId = parseInt(endpoint.split('/')[2]);
    const index = mockProjects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      mockProjects.splice(index, 1);
    }
    return { success: true };
  } else if (endpoint.startsWith('/projects/')) {
    // Update project
    const projectId = parseInt(endpoint.split('/')[2]);
    const index = mockProjects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      mockProjects[index] = { ...mockProjects[index], ...data, updatedAt: new Date().toISOString().split('T')[0] };
      return mockProjects[index];
    }
    throw new Error('Project not found');
  } else if (endpoint === '/tasks') {
    // Create new task
    const newTask = {
      id: mockTasks.length + 1,
      ...data,
      createdAt: new Date().toISOString().split('T')[0]
    };
    mockTasks.push(newTask);
    return newTask;
  } else if (endpoint.startsWith('/tasks/') && endpoint.endsWith('/delete')) {
    // Delete task
    const taskId = parseInt(endpoint.split('/')[2]);
    const index = mockTasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      mockTasks.splice(index, 1);
    }
    return { success: true };
  } else if (endpoint.startsWith('/tasks/')) {
    // Update task
    const taskId = parseInt(endpoint.split('/')[2]);
    const index = mockTasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      mockTasks[index] = { ...mockTasks[index], ...data };
      return mockTasks[index];
    }
    throw new Error('Task not found');
  } else {
    // Return success for other endpoints
    return { success: true, ...data };
  }
}

async function mockGetData(endpoint: string) {
  // Simulate network delay
  await delay(500);
  
  // Log the request for debugging
  console.log(`Mock GET request to ${endpoint}`);
  
  // Handle different endpoints
  if (endpoint === '/projects') {
    // Return all projects
    return mockProjects;
  } else if (endpoint.startsWith('/projects/')) {
    // Return specific project
    const projectId = parseInt(endpoint.split('/')[2]);
    const project = mockProjects.find(p => p.id === projectId);
    if (project) {
      return project;
    }
    throw new Error('Project not found');
  } else if (endpoint === '/tasks') {
    // Return all tasks
    return mockTasks;
  } else if (endpoint.startsWith('/tasks/')) {
    // Return specific task
    const taskId = parseInt(endpoint.split('/')[2]);
    const task = mockTasks.find(t => t.id === taskId);
    if (task) {
      return task;
    }
    throw new Error('Task not found');
  } else {
    // Return empty array for other endpoints
    return [];
  }
}