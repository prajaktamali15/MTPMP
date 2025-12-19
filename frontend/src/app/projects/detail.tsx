'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getData, postData } from '@/lib/api';

export default function ProjectDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  // Load project data
  useEffect(() => {
    loadProjectData();
  }, []);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would get the project ID from URL params
      // For now, we'll load the first project as an example
      const projects = await getData('/projects');
      if (projects && projects.length > 0) {
        const project = projects[0];
        setProject(project);
        
        // Load tasks for this project
        const projectTasks = await getData(`/tasks?projectId=${project.id}`);
        setTasks(projectTasks);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load project data:', error);
      setError("Failed to load project data");
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTask(true);
    setError("");

    try {
      // Create task via API
      const newTask = await postData('/tasks', {
        title: taskTitle,
        description: taskDescription,
        projectId: project?.id
      });
      
      setTasks([...tasks, newTask]);
      setTaskTitle("");
      setTaskDescription("");
      setCreatingTask(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      setError("Failed to create task");
      setCreatingTask(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        <p className="text-lg text-gray-600">Fetching project details...</p>
      </div>
    );
  }

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

  return (
    <div className="p-6">
      <div className="mb-6">
        <button 
          onClick={() => router.push("/dashboard")}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold mb-2">{project?.name}</h1>
        <p className="text-gray-600">{project?.description || "No description provided"}</p>
      </div>

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
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Status: {task.status || "OPEN"}</span>
                  <span>Created {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}