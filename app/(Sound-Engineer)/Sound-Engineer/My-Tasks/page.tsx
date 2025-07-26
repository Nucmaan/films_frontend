"use client";

import userAuth from '@/myStore/userAuth';
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FiCheckCircle, FiCalendar, FiClock, FiAlertCircle } from 'react-icons/fi';
import { useUserCompletedTasks } from "@/lib/allInOne/page.js";

interface TaskAssignment {
  file_url: string[];
  id: number;
  task_id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  deadline: string;
  estimated_hours: number;
  time_spent: number;
  start_time: string;
  completed_at: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function MyTasksPage() {
  const user = userAuth((state) => state.user);
  const taskUrl = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;
  const { tasks: originalTasks, isLoading, error } = useUserCompletedTasks(taskUrl, user?.employee_id);
  
  const [filteredTasks, setFilteredTasks] = useState<TaskAssignment[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(new Date());
  const [selectedTask, setSelectedTask] = useState<TaskAssignment | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    filterTasks();
  }, [originalTasks, selectedMonth]);

  const filterTasks = () => {
    let filtered = [...(originalTasks || [])];

    if (selectedMonth) {
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.updatedAt || task.createdAt);
        return taskDate.getMonth() === selectedMonth.getMonth() &&
               taskDate.getFullYear() === selectedMonth.getFullYear();
      });
    }

    setFilteredTasks(filtered);
  };

  const getPriorityColor = (priority: string | undefined) => {
    if (!priority) return 'bg-gray-500 text-white';
    
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleTaskClick = (task: TaskAssignment) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const getMimeType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'mp4':
        return 'video/mp4';
      case 'webm':
        return 'video/webm';
      default:
        return 'application/octet-stream';
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType.startsWith('video/')) {
      return '🎥';
    } else if (mimeType === 'application/pdf') {
      return '📄';
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return '📝';
    } else if (mimeType.includes('excel') || mimeType.includes('sheet')) {
      return '📊';
    } else {
      return '📁';
    }
  };

  const FilePreview = ({ url, mimeType, fileName }: { url: string; mimeType: string; fileName: string }) => {
    if (mimeType.startsWith('image/')) {
      return (
        <div className="relative group w-full h-48 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={url}
            alt={fileName}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg transition-opacity duration-200"
            >
              View Full Size
            </a>
          </div>
        </div>
      );
    } else if (mimeType.startsWith('video/')) {
      return (
        <div className="w-full rounded-lg overflow-hidden bg-black">
          <video controls className="w-full">
            <source src={url} type={mimeType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-2xl">{getFileIcon(mimeType)}</span>
          <div>
            <p className="font-medium text-gray-900">{fileName}</p>
            <p className="text-sm text-gray-500">Click to download</p>
          </div>
        </a>
      );
    }
  };

  const isOverdue = (deadline: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  // Loading Skeleton Component
  const TaskSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Title Skeleton */}
          <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3"></div>
          
          {/* Badges Skeleton */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full w-32"></div>
          </div>

          {/* Details Skeleton */}
          <div className="flex items-center gap-4 mb-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-36"></div>
          </div>

          {/* Description Skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>

      {/* Attachments Skeleton */}
      <div className="mt-4">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="flex gap-2">
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          {/* Header Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded-lg w-48"></div>
              </div>
            </div>
          </div>

          {/* Tasks Grid Skeleton */}
          <div className="grid gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <TaskSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Completed Tasks
              </h1>
              <p className="text-gray-600 mt-1">
                View all your completed tasks ({filteredTasks.length} tasks)
              </p>
            </div>
            
            {/* Month Filter */}
            <div className="flex items-center gap-2">
              <FiCalendar className="text-gray-400" />
              <input
                type="month"
                value={selectedMonth ? format(selectedMonth, 'yyyy-MM') : ''}
                onChange={(e) => setSelectedMonth(e.target.value ? new Date(e.target.value) : undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleTaskClick(task)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {task.title}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {/* Status Badge */}
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <FiCheckCircle className="w-4 h-4 mr-1" />
                      Completed
                    </span>
                    
                    {/* Priority Badge */}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>

                    {/* Deadline */}
                    {task.deadline && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        isOverdue(task.deadline) 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        <FiCalendar className="w-4 h-4 mr-1" />
                        Deadline: {format(new Date(task.deadline), 'MMM dd, yyyy')}
                        {isOverdue(task.deadline) && (
                          <FiAlertCircle className="w-4 h-4 ml-1 text-red-600" />
                        )}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {task.estimated_hours}h estimated
                    </span>
                    <span>
                      Completed: {format(new Date(task.updatedAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-gray-600 mt-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {/* File attachments preview */}
              {task.file_url && task.file_url.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Attachments ({task.file_url.length})
                  </p>
                  <div className="flex gap-2 overflow-x-auto">
                    {task.file_url.slice(0, 3).map((url, index) => {
                      const fileName = url.split('/').pop() || 'file';
                      const mimeType = getMimeType(fileName);
                      return (
                        <div key={index} className="flex-shrink-0">
                          <span className="text-lg">{getFileIcon(mimeType)}</span>
                        </div>
                      );
                    })}
                    {task.file_url.length > 3 && (
                      <span className="text-sm text-gray-500 flex items-center">
                        +{task.file_url.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <FiCheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed tasks found</h3>
              <p className="text-gray-500">
                {selectedMonth 
                  ? `No completed tasks found for ${format(selectedMonth, 'MMMM yyyy')}`
                  : 'No completed tasks found'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTask.title}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <FiCheckCircle className="w-4 h-4 mr-1" />
                      Completed
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedTask.priority)}`}>
                      {selectedTask.priority}
                    </span>
                    {selectedTask.deadline && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        isOverdue(selectedTask.deadline) 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        <FiCalendar className="w-4 h-4 mr-1" />
                        Deadline: {format(new Date(selectedTask.deadline), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedTask.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedTask.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Estimated Hours</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedTask.estimated_hours}h</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Completed On</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {format(new Date(selectedTask.updatedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                {selectedTask.start_time && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Start Time</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {format(new Date(selectedTask.start_time), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                {selectedTask.deadline && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Deadline</h3>
                    <p className={`text-lg font-semibold ${
                      isOverdue(selectedTask.deadline) ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {format(new Date(selectedTask.deadline), 'MMM dd, yyyy HH:mm')}
                      {isOverdue(selectedTask.deadline) && (
                        <span className="ml-2 text-sm text-red-500">(Was overdue)</span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* File Attachments */}
              {selectedTask.file_url && selectedTask.file_url.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Attachments ({selectedTask.file_url.length})
                  </h3>
                  <div className="grid gap-4">
                    {selectedTask.file_url.map((url, index) => {
                      const fileName = url.split('/').pop() || `file-${index}`;
                      const mimeType = getMimeType(fileName);
                      return (
                        <FilePreview
                          key={index}
                          url={url}
                          mimeType={mimeType}
                          fileName={fileName}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}