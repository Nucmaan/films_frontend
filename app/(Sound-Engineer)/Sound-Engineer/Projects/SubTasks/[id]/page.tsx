"use client";
import { useParams } from "next/navigation";
import React, { useState, useMemo } from "react";
import useSWR from "swr";
import { FiEdit, FiCheckCircle, FiChevronDown, FiChevronRight, FiTrash2 } from "react-icons/fi"; // Import FiTrash2 icon
import userAuth from "@/myStore/userAuth";
import { useUsers } from "@/service/Authentication.js";

interface User {
  id: number;
  name: string;
  employee_id: string;
  work_experience_level: string;
  role: string;
}

interface Subtask {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  deadline: string;
  estimated_hours: number;
  time_spent: number;
  assignee_name: string;
  assignee_empId: string;
  assignee_expLevel: string;
  assignee_role: string;
  assignedTo_name: string;
  assignedTo_empId: string;
  assignedTo_expLevel: string;
  assignedTo_role: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "To Do":
      return "bg-yellow-100 text-yellow-800";
    case "In Progress":
      return "bg-blue-100 text-blue-800";
    case "Review":
      return "bg-purple-100 text-purple-800";
    case "Completed":
      return "bg-green-100 text-green-800";
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

export default function Page() {
  const params = useParams();
  const taskId = Number(params?.id); // Ensure taskId is a number

  const user = userAuth((state) => state.user);
  const { users, isLoading: usersLoading } = useUsers();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [newSubtask, setNewSubtask] = useState<Partial<Subtask>>({
    status: "To Do",
    priority: "Medium",
    estimated_hours: 0.01,
    time_spent: 0.01,
  });
  const [isCreating, setIsCreating] = useState(false);

  // Group users by role
  const usersByRole = useMemo(() => {
    if (!users) return {};

    const grouped = users.reduce((acc: { [key: string]: User[] }, user: User) => {
      const role = user.role || 'Unassigned';
      if (!acc[role]) {
        acc[role] = [];
      }
      acc[role].push(user);
      return acc;
    }, {});

    return grouped;
  }, [users]);

  const handleCreateSubtask = async () => {
    if (!user) {
      console.error("User not authenticated");
      // Optionally show a notification to the user
      return;
    }
    setIsCreating(true);
    const payload = {
      task_id: taskId,
      title: newSubtask.title,
      description: newSubtask.description,
      status: newSubtask.status,
      priority: newSubtask.priority,
      deadline: newSubtask.deadline,
      estimated_hours: newSubtask.estimated_hours,
      time_spent: newSubtask.time_spent,
      assignee_name: user?.name,
      assignee_empId: user?.employee_id,
      assignee_expLevel: user?.expLevel,
      assignee_role: user?.role,
      assignedTo_name: newSubtask.assignedTo_name,
      assignedTo_empId: newSubtask.assignedTo_empId,
      assignedTo_expLevel: newSubtask.assignedTo_expLevel,
      assignedTo_role: newSubtask.assignedTo_role,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_TASK_SERVICE_URL}/api/subtasks/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create subtask");
      }

      const data = await res.json();
      console.log("Subtask created successfully:", data);
      setIsAddModalOpen(false);
      console.log("Modal closed");
      setNewSubtask({
        status: "To Do",
        priority: "Medium",
        estimated_hours: 0,
        time_spent: 0,
      }); // Reset form fields
      setSelectedRole("");
      setExpandedRoles(new Set());
      await mutate(undefined, true); // Force revalidation from server
      console.log("SWR mutate called and list refreshed");
    } catch (error) {
      console.error("Error creating subtask:", error);
      // Optionally show an error notification to the user
    } finally {
      setIsCreating(false);
    }
  };

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_TASK_SERVICE_URL}/api/subtasks/task/${taskId}/subtasks`,
    fetcher
  );

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editFields, setEditFields] = useState<Partial<Subtask>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleAssignedToChange = (user: User) => {
    setNewSubtask((prev) => ({
      ...prev,
      assignedTo_name: user.name,
      assignedTo_empId: user.employee_id,
      assignedTo_expLevel: user.work_experience_level,
      assignedTo_role: user.role,
    }));
    setIsRoleDropdownOpen(false);
  };

  const toggleRoleExpansion = (role: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(role)) {
      newExpanded.delete(role);
    } else {
      newExpanded.add(role);
    }
    setExpandedRoles(newExpanded);
  };

  const handleEditClick = (idx: number) => {
    setEditingIndex(idx);
    setEditFields({ ...subtasks[idx] });
  };

  const handleSave = async () => {
    if (editingIndex === null) return;
    setIsSaving(true);
    const subtask = subtasks[editingIndex];
    try {
      const payload: any = {
        title: editFields.title,
        description: editFields.description,
        status: editFields.status,
        priority: editFields.priority,
        deadline: editFields.deadline,
      };
      if (typeof editFields.estimated_hours === "number") {
        payload.estimated_hours = editFields.estimated_hours;
      } else {
        payload.estimated_hours = 0;
      }
      if (typeof editFields.time_spent === "number") {
        payload.time_spent = editFields.time_spent;
      } else {
        payload.time_spent = 0;
      }
      await fetch(
        `${process.env.NEXT_PUBLIC_TASK_SERVICE_URL}/api/subtasks/${subtask.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      setEditingIndex(null);
      setEditFields({});
      mutate();
    } catch (e) {
      console.error("Error saving subtask:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    if (window.confirm("Are you sure you want to delete this subtask?")) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_TASK_SERVICE_URL}/api/subtasks/${subtaskId}`,
          {
            method: "DELETE",
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to delete subtask");
        }

        console.log("Subtask deleted successfully");
        mutate(); // Refresh the list after deletion
      } catch (error) {
        console.error("Error deleting subtask:", error);
        // Optionally show an error notification to the user
      }
    }
  };

  if (error) {
    return <div className="p-6">Failed to load subtasks.</div>;
  }

  const subtasks: Subtask[] = data?.subtasks || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subtasks</h1>
        <button
          className="bg-[#ff4e00] text-white px-4 py-2 rounded hover:bg-[#ff4e00]/90"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Subtask
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{subtasks.length}</div>
          <div className="text-sm text-gray-600">Total Subtasks</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {new Set([
              ...subtasks.map(task => task.assignee_name).filter(Boolean),
              ...subtasks.map(task => task.assignedTo_name).filter(Boolean)
            ]).size}
          </div>
          <div className="text-sm text-gray-600">Total People</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {subtasks.filter(task => task.status === "Completed").length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {subtasks.filter(task => task.status === "In Progress").length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {subtasks.filter(task => task.status === "To Do").length}
          </div>
          <div className="text-sm text-gray-600">To Do</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spent Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subtasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FiCheckCircle className="w-12 h-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-600 mb-1">
                        No subtasks found
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Add subtasks to help organize your work
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                subtasks.map((subtask, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {subtask.assignee_name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {subtask.title}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {formatDate(subtask.deadline)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {subtask.estimated_hours}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {subtask.time_spent}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {subtask.priority}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(
                          subtask.status
                        )}`}
                      >
                        {subtask.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {subtask.assignedTo_name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right flex items-center gap-2"> {/* Added flex and gap for icons */}
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEditClick(idx)}
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteSubtask(subtask.id)} // Delete button
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {editingIndex !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 p-8">
            <h3 className="text-2xl font-semibold mb-6">Edit Subtask</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  placeholder="Enter subtask title"
                  value={editFields.title || ""}
                  onChange={(e) =>
                    setEditFields((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  placeholder="Enter subtask description"
                  rows={3}
                  value={editFields.description || ""}
                  onChange={(e) =>
                    setEditFields((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  value={editFields.status || ""}
                  onChange={(e) =>
                    setEditFields((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  value={editFields.priority || ""}
                  onChange={(e) =>
                    setEditFields((f) => ({ ...f, priority: e.target.value }))
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                <input
                  type="datetime-local"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  value={
                    editFields.deadline
                      ? new Date(editFields.deadline).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setEditFields((f) => ({ ...f, deadline: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Actual Hours</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  placeholder="Enter Actual hours"
                  value={editFields.estimated_hours ?? ""}
                  onChange={(e) =>
                    setEditFields((f) => ({
                      ...f,
                      estimated_hours: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Spent</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  placeholder="Enter time spent"
                  value={editFields.time_spent ?? ""}
                  onChange={(e) =>
                    setEditFields((f) => ({
                      ...f,
                      time_spent: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                onClick={() => setEditingIndex(null)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#ff4e00]/90 transition-colors"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subtask Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Add Subtask</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Enter subtask title"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  value={newSubtask.title || ""}
                  onChange={(e) =>
                    setNewSubtask((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Enter subtask description"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  value={newSubtask.description || ""}
                  onChange={(e) =>
                    setNewSubtask((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  value={newSubtask.status || "To Do"}
                  onChange={(e) =>
                    setNewSubtask((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  value={newSubtask.priority || "Medium"}
                  onChange={(e) =>
                    setNewSubtask((prev) => ({ ...prev, priority: e.target.value }))
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                {usersLoading ? (
                  <p className="text-gray-500">Loading users...</p>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent text-left flex justify-between items-center bg-white"
                      onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    >
                      <span className="text-gray-700">
                        {newSubtask.assignedTo_name || "Select Assigned To"}
                      </span>
                      <FiChevronDown className={`transform transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isRoleDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {Object.entries(usersByRole).map(([role, roleUsers]) => {
                          const users = roleUsers as User[];
                          return (
                            <div key={role}>
                              <button
                                type="button"
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex justify-between items-center border-b border-gray-100"
                                onClick={() => toggleRoleExpansion(role)}
                              >
                                <div className="flex items-center gap-2">
                                  {expandedRoles.has(role) ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                                  <span className="font-medium text-gray-900">{role}</span>
                                  <span className="text-sm text-gray-500">({users.length})</span>
                                </div>
                              </button>

                              {expandedRoles.has(role) && (
                                <div className="bg-gray-50">
                                  {users.map((user: User) => (
                                    <button
                                      key={user.id}
                                      type="button"
                                      className="w-full px-8 py-2 text-left hover:bg-gray-100 text-gray-700 text-sm"
                                      onClick={() => handleAssignedToChange(user)}
                                    >
                                      {user.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                <input
                  type="datetime-local"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  value={newSubtask.deadline || ""}
                  onChange={(e) =>
                    setNewSubtask((prev) => ({
                      ...prev,
                      deadline: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Actual Hours</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  value={newSubtask.estimated_hours ?? ""}
                  onChange={(e) =>
                    setNewSubtask((prev) => ({
                      ...prev,
                      estimated_hours: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Spent</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  value={newSubtask.time_spent ?? ""}
                  onChange={(e) =>
                    setNewSubtask((prev) => ({
                      ...prev,
                      time_spent: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewSubtask({
                    status: "To Do",
                    priority: "Medium",
                    estimated_hours: 0,
                    time_spent: 0,
                  });
                }}
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#ff4e00]/90 transition-colors"
                onClick={handleCreateSubtask}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}