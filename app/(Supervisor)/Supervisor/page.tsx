"use client";

import React from "react";
import {
  FiUsers,
  FiLayers,
  FiCalendar,
  FiCheckCircle,
} from "react-icons/fi";
import UserRangs from "@/components/RangeSuperVisor";
import {
  useUserDashboard,
  useProjectDashboard,
  useTaskDashboard,
  useSubtaskDashboard,
} from "@/service/Dashboard/analytics.js";

export default function AdminDashboard() {
  const { data: userData, isLoading: loadingUsers } = useUserDashboard();
  const { data: projectData, isLoading: loadingProjects } = useProjectDashboard();
  const { data: taskData, isLoading: loadingTasks } = useTaskDashboard();
  const { data: subtaskData, isLoading: loadingSubtasks } = useSubtaskDashboard();

  const loading = loadingUsers || loadingProjects || loadingTasks || loadingSubtasks;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                <p className="text-3xl font-bold mt-2">
                  {loading ? "..." : userData?.totalUsers ?? 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiUsers className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Total Projects</h3>
                <p className="text-3xl font-bold mt-2">
                  {loading ? "..." : projectData?.totalProjects ?? 0}
                </p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <FiLayers className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Total Tasks</h3>
                <p className="text-3xl font-bold mt-2">
                  {loading ? "..." : taskData?.count ?? 0}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FiCalendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Total Subtasks</h3>
                <p className="text-3xl font-bold mt-2">
                  {loading ? "..." : subtaskData?.count ?? 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
        <UserRangs /> 
      </div>
    </div>
  );
}
