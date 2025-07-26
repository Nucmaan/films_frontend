"use client";

import userAuth from '@/myStore/userAuth';
import { format } from 'date-fns';
import { FiCheckCircle, FiClock, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import { useUserTaskStats, useUserActiveAssignments } from "@/lib/allInOne/page.js";
import VoiceOverArtistDashboardSkeleton from "@/components/VoiceOverArtistDashboardSkeleton";

export default function EditorPage() { 
  const user = userAuth((state) => state.user);
  const taskUrl = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;
  const { stats, isLoading: statsLoading, error: statsError } = useUserTaskStats(taskUrl, user?.employee_id);
  const { assignments, isLoading: tasksLoading, error: tasksError } = useUserActiveAssignments(taskUrl, user?.employee_id);

  if (statsLoading || tasksLoading) {
    return <VoiceOverArtistDashboardSkeleton />;
  }

  if (statsError || tasksError || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg font-medium text-red-600">Error loading task data.</div>
      </div>
    );
  }

  // Filter recent tasks (limit to 10 most recent)
  const recentTasks = assignments ? assignments.slice(0, 10) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "text-[#ff4e00] bg-[#ff4e00]/10";
      case "To Do": return "text-gray-600 bg-gray-100";
      case "Review": return "text-blue-600 bg-blue-100";
      case "Completed": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No due date';
    try {
      return format(new Date(dateString), 'MMM d');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={user?.profile_image || '/default-avatar.png'}
                  alt={user?.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Welcome, {user?.name}</h1>
                <p className="text-sm text-gray-500">Dashboard overview</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <FiCalendar className="h-4 w-4 mr-1.5" />
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </div>
          </div>
        </div>

        {/* Task Statistics - Only showing Total Tasks, In Progress, To Do, Review */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                <p className="text-2xl font-semibold text-gray-900">{(stats["Completed"] ?? 0) + (stats["To Do"] ?? 0) + (stats["In Progress"] ?? 0) + (stats["Review"] ?? 0)}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <FiCheckCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">All assigned tasks</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold text-[#ff4e00]">{stats["In Progress"] ?? 0}</p>
              </div>
              <div className="p-2 bg-[#ff4e00]/10 rounded-lg">
                <FiClock className="h-5 w-5 text-[#ff4e00]" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Currently working</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-500">To Do</p>
                <p className="text-2xl font-semibold text-gray-900">{stats["To Do"] ?? 0}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <FiCalendar className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Pending tasks</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Review</p>
                <p className="text-2xl font-semibold text-blue-600">{stats["Review"] ?? 0}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <FiCheckCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Tasks in review</p>
          </div>
        </div>

        {/* Recent Tasks Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
            <span className="text-sm text-gray-500">{recentTasks.length} tasks</span>
          </div>
          
          <div className="space-y-4">
            {recentTasks.map((task) => (
                              <div key={task.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{task.title || 'Untitled Task'}</h3>
                    <p className="text-sm text-gray-500">
                      Task #{task.id} • Priority: {task.priority || 'Medium'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status || 'To Do')}`}>
                      {task.status || 'To Do'}
                    </span>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Due</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(task.deadline)}
                      </p>
                    </div>
                  </div>
                </div>
            ))}
            
            {recentTasks.length === 0 && (
              <div className="text-center py-8">
                <FiCalendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent tasks found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}