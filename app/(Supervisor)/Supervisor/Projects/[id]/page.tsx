"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiArrowLeft,
  FiClock,
  FiX,
  FiPlus,
  FiCheckCircle,
  FiFile,
  FiPaperclip,
  FiEye,
  FiImage,
} from "react-icons/fi";
 import userAuth from "@/myStore/userAuth";
import { useProject, useProjectTasks, useProjectUsers } from '@/lib/itsMe/page.js';


 const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "In Progress":
      return "bg-blue-100 text-blue-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Low":
      return "bg-green-100 text-green-800";
    case "Medium":
      return "bg-blue-100 text-blue-800";
    case "High":
      return "bg-orange-100 text-orange-800";
    case "Critical":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const calculateDaysLeft = (deadline: string) => {
  if (!deadline) return { days: 0, overdue: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const differenceMs = deadlineDate.getTime() - today.getTime();
  const differenceDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));

  return {
    days: Math.abs(differenceDays),
    overdue: differenceDays < 0,
  };
};

 interface Subtask {
  id: number;
  task_id: number;
  title: string;
  status: "To Do" | "In Progress" | "Review" | "Completed";
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: "To Do" | "In Progress" | "Review" | "Completed";
  priority: "Low" | "Medium" | "High" | "Critical";
  deadline: string;
  estimated_hours: number;
  file_url: string | null;
  completed_at: string | null;
  subtasks: Subtask[];  
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  profile_image?: string;
}

const parseFileUrls = (fileUrlString: string | null | undefined) => {
  if (!fileUrlString) return [];
  
  try {
    const parsed = JSON.parse(fileUrlString);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (typeof parsed === 'string') {
      return [parsed];
    }
    return [];
  } catch (error) {
    return [fileUrlString];
  }
};

const getFirstFileUrl = (fileUrl: string | null | undefined) => {
  const urls = parseFileUrls(fileUrl);
  return urls.length > 0 ? urls[0] : undefined;
};

const simpleDateFormat = (dateString: string) => {
  if (!dateString) return "Unknown";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toISOString().split('T')[0];  
  } catch (error) {
    return dateString;
  }
};

export default function ProjectDetail({ params }: { params: any }) {
  const router = useRouter();
  const id = params.id;

  const [page, setPage] = useState(1);

  const projectService = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL;
  const taskService = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;
  const userService = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

  // SWR hooks
  const { project, success: projectSuccess, error: projectError, isLoading: projectLoading, mutate: mutateProject } = useProject(id, projectService);
  const {
    tasks,
    total,
    page: currentPage = 1,
    pageSize,
    totalPages = 1,
    hasNext = false,
    hasPrevious = false,
    success: tasksSuccess,
    error: tasksError,
    isLoading: tasksLoading,
    mutate: mutateTasks
  } = useProjectTasks(id, taskService, page);
  const { users, error: usersError, isLoading: usersLoading, mutate: mutateUsers } = useProjectUsers(userService);

  // Remove useEffect and useState for fetching project, tasks, users
  // Keep useState for UI state (form, modal, etc.)
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [taskFile, setTaskFile] = useState<File | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTaskFile, setEditTaskFile] = useState<File | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const user = userAuth((state) => state.user);

  // New task state
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    status: "To Do" | "In Progress" | "Review" | "Completed";
    priority: "Low" | "Medium" | "High" | "Critical";
    deadline: string;
    estimated_hours: number;
  }>({
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    deadline: "",
    estimated_hours: 0,
  });

  // Edit task state
  const [editTask, setEditTask] = useState<{
    title: string;
    description: string;
    status: "To Do" | "In Progress" | "Review" | "Completed";
    priority: "Low" | "Medium" | "High" | "Critical";
    deadline: string;
    estimated_hours: number;
  }>({
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    deadline: "",
    estimated_hours: 0,
  });

  // Remove useEffect for clearing new task form, use useEffect only for UI state
  useEffect(() => {
    if (!showNewTaskForm) {
      setTaskFile(null);
      setNewTask({
        title: "",
        description: "",
        status: "To Do",
        priority: "Medium",
        deadline: "",
        estimated_hours: 0,
      });
    }
  }, [showNewTaskForm]);

  // Remove all fetchProject, fetchTasks, fetchUsers, and related useEffects
  // Use SWR's loading/error states for UI
  const loading = projectLoading || tasksLoading || usersLoading;
  const error = projectError || tasksError || usersError;

  // For create/update/delete, use mutateTasks() to revalidate tasks after action
  // For project delete, use mutateProject() if needed

  if (loading) {
    return (
      <div className="w-full mx-auto py-5 px-4 sm:px-4 lg:px-4 min-h-screen bg-gray-50">
        {/* Skeleton for header/back button */}
        <div className="mb-6 animate-pulse">
          <div className="h-10 w-40 bg-gray-200 rounded mb-4" />
        </div>
        {/* Skeleton for project info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4" />
          <div className="h-4 w-40 bg-gray-100 rounded mb-2" />
          <div className="h-4 w-80 bg-gray-100 rounded mb-2" />
          <div className="h-4 w-56 bg-gray-100 rounded mb-2" />
        </div>
        {/* Skeleton for task columns */}
        <div className="grid grid-cols-4 gap-6 mt-6">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm animate-pulse">
              {/* Column title */}
              <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
              {/* Skeleton cards for tasks */}
              {[...Array(2)].map((_, tIdx) => (
                <div key={tIdx} className="mb-6">
                  <div className="h-44 w-full bg-gray-100 rounded mb-3" />
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-40 bg-gray-100 rounded mb-2" />
                  <div className="h-3 w-32 bg-gray-100 rounded mb-2" />
                  <div className="flex gap-2 mt-2">
                    <div className="h-6 w-16 bg-gray-100 rounded" />
                    <div className="h-6 w-16 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20 bg-white rounded-2xl shadow-md">
          <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <FiEye className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Project not found
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The project you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <button
            onClick={() => router.push("/Supervisor/Projects")}
            className="inline-flex items-center px-6 py-3 rounded-lg text-white bg-[#ff4e00] hover:bg-[#ff4e00]/90 transition-all font-medium shadow-sm"
          >
            <FiArrowLeft className="mr-2" /> Back to Projects
          </button>
        </div>
      </div>
    );
  }

   const { days, overdue } = calculateDaysLeft(project.deadline);

  return (
    <div className="w-full mx-auto py-5 px-4 sm:px-4 lg:px-4">
       <div className="mb-6">
        <button
          onClick={() => router.push('/Supervisor/Projects')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff4e00] transition-colors"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-3 space-y-8">
          
          <div className="rounded-xl overflow-hidden transition-all">
            <div className="p-6 w-full">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-gray-800">
                  Project Tasks
                </h3>
                {!showNewTaskForm && (
                  <button
                    onClick={() => setShowNewTaskForm(true)}
                    className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[#ff4e00] text-white hover:bg-[#ff4e00]/90 transition-all text-sm font-medium"
                  >
                    <FiPlus className="mr-2" /> Add Task
                  </button>
                )}
              </div>

              {showNewTaskForm && (
                <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-medium text-gray-800">
                      Create New Task
                    </h4>
                    <button
                      onClick={() => setShowNewTaskForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Task Title *
                      </label>
                      <input
                        type="text"
                        value={newTask.title}
                        onChange={(e) =>
                          setNewTask({ ...newTask, title: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                        placeholder="Enter task title"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Description
                      </label>
                      <textarea
                        value={newTask.description}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            description: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                        placeholder="Enter task description"
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Status
                        </label>
                        <select
                          value={newTask.status}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              status: e.target.value as
                                | "To Do"
                                | "In Progress"
                                | "Review"
                                | "Completed",
                            })
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Review">Review</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Priority
                        </label>
                        <select
                          value={newTask.priority}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              priority: e.target.value as
                                | "Low"
                                | "Medium"
                                | "High"
                                | "Critical",
                            })
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Deadline
                        </label>
                        <input
                          type="date"
                          value={newTask.deadline}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              deadline: e.target.value,
                            })
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Estimated Hours
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newTask.estimated_hours}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              estimated_hours: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                          placeholder="Enter estimated hours"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Attachment
                      </label>
                      <div className="relative border border-gray-300 rounded-lg p-3 bg-white">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setTaskFile(e.target.files[0]);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex items-center">
                          <div className="mr-3 flex-shrink-0">
                            <FiImage className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-grow">
                            <span className="text-sm text-gray-500">
                              {taskFile ? taskFile.name : "Choose image - No file chosen"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">
                        Upload an image related to this task
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100 mt-2">
                      <button
                        onClick={() => {
                          setShowNewTaskForm(false);
                          setTaskFile(null);
                        }}
                        className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!newTask.title) {
                            toast.error("Task title is required");
                            return;
                          }

                          try {
                            setIsCreatingTask(true);

                            const formData = new FormData();
                            
                            formData.append("title", newTask.title);
                            formData.append("description", newTask.description);
                            formData.append("project_id", id);
                            formData.append("status", newTask.status);
                            formData.append("priority", newTask.priority);
                            
                            if (newTask.deadline) {
                              const formattedDeadline = new Date(newTask.deadline).toISOString();
                              formData.append("deadline", formattedDeadline);
                            }
                            
                            formData.append("estimated_hours", newTask.estimated_hours.toString());
                            
                            if (taskFile) {
                              formData.append("file_url", taskFile);
                            }

                            const response = await axios.post(
                              `${taskService}/api/task/addTask`,
                              formData,
                              {
                                headers: {
                                  "Content-Type": "multipart/form-data",
                                },
                              }
                            );

                            if (response.data.success) {
                              toast.success("Task added successfully");

                              setNewTask({
                                title: "",
                                description: "",
                                status: "To Do",
                                priority: "Medium",
                                deadline: "",
                                estimated_hours: 0,
                              });
                              setTaskFile(null);
                              setShowNewTaskForm(false);

                              mutateTasks(); // Re-fetch tasks
                            } else {
                              toast.error(
                                response.data.message ||
                                  "Failed to create task"
                              );
                            }
                          } catch (error: any) {
                            const errorMessage =
                              error.response?.data?.message ||
                              "Error creating task";
                            toast.error(errorMessage);
                            console.error("Task creation error:", error);
                          } finally {
                            setIsCreatingTask(false);
                          }
                        }}
                        disabled={!newTask.title || isCreatingTask}
                        className={`px-5 py-2.5 rounded-lg text-white font-medium ${
                          newTask.title && !isCreatingTask
                            ? "bg-[#ff4e00] hover:bg-[#ff4e00]/90"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {isCreatingTask ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Creating...
                          </>
                        ) : (
                          "Create Task"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 gap-6 mt-6">
                <div>
                  <div className="flex items-center mb-5">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2.5"></div>
                    <h3 className="font-medium text-gray-800">To Do</h3>
                    <span className="ml-1.5 text-gray-500">{tasks?.filter((task: Task) => task.status === "To Do").length || 0}</span>
                  </div>
                  
                  {tasks?.filter((task: Task) => task.status === "To Do").length > 0 ? (
                    <div>
                      {tasks?.filter((task: Task) => task.status === "To Do").map((task: Task) => (
                        <div key={task.id} className="border border-gray-200 rounded-xl mb-4 bg-white overflow-hidden shadow-sm hover:shadow transition-shadow">
                          <div className="h-44 bg-gray-100 relative rounded-t-xl overflow-hidden">
                            {task.file_url ? (
                              <img 
                                src={getFirstFileUrl(task.file_url)}
                                alt={task.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-red-100 to-cyan-100">
                                <FiFile className="h-12 w-12 text-gray-300" />
                              </div>
                            )}
                            
                            <div className="absolute bottom-3 left-3">
                              <span className={`text-sm px-3 py-1 rounded-md text-white font-medium ${
                                task.priority === "High" ? "bg-red-500" : 
                                task.priority === "Medium" ? "bg-orange-500" : 
                                "bg-green-500"
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            
                            <div className="absolute top-3 right-3">
                              <span className="bg-gray-800/70 text-white text-xs px-2 py-1 rounded-md">
                                {task.estimated_hours}h
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-800 mb-1.5">{task.title}</h4>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>
                            
                            <div className="text-xs text-gray-500 space-y-2 mb-4">
                              <div className="flex items-center">
                                <FiCalendar className="mr-2" size={12} />
                                <span className="mr-1 font-medium">Deadline:</span> 
                                <span>{simpleDateFormat(task.deadline)}</span>
                              </div>
                              
                              {task.file_url && (
                                <div className="flex items-center">
                                  <FiPaperclip className="mr-2" size={12} />
                                  <span className="mr-1 font-medium">Attachment:</span>
                                  <span>{parseFileUrls(task.file_url).length} file(s)</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3">
                              <button
                                onClick={() => router.push(`/Supervisor/Projects/SubTasks/${task.id}`)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                View Task
                              </button>
                              
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => {
                                    const taskToEdit = tasks?.find((t: Task) => t.id === task.id);
                                    if (taskToEdit) {
                                      setEditTask({
                                        title: taskToEdit.title,
                                        description: taskToEdit.description || "",
                                        status: taskToEdit.status,
                                        priority: taskToEdit.priority,
                                        deadline: taskToEdit.deadline ? new Date(taskToEdit.deadline).toISOString().split("T")[0] : "",
                                        estimated_hours: taskToEdit.estimated_hours || 0,
                                      });
                                      setEditingTaskId(task.id);
                                      setEditTaskFile(null);
                                    }
                                  }}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <FiEdit size={16} />
                                </button>
                                
                                <button
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this task?")) {
                                      setDeletingTaskId(task.id);
                                      axios.delete(`${taskService}/api/task/deleteSingleTask/${task.id}`)
                                        .then(response => {
                                          if (response.status === 200) {
                                            toast.success("Task deleted successfully");
                                            mutateTasks(); // Re-fetch tasks
                                          }
                                        })
                                        .catch(error => {
                                          toast.error("Error deleting task: " + (error.response?.data?.message || error.message));
                                        })
                                        .finally(() => {
                                          setDeletingTaskId(null);
                                        });
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-200 p-10 rounded-xl text-center">
                      <p className="text-gray-500">No tasks to do</p>
                    </div>
                  )}
                </div>

                 <div>
                  <div className="flex items-center mb-5">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2.5"></div>
                    <h3 className="font-medium text-gray-800">In Progress</h3>
                    <span className="ml-1.5 text-gray-500">{tasks?.filter((task: Task) => task.status === "In Progress").length || 0}</span>
                  </div>
                  
                  {tasks?.filter((task: Task) => task.status === "In Progress").length > 0 ? (
                    <div>
                      {tasks?.filter((task: Task) => task.status === "In Progress").map((task: Task) => (
                        <div key={task.id} className="border border-gray-200 rounded-xl mb-4 bg-white overflow-hidden shadow-sm hover:shadow transition-shadow">
                          <div className="h-44 bg-gray-100 relative rounded-t-xl overflow-hidden">
                            {task.file_url ? (
                              <img 
                                src={getFirstFileUrl(task.file_url)}
                                alt={task.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-100 to-cyan-100">
                                <FiFile className="h-12 w-12 text-gray-300" />
                              </div>
                            )}
                            
                             <div className="absolute bottom-3 left-3">
                              <span className={`text-sm px-3 py-1 rounded-md text-white font-medium ${
                                task.priority === "High" ? "bg-red-500" : 
                                task.priority === "Medium" ? "bg-orange-500" : 
                                "bg-green-500"
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            
                             <div className="absolute top-3 right-3">
                              <span className="bg-gray-800/70 text-white text-xs px-2 py-1 rounded-md">
                                {task.estimated_hours}h
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-800 mb-1.5">{task.title}</h4>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>
                            
                             <div className="text-xs text-gray-500 space-y-2 mb-4">
                              <div className="flex items-center">
                                <FiCalendar className="mr-2" size={12} />
                                <span className="mr-1 font-medium">Deadline:</span> 
                                <span>{simpleDateFormat(task.deadline)}</span>
                              </div>
                              
                               {task.file_url && (
                                <div className="flex items-center">
                                  <FiPaperclip className="mr-2" size={12} />
                                  <span className="mr-1 font-medium">Attachment:</span>
                                  <span>{parseFileUrls(task.file_url).length} file(s)</span>
                                </div>
                              )}
                            </div>
                            
                             <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3">
                              <button
                                onClick={() => router.push(`/Supervisor/Projects/SubTasks/${task.id}`)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                View Task
                              </button>
                              
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => {
                                    const taskToEdit = tasks?.find((t: Task) => t.id === task.id);
                                    if (taskToEdit) {
                                      setEditTask({
                                        title: taskToEdit.title,
                                        description: taskToEdit.description || "",
                                        status: taskToEdit.status,
                                        priority: taskToEdit.priority,
                                        deadline: taskToEdit.deadline ? new Date(taskToEdit.deadline).toISOString().split("T")[0] : "",
                                        estimated_hours: taskToEdit.estimated_hours || 0,
                                      });
                                      setEditingTaskId(task.id);
                                      setEditTaskFile(null);
                                    }
                                  }}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <FiEdit size={16} />
                                </button>
                                
                                <button
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this task?")) {
                                      setDeletingTaskId(task.id);
                                      axios.delete(`${taskService}/api/task/deleteSingleTask/${task.id}`)
                                        .then(response => {
                                          if (response.status === 200) {
                                            toast.success("Task deleted successfully");
                                            mutateTasks(); // Re-fetch tasks
                                          }
                                        })
                                        .catch(error => {
                                          toast.error("Error deleting task: " + (error.response?.data?.message || error.message));
                                        })
                                        .finally(() => {
                                          setDeletingTaskId(null);
                                        });
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-200 p-10 rounded-xl text-center">
                      <p className="text-gray-500">No tasks in progress</p>
                    </div>
                  )}
                </div>

                 <div>
                  <div className="flex items-center mb-5">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2.5"></div>
                    <h3 className="font-medium text-gray-800">Review</h3>
                    <span className="ml-1.5 text-gray-500">{tasks?.filter((task: Task) => task.status === "Review").length || 0}</span>
                  </div>
                  
                  {tasks?.filter((task: Task) => task.status === "Review").length > 0 ? (
                    <div>
                      {tasks?.filter((task: Task) => task.status === "Review").map((task: Task) => (
                        <div key={task.id} className="border border-gray-200 rounded-xl mb-4 bg-white overflow-hidden shadow-sm hover:shadow transition-shadow">
                           <div className="h-44 bg-gray-100 relative rounded-t-xl overflow-hidden">
                            {task.file_url ? (
                              <img 
                                src={getFirstFileUrl(task.file_url)}
                                alt={task.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-100 to-pink-100">
                                <FiFile className="h-12 w-12 text-gray-300" />
                              </div>
                            )}
                            
                             <div className="absolute bottom-3 left-3">
                              <span className={`text-sm px-3 py-1 rounded-md text-white font-medium ${
                                task.priority === "High" ? "bg-red-500" : 
                                task.priority === "Medium" ? "bg-orange-500" : 
                                "bg-green-500"
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            
                             <div className="absolute top-3 right-3">
                              <span className="bg-gray-800/70 text-white text-xs px-2 py-1 rounded-md">
                                {task.estimated_hours}h
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-800 mb-1.5">{task.title}</h4>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>
                            
                             <div className="text-xs text-gray-500 space-y-2 mb-4">
                              <div className="flex items-center">
                                <FiCalendar className="mr-2" size={12} />
                                <span className="mr-1 font-medium">Deadline:</span> 
                                <span>{simpleDateFormat(task.deadline)}</span>
                              </div>
                              
                               {task.file_url && (
                                <div className="flex items-center">
                                  <FiPaperclip className="mr-2" size={12} />
                                  <span className="mr-1 font-medium">Attachment:</span>
                                  <span>{parseFileUrls(task.file_url).length} file(s)</span>
                                </div>
                              )}
                            </div>
                            
                             <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3">
                              <button
                                onClick={() => router.push(`/Supervisor/Projects/SubTasks/${task.id}`)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                View Task
                              </button>
                              
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => {
                                    const taskToEdit = tasks?.find((t: Task) => t.id === task.id);
                                    if (taskToEdit) {
                                      setEditTask({
                                        title: taskToEdit.title,
                                        description: taskToEdit.description || "",
                                        status: taskToEdit.status,
                                        priority: taskToEdit.priority,
                                        deadline: taskToEdit.deadline ? new Date(taskToEdit.deadline).toISOString().split("T")[0] : "",
                                        estimated_hours: taskToEdit.estimated_hours || 0,
                                      });
                                      setEditingTaskId(task.id);
                                      setEditTaskFile(null);
                                    }
                                  }}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <FiEdit size={16} />
                                </button>
                                
                                <button
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this task?")) {
                                      setDeletingTaskId(task.id);
                                      axios.delete(`${taskService}/api/task/deleteSingleTask/${task.id}`)
                                        .then(response => {
                                          if (response.status === 200) {
                                            toast.success("Task deleted successfully");
                                            mutateTasks(); // Re-fetch tasks
                                          }
                                        })
                                        .catch(error => {
                                          toast.error("Error deleting task: " + (error.response?.data?.message || error.message));
                                        })
                                        .finally(() => {
                                          setDeletingTaskId(null);
                                        });
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-200 p-10 rounded-xl text-center">
                      <p className="text-gray-500">No tasks in review</p>
                    </div>
                  )}
                </div>

                 <div>
                  <div className="flex items-center mb-5">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2.5"></div>
                    <h3 className="font-medium text-gray-800">Completed</h3>
                    <span className="ml-1.5 text-gray-500">{tasks?.filter((task: Task) => task.status === "Completed").length || 0}</span>
                  </div>
                  
                  {tasks?.filter((task: Task) => task.status === "Completed").length > 0 ? (
                    <div>
                      {tasks?.filter((task: Task) => task.status === "Completed").map((task: Task) => (
                        <div key={task.id} className="border border-gray-200 rounded-xl mb-4 bg-white overflow-hidden shadow-sm hover:shadow transition-shadow">
                           <div className="h-44 bg-gray-100 relative rounded-t-xl overflow-hidden">
                            {task.file_url ? (
                              <img 
                                src={getFirstFileUrl(task.file_url)}
                                alt={task.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-green-100 to-teal-100">
                                <FiFile className="h-12 w-12 text-gray-300" />
                              </div>
                            )}
                            
                             <div className="absolute bottom-3 left-3">
                              <span className={`text-sm px-3 py-1 rounded-md text-white font-medium ${
                                task.priority === "High" ? "bg-red-500" : 
                                task.priority === "Medium" ? "bg-orange-500" : 
                                "bg-green-500"
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            
                             <div className="absolute top-3 right-3">
                              <span className="bg-gray-800/70 text-white text-xs px-2 py-1 rounded-md">
                                {task.estimated_hours}h
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-800 mb-1.5">{task.title}</h4>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>
                            
                             <div className="text-xs text-gray-500 space-y-2 mb-4">
                              <div className="flex items-center">
                                <FiCalendar className="mr-2" size={12} />
                                <span className="mr-1 font-medium">Deadline:</span> 
                                <span>{simpleDateFormat(task.deadline)}</span>
                              </div>
                              
                               {task.file_url && (
                                <div className="flex items-center">
                                  <FiPaperclip className="mr-2" size={12} />
                                  <span className="mr-1 font-medium">Attachment:</span>
                                  <span>{parseFileUrls(task.file_url).length} file(s)</span>
                                </div>
                              )}
                            </div>
                            
                             <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3">
                              <button
                                onClick={() => router.push(`/Supervisor/Projects/SubTasks/${task.id}`)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                View Task
                              </button>
                              
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => {
                                    const taskToEdit = tasks?.find((t: Task) => t.id === task.id);
                                    if (taskToEdit) {
                                      setEditTask({
                                        title: taskToEdit.title,
                                        description: taskToEdit.description || "",
                                        status: taskToEdit.status,
                                        priority: taskToEdit.priority,
                                        deadline: taskToEdit.deadline ? new Date(taskToEdit.deadline).toISOString().split("T")[0] : "",
                                        estimated_hours: taskToEdit.estimated_hours || 0,
                                      });
                                      setEditingTaskId(task.id);
                                      setEditTaskFile(null);
                                    }
                                  }}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <FiEdit size={16} />
                                </button>
                                
                                <button
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this task?")) {
                                      setDeletingTaskId(task.id);
                                      axios.delete(`${taskService}/api/task/deleteSingleTask/${task.id}`)
                                        .then(response => {
                                          if (response.status === 200) {
                                            toast.success("Task deleted successfully");
                                            mutateTasks(); // Re-fetch tasks
                                          }
                                        })
                                        .catch(error => {
                                          toast.error("Error deleting task: " + (error.response?.data?.message || error.message));
                                        })
                                        .finally(() => {
                                          setDeletingTaskId(null);
                                        });
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-200 p-10 rounded-xl text-center">
                      <p className="text-gray-500">No completed tasks</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Controls for Tasks */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          onClick={() => setPage((p: number) => Math.max(1, p - 1))}
          disabled={!hasPrevious || page === 1}
        >
          Previous
        </button>
        <span className="font-medium">Page {currentPage} of {totalPages}</span>
        <button
          className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          onClick={() => setPage((p: number) => p + 1)}
          disabled={!hasNext || page === totalPages}
        >
          Next
        </button>
      </div>

       {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Confirm Delete
              </h2>
              <button
                onClick={() => !isDeleting && setShowDeleteConfirm(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex justify-center text-red-500 mb-4">
                <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
                  <FiTrash2 className="h-8 w-8" />
                </div>
              </div>
              <p className="text-center text-lg mb-2">
                Are you sure you want to delete this project?
              </p>
              <p className="text-center font-semibold text-lg mb-1 text-gray-900">
                {project.name}
              </p>
              <p className="text-center text-sm text-red-600">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    const response = await axios.delete(
                      `${projectService}/api/project/projectDelete/${id}`
                    );

                    if (response.data.success) {
                      toast.success("Project deleted successfully");
                      router.push("/Supervisor/Projects");
                      mutateProject(); // Re-fetch project
                    } else {
                      toast.error(response.data.message || "Failed to delete project");
                    }
                  } catch (error: any) {
                    const message =
                      error.response?.data?.message || "Failed to delete project";
                    toast.error(message);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center shadow-sm font-medium"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="mr-2" /> Delete Project
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

       {editingTaskId && (
        <>
           <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl shadow-xl max-w-md w-full p-0">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Edit Task</h2>
              <button
                onClick={() => setEditingTaskId(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editTask.title}
                    onChange={(e) =>
                      setEditTask({ ...editTask, title: e.target.value })
                    }
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editTask.description}
                    onChange={(e) =>
                      setEditTask({ ...editTask, description: e.target.value })
                    }
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={editTask.status}
                      onChange={(e) =>
                        setEditTask({
                          ...editTask,
                          status: e.target.value as
                            | "To Do"
                            | "In Progress"
                            | "Review"
                            | "Completed",
                        })
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={editTask.priority}
                      onChange={(e) =>
                        setEditTask({
                          ...editTask,
                          priority: e.target.value as
                            | "Low"
                            | "Medium"
                            | "High"
                            | "Critical",
                        })
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={editTask.deadline}
                      onChange={(e) =>
                        setEditTask({ ...editTask, deadline: e.target.value })
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editTask.estimated_hours}
                      onChange={(e) =>
                        setEditTask({
                          ...editTask,
                          estimated_hours: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                      placeholder="Hours"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Update Attachment
                  </label>
                  {editingTaskId && (() => {
                    const currentTask = tasks?.find((t: Task) => t.id === editingTaskId);
                    return currentTask?.file_url ? (
                      <div className="text-sm text-gray-600 flex items-center bg-gray-50 p-2 rounded-md">
                        <FiFile className="mr-2 text-gray-500" />
                        <span className="truncate">
                          Current file: {currentTask.file_url.split('/').pop() || 'Unknown file'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600 mb-2">No file currently attached</div>
                    );
                  })()}
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditTaskFile(e.target.files[0]);
                      }
                    }}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to keep the current file
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this task?")) {
                    setEditingTaskId(null);
                     const taskId = editingTaskId;
                    const button = document.querySelector(
                      `button[data-task-id="${taskId}"]`
                    ) as HTMLButtonElement;
                    if (button) {
                      button.click();
                    }
                  }
                }}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                Delete Task
              </button>
              <button
                onClick={() => setEditingTaskId(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  if (!editTask.title) {
                    toast.error("Title is required");
                    return;
                  }

                  try {
                    setIsUpdatingTask(true);

                     const formData = new FormData();
                    
                     formData.append("title", editTask.title);
                    formData.append("description", editTask.description);
                    formData.append("status", editTask.status);
                    formData.append("priority", editTask.priority);
                    
                    if (editTask.deadline) {
                      const formattedDeadline = new Date(editTask.deadline).toISOString();
                      formData.append("deadline", formattedDeadline);
                    }
                    
                    formData.append("estimated_hours", editTask.estimated_hours.toString());
                    
                    // Append file if any
                    if (editTaskFile) {
                      formData.append("file_url", editTaskFile);
                    }

                    // Send request to update task
                    const response = await axios.put(
                      `${taskService}/api/task/updateTask/${editingTaskId}`,
                      formData,
                      {
                        headers: {
                          "Content-Type": "multipart/form-data",
                        },
                      }
                    );

                    if (response.data && response.data.success) {
                      toast.success("Task updated successfully");

                       mutateTasks(); // Re-fetch tasks

                       setEditingTaskId(null);
                      setEditTaskFile(null);
                    } else {
                      toast.error(
                        response.data?.message || "Failed to update task"
                      );

                       const updatedTasks = tasks?.map((t: Task) => {
                        if (t.id === editingTaskId) {
                          return {
                            ...t,
                            title: editTask.title,
                            description: editTask.description,
                            status: editTask.status,
                            priority: editTask.priority,
                            deadline: editTask.deadline
                              ? new Date(editTask.deadline).toISOString()
                              : t.deadline,
                            estimated_hours: editTask.estimated_hours,
                             progress:
                              editTask.status === "Completed"
                                ? 100
                                : editTask.status === "In Progress"
                                ? 50
                                : editTask.status === "Review"
                                ? 75
                                : 0,
                          };
                        }
                        return t;
                      });

                      // Update the tasks state directly if mutateTasks doesn't update it
                      // This might be necessary if mutateTasks doesn't re-render the component
                      // For now, rely on mutateTasks to re-fetch and update the list
                    }
                  } catch (error: any) {
                    toast.error(
                      "Error updating task: " +
                        (error.response?.data?.message || error.message)
                    );
                    console.error("Task update error:", error);
                  } finally {
                    setIsUpdatingTask(false);
                  }
                }}
                disabled={!editTask.title || isUpdatingTask}
                className={`px-4 py-2 rounded-md ${
                  isUpdatingTask
                    ? "bg-orange-400 cursor-not-allowed"
                    : "bg-[#ff4e00] hover:bg-[#ff4e00]/90"
                } text-white transition-colors`}
              >
                {isUpdatingTask ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Edit Task"
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}