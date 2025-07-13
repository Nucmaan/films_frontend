"use client";

import userAuth from '@/myStore/userAuth';
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FiClock, FiCalendar, FiFlag, FiCheckCircle, FiAlertCircle, FiFileText, FiExternalLink, FiEdit, FiUpload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Assignment {
  id: number;
  task_id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  deadline: string;
  estimated_hours: number;
  completed_at: string | null;
  createdAt: string;
  updatedAt: string;
  file_url: string;
}

export default function AssignedTasksPage() {
  const user = userAuth((state) => state.user);
  const [tasks, setTasks] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Assignment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const taskUrl = process.env.NEXT_PUBLIC_TASK_SERVICE_URL; 

  const statusOptions = ["In Progress", "To Do"];

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    }
  }, [user?.id]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${taskUrl}/api/task-assignment/userAssignments/${user?.id}`);
      const data = await response.json();
      if (data.success) {
         const nonCompletedTasks = data.assignments.filter((task: Assignment) => task.status !== 'Completed');
        setTasks(nonCompletedTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${taskUrl}/api/task-assignment/task_status_update/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Status updated successfully');
        fetchTasks(); // Refresh tasks
        setShowStatusModal(false);
        setSelectedStatus('');
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Error updating status');
    } finally {
      setIsUpdating(false);
    }
  };

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

  const parseFileUrls = (fileUrlString: string) => {
    if (!fileUrlString) return [];
    
    try {
      // Check if it looks like a JSON array
      if (fileUrlString.trim().startsWith('[')) {
        return JSON.parse(fileUrlString);
      } else {
        // It's a plain URL string, so return it as an array
        return [fileUrlString];
      }
    } catch (error) {
      console.error('Error parsing file URLs:', error);
      // If parsing fails, treat it as a single URL
      return [fileUrlString];
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.id.toString().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleSubmitTask = async () => {
    if (!selectedTask || !selectedFiles) {
      toast.error('Please select files to submit');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    
    // Append the file to FormData with the correct field name
    if (selectedFiles[0]) {
      formData.append('file_url', selectedFiles[0]);
    }

    formData.append('updated_by', user?.id.toString() || '');
    formData.append('status', 'Completed');

    try {
      const response = await fetch(`${taskUrl}/api/task-assignment/submitTask/${selectedTask.id}`, {
        method: 'PUT', // Changed to PUT method
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Task submitted successfully');
        setShowModal(false);
        setSelectedFiles(null);
        fetchTasks(); // Refresh the task list
      } else {
        toast.error(data.message || 'Failed to submit task');
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      toast.error('Error submitting task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff4e00]"></div>
          <p className="text-gray-500 font-medium">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff4e00]/5 to-blue-500/5"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#ff4e00] to-orange-600 rounded-xl shadow-lg">
                    <FiFileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      My Tasks Dashboard
                    </h1>
                    <p className="text-gray-600 flex items-center gap-2">
                      <span>Manage and track your assigned tasks</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {filteredTasks.length} active
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiClock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search tasks by title, description, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 border border-gray-200/50 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff4e00]/20 focus:border-[#ff4e00]/30 transition-all duration-300"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      <FiX className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setFilter('all')}
                    className={`group px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      filter === 'all' 
                        ? 'bg-gradient-to-r from-[#ff4e00] to-orange-600 text-white shadow-lg shadow-orange-500/25' 
                        : 'bg-white/70 text-gray-700 hover:bg-white hover:shadow-lg border border-gray-200/50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <FiClock className="h-4 w-4" />
                      All Tasks
                      <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20">
                        {tasks.length}
                      </span>
                    </span>
                  </button>
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status.toLowerCase())}
                      className={`group px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                        filter === status.toLowerCase()
                          ? 'bg-gradient-to-r from-[#ff4e00] to-orange-600 text-white shadow-lg shadow-orange-500/25'
                          : 'bg-white/70 text-gray-700 hover:bg-white hover:shadow-lg border border-gray-200/50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {status === 'In Progress' ? <FiClock className="h-4 w-4" /> : <FiFlag className="h-4 w-4" />}
                        {status}
                        <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20">
                          {tasks.filter(t => t.status === status).length}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300">
                  <FiClock className="h-6 w-6 text-gray-600" />
                </div>
                <div className="text-right">
                  <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full transition-all duration-1000"
                      style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'To Do').length / tasks.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">To Do Tasks</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                  {tasks.filter(t => t.status === 'To Do').length}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'To Do').length / tasks.length) * 100) : 0}% of total
                </p>
              </div>
            </div>
          </div>
          
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300">
                  <FiClock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="w-12 h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-1000 animate-pulse"
                      style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'In Progress').length / tasks.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                  {tasks.filter(t => t.status === 'In Progress').length}
                </p>
                <p className="text-xs text-blue-400 mt-1">
                  Active work in progress
                </p>
              </div>
            </div>
          </div>
          
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300">
                  <FiFlag className="h-6 w-6 text-amber-600" />
                </div>
                <div className="text-right">
                  <div className="w-12 h-2 bg-amber-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000"
                      style={{ width: `${tasks.length > 0 ? ((tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length) / tasks.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">High Priority</p>
                <p className="text-3xl font-bold text-amber-600 group-hover:text-amber-700 transition-colors">
                  {tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length}
                </p>
                <p className="text-xs text-amber-400 mt-1">
                  Needs immediate attention
                </p>
              </div>
            </div>
          </div>
          
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300">
                  <FiCheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="w-12 h-2 bg-green-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-1000"
                      style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'Completed').length / (tasks.length + tasks.filter(t => t.status === 'Completed').length)) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600 group-hover:text-green-700 transition-colors">
                  {tasks.filter(t => t.status === 'Completed').length}
                </p>
                <p className="text-xs text-green-400 mt-1">
                  Successfully finished
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task, index) => (
            <div
              key={task.id}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02]"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => {
                setSelectedTask(task);
                setShowModal(true);
              }}
            >
              {/* Priority Indicator */}
              <div className={`absolute top-0 left-0 w-full h-1 ${
                task.priority === 'Critical' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                task.priority === 'High' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                task.priority === 'Medium' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                'bg-gradient-to-r from-green-500 to-green-600'
              }`}></div>

              {/* Hover Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff4e00]/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-xl shadow-sm ${
                        task.status === 'In Progress' ? 'bg-blue-100' :
                        task.status === 'To Do' ? 'bg-gray-100' :
                        'bg-green-100'
                      }`}>
                        {task.status === 'In Progress' ? 
                          <FiClock className="h-4 w-4 text-blue-600" /> :
                          task.status === 'To Do' ? 
                          <FiAlertCircle className="h-4 w-4 text-gray-600" /> :
                          <FiCheckCircle className="h-4 w-4 text-green-600" />
                        }
                      </div>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        #{task.id}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#ff4e00] transition-colors duration-300 line-clamp-2">
                      {task.title}
                    </h2>
                  </div>
                  
                  <div className="ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTask(task);
                        setSelectedStatus(task.status);
                        setShowStatusModal(true);
                      }}
                      className="p-2 rounded-xl bg-white/50 hover:bg-white hover:shadow-md transition-all duration-300 group/btn"
                      title="Update Status"
                    >
                      <FiEdit className="h-4 w-4 text-gray-500 group-hover/btn:text-[#ff4e00] transition-colors" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {task.description || "No description provided"}
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FiCalendar className="h-4 w-4 text-gray-400" />
                      <span>{format(new Date(task.deadline), 'MMM dd')}</span>
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                      getTimeLeft(task.deadline) === 'Overdue' ? 'bg-red-100 text-red-600' :
                      getTimeLeft(task.deadline).includes('today') ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {getTimeLeft(task.deadline)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FiClock className="h-4 w-4 text-gray-400" />
                      <span>{task.estimated_hours}h estimated</span>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  
                  {parseFileUrls(task.file_url).length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <FiFileText className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">{parseFileUrls(task.file_url).length} files</span>
                      <div className="flex-1 text-right">
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          Attached
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">Progress</span>
                    <span className="text-xs font-medium text-gray-700">
                      {task.status === 'Completed' ? '100%' : 
                       task.status === 'In Progress' ? '60%' : 
                       task.status === 'Review' ? '90%' : '0%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        task.status === 'Completed' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                        task.status === 'In Progress' ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                        task.status === 'Review' ? 'bg-gradient-to-r from-purple-400 to-purple-500' :
                        'bg-gradient-to-r from-gray-400 to-gray-500'
                      }`}
                      style={{ 
                        width: task.status === 'Completed' ? '100%' : 
                               task.status === 'In Progress' ? '60%' : 
                               task.status === 'Review' ? '90%' : '0%' 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-t border-gray-200/50 flex justify-between items-center backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-300 ${getStatusColor(task.status)} group-hover:shadow-sm`}>
                    {task.status === 'In Progress' && <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>}
                    {task.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiExternalLink className="h-4 w-4 text-gray-400 group-hover:text-[#ff4e00] transition-colors" />
                  <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                    View Details
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-blue-50/30"></div>
            <div className="relative z-10">
              <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6 shadow-sm">
                <FiAlertCircle className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery ? 'No matching tasks found' : 'No tasks available'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? `No tasks match your search "${searchQuery}". Try adjusting your search terms or filters.`
                  : 'There are no tasks matching your current filter. Try selecting a different filter or check back later.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-3 bg-gradient-to-r from-[#ff4e00] to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Clear Search
                  </button>
                )}
                <button
                  onClick={() => {
                    setFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 hover:shadow-md transition-all duration-300 transform hover:scale-105"
                >
                  View All Tasks
                </button>
              </div>
            </div>
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
                          ? 'bg-[#ff4e00]/10 text-[#ff4e00] border-2 border-[#ff4e00]'
                          : 'bg-white hover:bg-gray-50 border-2 border-gray-200'
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
                    onClick={() => {
                      if (selectedTask && selectedStatus) {
                        updateTaskStatus(selectedTask.id, selectedStatus);
                      }
                    }}
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

        {/* Task Details Modal */}
        {showModal && selectedTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">{selectedTask.title}</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Task #{selectedTask.id}</p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedTask.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(selectedTask.status)}`}>
                        {selectedTask.status}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Priority</h3>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getPriorityColor(selectedTask.priority)}`}>
                        {selectedTask.priority}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Deadline</h3>
                      <div className="flex items-center">
                        <FiCalendar className="mr-2 h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{format(new Date(selectedTask.deadline), 'MMM dd, yyyy')}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{getTimeLeft(selectedTask.deadline)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Estimated Time</h3>
                      <div className="flex items-center">
                        <FiClock className="mr-2 h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{selectedTask.estimated_hours} hours</p>
                      </div>
                    </div>
                  </div>

                  {/* Attachments */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Attachments</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {parseFileUrls(selectedTask.file_url).map((url: string, index: number) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <FiFileText className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600 flex-1 truncate">
                            {url.split('/').pop()}
                          </span>
                          <FiExternalLink className="h-4 w-4 text-gray-400" />
                        </a>
                      ))}
                      {parseFileUrls(selectedTask.file_url).length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No attachments</p>
                      )}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
                      <p className="text-gray-900">{format(new Date(selectedTask.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Last Updated</h3>
                      <p className="text-gray-900">{format(new Date(selectedTask.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                  </div>

                  {/* Submit Task Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Task</h3>
                    
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        
                        <div className="text-center">
                          <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4 flex justify-center text-sm leading-6 text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md bg-white font-semibold text-[#ff4e00] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#ff4e00] focus-within:ring-offset-2 hover:text-[#ff4e00]/80"
                            >
                              <span onClick={() => fileInputRef.current?.click()}>Select file</span>
                            </label>
                          </div>
                          <p className="text-xs leading-5 text-gray-600 mt-2">Upload your completed task file</p>
                        </div>

                        {selectedFiles && selectedFiles.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Selected File:</h4>
                            <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              <FiFileText className="mr-2 h-4 w-4" />
                              <span className="flex-1 truncate">{selectedFiles[0].name}</span>
                              <button
                                onClick={() => setSelectedFiles(null)}
                                className="ml-2 text-gray-500 hover:text-gray-700"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setShowModal(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff4e00] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmitTask}
                          disabled={isSubmitting || !selectedFiles}
                          className="px-4 py-2 text-sm font-medium text-white bg-[#ff4e00] rounded-md hover:bg-[#ff4e00]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff4e00] disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Submitting...
                            </span>
                          ) : (
                            'Submit Task'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
