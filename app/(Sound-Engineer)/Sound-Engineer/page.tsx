"use client";

import userAuth from '@/myStore/userAuth';
import { format } from 'date-fns';
import { FiCheckCircle, FiClock, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import { useUserTaskStats } from "@/lib/allInOne/page.js";
import VoiceOverArtistDashboardSkeleton from "@/components/VoiceOverArtistDashboardSkeleton";

export default function SoundEngineerPage() { 
  const user = userAuth((state) => state.user);
  const taskUrl = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;
  const { stats, isLoading, error } = useUserTaskStats(taskUrl, user?.employee_id);

  if (isLoading) {
    return <VoiceOverArtistDashboardSkeleton />;
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg font-medium text-red-600">Error loading task stats.</div>
      </div>
    );
  }

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

        {/* Task Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
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
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-green-600">{stats["Completed"] ?? 0}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <FiCheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Successfully completed</p>
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
      </div>
    </div>
  );
}