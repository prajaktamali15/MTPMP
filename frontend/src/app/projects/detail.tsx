'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { getData, postData } from "@/lib/api";

export default function ProjectDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams(); // Get project ID from URL params
  
  // Project state
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Tasks state
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);
  
  // Assignee state
  const [assignees, setAssignees] = useState<any[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  
  // Load project details and members
  useEffect(() => {
    console.log('Project detail page mounted');
    console.log('User:', user);
    console.log('Project ID from params:', id);
    if (user && id) {
      loadProjectData();
    }
  }, [user, id]);
  
  const loadProjectData = async () => {
    try {
      setLoading(true);
      console.log('Loading project data for ID:', id);
      
      // Load project details
      const projectData = await getData(`/projects/${id}`);
      console.log('Project data loaded:', projectData);
      setProject(projectData);
      
      // Load project tasks
      const allTasksData = await getData(`/tasks`);
      console.log('All tasks data loaded:', allTasksData);
      // Filter tasks for this specific project
      const projectTasks = allTasksData.filter((task: any) => task.projectId === id);
      console.log('Filtered project tasks:', projectTasks);
      setTasks(projectTasks);
      
      // Load organization members for assignee dropdown
      const orgId = localStorage.getItem('current_org_id');
      console.log('Current org ID:', orgId);
      if (orgId) {
        try {
          const membersData = await getData(`/organizations/${orgId}/members`);
          console.log('Members data:', membersData);
          setAssignees(membersData);
        } catch (memberError) {
          console.error('Error loading members:', memberError);
          setAssignees([]);
        }
      } else {
        console.log('No org ID found in localStorage');
      }
      
      setError("");
    } catch (err: any) {
      console.error('Error loading project data:', err);
      setError(err.message || "Failed to load project data");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTask(true);
    setError("");

    try {
      // Create task via API with assignee
      const taskData: any = {
        title: taskTitle,
        description: taskDescription,
        projectId: project?.id
      };
      
      // Add assignee if selected
      if (selectedAssignee) {
        taskData.assigneeId = selectedAssignee;
      }
      
      const newTask = await postData('/tasks', taskData);
      
      setTasks([...tasks, newTask]);
      setTaskTitle("");
      setTaskDescription("");
      setSelectedAssignee("");
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
            
            {/* Debug info */}
            <div className="text-sm text-gray-500">
              <p>Assignees count: {assignees.length}</p>
              <p>Selected assignee: {selectedAssignee || 'None'}</p>
            </div>
            
            {/* Assignee Field */}
            <div>
              <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                Assign To
              </label>
              <select
                id="assignee"
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              >
                <option value="">Select assignee (optional)</option>
                {assignees.length > 0 ? (
                  assignees.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name || member.email}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No members available
                  </option>
                )}
              </select>
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