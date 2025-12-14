"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { getData, postData } from "@/lib/api";

// Define TypeScript interfaces
interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  projectId: number;
  createdAt: string;
}

export default function ProjectDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);
  
  // Project settings state
  const [showSettings, setShowSettings] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  // Handle authentication and redirection with useEffect
  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  // Fetch project data
  useEffect(() => {
    if (user && projectId) {
      fetchProjectData();
    }
  }, [user, projectId]);

  const fetchProjectData = async () => {
    try {
      // Fetch project details
      const projectResponse = await getData(`/projects/${projectId}`) as Project;
      setProject(projectResponse);
      setProjectName(projectResponse.name);
      setProjectDescription(projectResponse.description || "");
      
      // Fetch tasks for this project
      const tasksResponse = await getData(`/tasks`) as Task[];
      // Convert projectId to number for comparison since our mock data uses numbers
      const projectTasks = tasksResponse.filter((task) => task.projectId === Number(projectId));
      setTasks(projectTasks);
    } catch (err: any) {
      console.error('Error fetching project data:', err);
      // If it's a "Project not found" error, show a friendly message
      if (err.message && err.message.includes('Project not found')) {
        setError('Project not found. It may have been deleted or does not exist.');
      } else {
        setError(err.message || "Failed to load project data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTask(true);
    setError("");

    try {
      const response = await postData("/tasks", {
        title: taskTitle,
        description: taskDescription,
        projectId: Number(projectId)
      }) as Task;
      
      // Add new task to the list
      setTasks([...tasks, response]);
      // Reset form
      setTaskTitle("");
      setTaskDescription("");
    } catch (err: any) {
      setError(err.message || "Failed to create task");
    } finally {
      setCreatingTask(false);
    }
  };
  
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setError("");

    try {
      const response = await postData(`/projects/${projectId}`, {
        name: projectName,
        description: projectDescription
      }) as Project;
      
      setProject(response);
      alert("Project settings saved successfully!");
      setShowSettings(false);
    } catch (err: any) {
      setError(err.message || "Failed to save project settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm("Are you sure you want to delete this project? This will also delete all tasks in this project. This action cannot be undone.")) {
      return;
    }

    try {
      await postData(`/projects/${projectId}/delete`, {});
      alert("Project deleted successfully!");
      router.push("/projects");
    } catch (err: any) {
      setError(err.message || "Failed to delete project");
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        <p className="text-lg text-gray-600">Fetching project details...</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => router.push("/dashboard")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Handle unauthenticated state
  if (!user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button 
          onClick={() => router.push("/projects")}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Projects
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project?.name}</h1>
            <p className="text-gray-600">{project?.description || "No description provided"}</p>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            {showSettings ? "Cancel Settings" : "Project Settings"}
          </button>
        </div>
      </div>

      {showSettings ? (
        <div className="mb-8 p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Project Settings</h2>
          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>
            
            <div>
              <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {savingSettings ? "Saving..." : "Save Settings"}
              </button>
              
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleDeleteProject}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-auto"
              >
                Delete Project
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
          
          {/* Create Task Form */}
          <div className="mb-6 p-4 border rounded">
            <h3 className="text-xl font-medium mb-3">Add New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  id="taskTitle"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="taskDescription"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                  rows={2}
                />
              </div>
              
              <button
                type="submit"
                disabled={creatingTask}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {creatingTask ? "Creating..." : "Create Task"}
              </button>
            </form>
          </div>
          
          {/* Tasks List */}
          {tasks.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded">
              <p className="text-gray-500">No tasks yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                  <p className="text-gray-600 mb-3">{task.description || "No description"}</p>
                  <div className="flex justify-between text-sm text-gray-500 mb-3">
                    <span>Status: {task.status || "OPEN"}</span>
                    <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => router.push(`/tasks/${task.id}`)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Edit Task
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this task?")) {
                          setTasks(tasks.filter(t => t.id !== task.id));
                        }
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Delete Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}