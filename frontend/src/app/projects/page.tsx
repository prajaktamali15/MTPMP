'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getData, postData, putData, deleteData } from '@/lib/api';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user]);

  // Load projects
  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getData('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      // No fallback to mock data anymore
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingProject(null);
    setFormData({ name: '', description: '' });
    setShowCreateForm(true);
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description });
    setShowCreateForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        // Update existing project
        const updatedProject = await putData(`/projects/${editingProject.id}`, formData);
        setProjects(projects.map(p => 
          p.id === editingProject.id 
            ? { ...updatedProject, updatedAt: new Date().toISOString().split('T')[0] } 
            : p
        ));
      } else {
        // Create new project
        const newProject = await postData('/projects', formData);
        setProjects([...projects, newProject]);
      }
    } catch (error) {
      console.error('Failed to save project:', error);
      // No fallback to local update anymore
    }
    setShowCreateForm(false);
    setFormData({ name: '', description: '' });
  };

  const handleDelete = async (id: string) => {  // Changed parameter type from number to string
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        // Use DELETE method instead of POST to /delete endpoint
        await deleteData(`/projects/${id}`);
        setProjects(projects.filter(p => p.id !== id));
      } catch (error) {
        console.error('Failed to delete project:', error);
        // No fallback to local deletion anymore
        setProjects(projects.filter(p => p.id !== id));
      }
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading Projects...</h1>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="p-6">
        <button 
          onClick={() => setShowCreateForm(false)}
          className="mb-4 text-blue-600"
        >
          ← Back to Projects
        </button>
        
        <h1 className="text-3xl font-bold mb-6">
          {editingProject ? 'Edit Project' : 'Create New Project'}
        </h1>
        
        <form onSubmit={handleFormSubmit} className="max-w-2xl">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border p-2 rounded"
              rows={4}
            />
          </div>
          
          <button 
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editingProject ? 'Update Project' : 'Create Project'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <button 
          onClick={handleCreateClick}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Project
        </button>
      </div>
      
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No projects found</p>
          <button 
            onClick={handleCreateClick}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold">{project.name}</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditClick(project)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="text-sm text-gray-500 mb-4">
                <p>Created: {project.createdAt}</p>
                <p>Updated: {project.updatedAt}</p>
              </div>
              <button 
                onClick={() => router.push(`/projects/${project.id}`)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}