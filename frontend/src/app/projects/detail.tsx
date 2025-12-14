'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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

  // Simulate loading project data
  useEffect(() => {
    setTimeout(() => {
      setProject({
        id: 1,
        name: "Website Redesign",
        description: "Complete redesign of company website"
      });
      
      setTasks([
        { id: 1, title: "Design homepage", status: "In Progress", project: "Website Redesign" },
        { id: 2, title: "Setup database", status: "Completed", project: "Website Redesign" },
        { id: 3, title: "Create wireframes", status: "Pending", project: "Website Redesign" }
      ]);
      
      setLoading(false);
    }, 500);
  }, []);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTask(true);
    setError("");

    // Simulate creating task
    setTimeout(() => {
      const newTask = {
        id: tasks.length + 1,
        title: taskTitle,
        description: taskDescription,
        status: "Pending",
        project: project?.name || "Unknown Project"
      };
      
      setTasks([...tasks, newTask]);
      setTaskTitle("");
      setTaskDescription("");
      setCreatingTask(false);
    }, 500);
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