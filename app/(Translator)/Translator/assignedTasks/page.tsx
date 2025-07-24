"use client";
import userAuth from '@/myStore/userAuth';
import React, { useState } from "react";
import { FiEdit } from "react-icons/fi";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "To Do":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  if (isLoading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">My Assignment Subtasks</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{task.title}</h2>
                <p className="text-gray-600 mb-2">{task.description}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>{task.status}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "N/A"}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Est. Hours: {task.estimated_hours}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    Time Spent: {task.time_spent ?? 0}
                  </span>
                </div>
                {task.createdAt && (
                  <p className="text-xs text-gray-500">
                    Created: {format(new Date(task.createdAt), "MMM dd, yyyy")}
                  </p>
                )}
                {task.updatedAt && (
                  <p className="text-xs text-gray-500">
                    Updated: {format(new Date(task.updatedAt), "MMM dd, yyyy")}
                  </p>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setSelectedStatus(task.status);
                    setShowStatusModal(true);
                  }}
                  className="p-2 rounded-xl bg-white border hover:bg-gray-50 shadow transition-all duration-300"
                  title="Edit Status"
                >
                  <FiEdit className="h-5 w-5 text-gray-500 hover:text-[#ff4e00] transition-colors" />
                </button>
              </div>
            </div>
          ))}
        </div>

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
                        <div
                          className={`w-2 h-2 rounded-full mr-3 ${
                            selectedStatus === status ? "bg-[#ff4e00]" : "bg-gray-300"
                          }`}
                        />
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
                    {isUpdating ? "Updating..." : "Update Status"}
                  </button>
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedStatus("");
                      setSelectedTask(null);
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
