"use client";

import userAuth from '@/myStore/userAuth';
  import { useUserCompletedTasks } from "@/lib/allInOne/page.js";
import VoiceOverArtistMyTasksSkeleton from "@/components/VoiceOverArtistMyTasksSkeleton";


export default function MyTasksPage() {
  const user = userAuth((state) => state.user);
  const taskUrl = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;
  const { tasks, isLoading, error } = useUserCompletedTasks(taskUrl, user?.employee_id);
 

  if (isLoading) {
    return <VoiceOverArtistMyTasksSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Completed Tasks</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h2>
              <p className="text-gray-600 mb-2">{task.description}</p>
              <div className="flex flex-wrap gap-4 mt-2">
                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-700">Status: {task.status}</span>
                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-orange-100 text-orange-700">Priority: {task.priority}</span>
                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-700">Actual Hours: {task.estimated_hours}</span>
                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700">Time Spent: {task.time_spent}</span>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center col-span-3">
              <h3 className="text-lg font-semibold text-gray-900">No tasks found</h3>
              <p className="mt-2 text-gray-500">You have no completed tasks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}