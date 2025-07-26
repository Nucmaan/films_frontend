"use client";
import userAuth from '@/myStore/userAuth';
import React, { useState } from "react";
import { FiEdit, FiClock, FiCalendar, FiFlag, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useUserActiveAssignments } from "@/lib/allInOne/page.js";  

interface Assignment {
  id: number;
  task_id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  deadline: string;
  estimated_hours: number;
  time_spent: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function AssignedTasksPage() {
  const user = userAuth((state) => state.user);
  const taskUrl = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;
  const statusOptions = ["To Do", "In Progress", "Completed"];

  const { assignments: tasks, isLoading, mutate } = useUserActiveAssignments(taskUrl, user?.employee_id);

  const [selectedTask, setSelectedTask] = useState<Assignment | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [filter, setFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 ring-green-600/20';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 ring-blue-600/20';
      case 'review':
        return 'bg-purple-100 text-purple-800 ring-purple-600/20';
      case 'to do':
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 ring-red-600/20';
      case 'high':
        return 'bg-orange-100 text-orange-800 ring-orange-600/20';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
      case 'low':
        return 'bg-green-100 text-green-800 ring-green-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  const getTimeLeft = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  const handleStatusUpdate = async () => {
    if (!selectedTask || !selectedStatus) return;
    setIsUpdating(true);
    try {
      const response = await fetch(
        `${taskUrl}/api/subtasks/${selectedTask.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: selectedStatus }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Status updated successfully");
        setShowStatusModal(false);
        setSelectedStatus("");
        setSelectedTask(null);
        mutate();  
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status.toLowerCase() === filter.toLowerCase();
  });

  // Loading Skeleton Components
  const StatSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="bg-gray-200 rounded-lg w-12 h-12"></div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    </div>
  );

  const TaskCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="p-6">
        <div className="mb-4">
          <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="mb-6">
          <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
        <div className="h-7 w-7 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
              <div className="flex flex-wrap gap-2 animate-pulse">
                <div className="h-10 bg-gray-200 rounded-lg w-20"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-18"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <StatSkeleton key={index} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, index) => (
              <TaskCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assigned Tasks</h1>
              <p className="mt-1 text-gray-500">Manage and track your assigned tasks</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'all' 
                    ? 'bg-[#ff4e00] text-white shadow-sm' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                All Tasks
              </button>
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status.toLowerCase())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === status.toLowerCase()
                      ? 'bg-[#ff4e00] text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <FiClock className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">To Do</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'To Do').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <FiClock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'In Progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-amber-50 rounded-lg p-3">
                <FiFlag className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 rounded-lg p-3">
                <FiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'Completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 hover:text-[#ff4e00] transition-colors">
                    {task.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-2">Task #{task.id}</p>
                </div>

                <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                  {task.description || "No description provided"}
                </p>

                <div className="space-y-5 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="h-4 w-4 text-gray-400" />
                      <p>{format(new Date(task.deadline), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <FiClock className="h-4 w-4 text-gray-400" />
                      <p className={getTimeLeft(task.deadline) === 'Overdue' ? 'text-red-600 font-medium' : ''}>
                        {getTimeLeft(task.deadline)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <FiFlag className="h-4 w-4 text-gray-400" />
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-500">
                  <span>Est: {task.estimated_hours}h</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setSelectedStatus(task.status);
                      setShowStatusModal(true);
                    }}
                    className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                    title="Update Status"
                  >
                    <FiEdit className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FiAlertCircle className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No tasks found</h3>
            <p className="mt-2 text-gray-500">There are no tasks matching your current filter.</p>
            <button
              onClick={() => setFilter('all')}
              className="mt-4 text-[#ff4e00] font-medium hover:text-[#ff4e00]/80 transition-colors"
            >
              View all tasks
            </button>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Update Task Status</h3>
                <div className="space-y-3">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        selectedStatus === status
                          ? "bg-[#ff4e00]/10 text-[#ff4e00] border-2 border-[#ff4e00]"
                          : "bg-white hover:bg-gray-50 border-2 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          selectedStatus === status ? 'bg-[#ff4e00]' : 'bg-gray-300'
                        }`} />
                        {status}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleStatusUpdate}
                    disabled={isUpdating || !selectedStatus}
                    className="flex-1 bg-[#ff4e00] text-white py-2.5 px-4 rounded-lg hover:bg-[#ff4e00]/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isUpdating ? 'Updating...' : 'Update Status'}
                  </button>
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedStatus('');
                    }}
                    className="flex-1 bg-white text-gray-700 py-2.5 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
