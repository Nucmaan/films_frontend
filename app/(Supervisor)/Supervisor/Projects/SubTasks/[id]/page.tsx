"use client";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import useSWR from "swr";
import { FiEdit, FiCheckCircle } from "react-icons/fi";
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
  const [newSubtask, setNewSubtask] = useState<Partial<Subtask>>({
    status: "To Do",
    priority: "Medium",
    estimated_hours: 0.01,
    time_spent: 0.01,
  });

  const handleCreateSubtask = async () => {
    if (!user) {
      console.error("User not authenticated");
      // Optionally show a notification to the user
      return;
    }

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
      setNewSubtask({
        status: "To Do",
        priority: "Medium",
        estimated_hours: 0,
        time_spent: 0,
      }); // Reset form fields
      mutate(); // Refresh the list
    } catch (error) {
      console.error("Error creating subtask:", error);
      // Optionally show an error notification to the user
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

  const handleAssignedToChange = (userId: string) => {
    const selectedUser = users.find((u: User) => u.id === Number(userId));
    if (selectedUser) {
      setNewSubtask((prev) => ({
        ...prev,
        assignedTo_name: selectedUser.name,
        assignedTo_empId: selectedUser.employee_id,
        assignedTo_expLevel: selectedUser.work_experience_level,
        assignedTo_role: selectedUser.role,
      }));
    }
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
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
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
                Assignee
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
                <td colSpan={10} className="px-6 py-10 text-center">
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
                    {subtask.title}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {subtask.description}
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
                    {subtask.priority}
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
                    {subtask.assignee_name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {subtask.assignedTo_name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEditClick(idx)}
                    >
                      <FiEdit size={16} /> Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {editingIndex !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Subtask</h3>
            <div className="space-y-4">
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Title"
                value={editFields.title || ""}
                onChange={(e) =>
                  setEditFields((f) => ({ ...f, title: e.target.value }))
                }
              />
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Description"
                value={editFields.description || ""}
                onChange={(e) =>
                  setEditFields((f) => ({ ...f, description: e.target.value }))
                }
              />
              <select
                className="w-full p-2 border rounded"
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
              <select
                className="w-full p-2 border rounded"
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
              <input
                type="datetime-local"
                className="w-full p-2 border rounded"
                value={
                  editFields.deadline
                    ? new Date(editFields.deadline).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setEditFields((f) => ({ ...f, deadline: e.target.value }))
                }
              />
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="Actual Time"
                value={editFields.estimated_hours ?? ""}
                onChange={(e) =>
                  setEditFields((f) => ({
                    ...f,
                    estimated_hours: Number(e.target.value),
                  }))
                }
              />
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="Spent Time"
                value={editFields.time_spent ?? ""}
                onChange={(e) =>
                  setEditFields((f) => ({
                    ...f,
                    time_spent: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-200"
                onClick={() => setEditingIndex(null)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-[#ff4e00] text-white"
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Subtask</h2>
            <input
              type="text"
              placeholder="Title"
              className="w-full p-2 border rounded mb-3"
              value={newSubtask.title || ""}
              onChange={(e) =>
                setNewSubtask((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <textarea
              placeholder="Description"
              className="w-full p-2 border rounded mb-3"
              value={newSubtask.description || ""}
              onChange={(e) =>
                setNewSubtask((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
            <select
              className="w-full p-2 border rounded mb-3"
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
            <select
              className="w-full p-2 border rounded mb-3"
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
            {usersLoading ? (
              <p>Loading users...</p>
            ) : (
              <select
                className="w-full p-2 border rounded mb-3"
                onChange={(e) => handleAssignedToChange(e.target.value)}
                value={
                  users.find((u: User) => u.employee_id === newSubtask.assignedTo_empId)?.id || ""
                } // Set selected value based on assignedTo_empId
              >
                <option value="">Select Assigned To</option>
                {users.map((u: User) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            )}
            <input
              type="datetime-local"
              className="w-full p-2 border rounded mb-3"
              value={newSubtask.deadline || ""}
              onChange={(e) =>
                setNewSubtask((prev) => ({
                  ...prev,
                  deadline: e.target.value,
                }))
              }
            />
            <input
              type="number"
              placeholder="Estimated Hours"
              className="w-full p-2 border rounded mb-3"
              value={newSubtask.estimated_hours ?? ""}
              onChange={(e) =>
                setNewSubtask((prev) => ({
                  ...prev,
                  estimated_hours: Number(e.target.value),
                }))
              }
            />
            <input
              type="number"
              placeholder="Time Spent"
              className="w-full p-2 border rounded mb-3"
              value={newSubtask.time_spent ?? ""}
              onChange={(e) =>
                setNewSubtask((prev) => ({
                  ...prev,
                  time_spent: Number(e.target.value),
                }))
              }
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewSubtask({ // Reset new subtask state when closing the modal
                    status: "To Do",
                    priority: "Medium",
                    estimated_hours: 0,
                    time_spent: 0,
                  });
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#ff4e00] text-white rounded"
                onClick={handleCreateSubtask}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}