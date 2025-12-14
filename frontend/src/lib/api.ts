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

const mockSubtasks = [
  { id: 1, title: 'Create wireframes', status: 'Completed', taskId: 1, createdAt: '2025-12-01' },
  { id: 2, title: 'Design color palette', status: 'In Progress', taskId: 1, createdAt: '2025-12-02' },
  { id: 3, title: 'Select fonts', status: 'Pending', taskId: 1, createdAt: '2025-12-03' },
  { id: 4, title: 'Setup tables', status: 'Completed', taskId: 2, createdAt: '2025-12-05' }
];

const mockComments = [
  { id: 1, content: 'This task looks good so far. I\'ve completed the initial design.', taskId: 1, author: 'John Doe', createdAt: '2025-12-01T10:30:00Z' },
  { id: 2, content: 'Thanks for the update. Can you also add the mobile mockups?', taskId: 1, author: 'Jane Smith', createdAt: '2025-12-01T14:15:00Z' },
  { id: 3, content: 'Sure, I\'ll add those shortly.', taskId: 1, author: 'John Doe', createdAt: '2025-12-01T15:45:00Z' }
];

const mockFiles = [
  { id: 1, name: 'design_mockup.pdf', size: '2.4 MB', type: 'PDF', uploadedBy: 'John Doe', uploadedAt: '2025-12-01T10:30:00Z', taskId: 1 },
  { id: 2, name: 'database_schema.png', size: '1.1 MB', type: 'Image', uploadedBy: 'Jane Smith', uploadedAt: '2025-12-02T09:15:00Z', projectId: 2 }
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
  } else if (endpoint === '/subtasks') {
    // Create new subtask
    const newSubtask = {
      id: mockSubtasks.length + 1,
      ...data,
      createdAt: new Date().toISOString().split('T')[0]
    };
    mockSubtasks.push(newSubtask);
    return newSubtask;
  } else if (endpoint.startsWith('/subtasks/') && endpoint.endsWith('/delete')) {
    // Delete subtask
    const subtaskId = parseInt(endpoint.split('/')[2]);
    const index = mockSubtasks.findIndex(s => s.id === subtaskId);
    if (index !== -1) {
      mockSubtasks.splice(index, 1);
    }
    return { success: true };
  } else if (endpoint.startsWith('/subtasks/')) {
    // Update subtask
    const subtaskId = parseInt(endpoint.split('/')[2]);
    const index = mockSubtasks.findIndex(s => s.id === subtaskId);
    if (index !== -1) {
      mockSubtasks[index] = { ...mockSubtasks[index], ...data };
      return mockSubtasks[index];
    }
    throw new Error('Subtask not found');
  } else if (endpoint === '/comments') {
    // Create new comment
    const newComment = {
      id: mockComments.length + 1,
      ...data,
      createdAt: new Date().toISOString()
    };
    mockComments.push(newComment);
    return newComment;
  } else if (endpoint.startsWith('/files')) {
    // Simulate file upload
    const newFile = {
      id: mockFiles.length + 1,
      ...data,
      uploadedAt: new Date().toISOString()
    };
    mockFiles.push(newFile);
    return newFile;
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
  } else if (endpoint === '/subtasks') {
    // Return all subtasks
    return mockSubtasks;
  } else if (endpoint.startsWith('/subtasks/') && endpoint.includes('/task/')) {
    // Return subtasks for a specific task
    const taskId = parseInt(endpoint.split('/')[3]);
    return mockSubtasks.filter(s => s.taskId === taskId);
  } else if (endpoint.startsWith('/subtasks/')) {
    // Return specific subtask
    const subtaskId = parseInt(endpoint.split('/')[2]);
    const subtask = mockSubtasks.find(s => s.id === subtaskId);
    if (subtask) {
      return subtask;
    }
    throw new Error('Subtask not found');
  } else if (endpoint.startsWith('/comments/task/')) {
    // Return comments for a specific task
    const taskId = parseInt(endpoint.split('/')[3]);
    return mockComments.filter(c => c.taskId === taskId);
  } else if (endpoint === '/files') {
    // Return all files
    return mockFiles;
  } else if (endpoint.startsWith('/files/task/')) {
    // Return files for a specific task
    const taskId = parseInt(endpoint.split('/')[3]);
    return mockFiles.filter(f => f.taskId === taskId);
  } else if (endpoint.startsWith('/files/project/')) {
    // Return files for a specific project
    const projectId = parseInt(endpoint.split('/')[3]);
    return mockFiles.filter(f => f.projectId === projectId);
  } else {
    // Return empty array for other endpoints
    return [];
  }
}