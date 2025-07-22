"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { FiEdit, FiEye, FiX, FiUpload, FiTrash2, FiSearch, FiPlus, FiUser, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Authentication, { useUsers } from "@/service/Authentication";

const ROLES = ["User", "Admin", "Translator", "Supervisor", "Voice-over Artist", "Sound Engineer", "Editor", "Playout", "Interpreter"];

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-800",
  Supervisor: "bg-indigo-100 text-indigo-800", 
  Translator: "bg-blue-100 text-blue-800",
  "Voice-over Artist": "bg-teal-100 text-teal-800",
  "Sound Engineer": "bg-green-100 text-green-800",
  Editor: "bg-amber-100 text-amber-800",
  User: "bg-sky-100 text-sky-800",
  Playout: "bg-pink-100 text-pink-800",
  Interpreter: "bg-rose-100 text-rose-800"
};

const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior Level"];

const getInitials = (name: string) => {
  if (!name) return "?";
  const names = name.split(' ');
  return names.length === 1 
    ? names[0][0].toUpperCase() 
    : (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

const stringToColor = (str: string) => {
  if (!str) return "#6366f1";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

 const SkeletonLine = ({ width = "w-full" }: { width?: string }) => (
  <div className={`h-4 bg-gray-200 rounded animate-pulse ${width}`}></div>
);

const SkeletonCircle = ({ size = "w-10 h-10" }: { size?: string }) => (
  <div className={`${size} bg-gray-200 rounded-full animate-pulse`}></div>
);

const TableRowSkeleton = () => (
  <tr className="border-b">
    <td className="px-4 py-3">
      <div className="flex items-center gap-3">
        <SkeletonCircle />
        <SkeletonLine width="w-32" />
      </div>
    </td>
    <td className="px-4 py-3">
      <div className="space-y-2">
        <SkeletonLine width="w-40" />
        <SkeletonLine width="w-28" />
      </div>
    </td>
    <td className="px-4 py-3">
      <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
    </td>
    <td className="px-4 py-3">
      <SkeletonLine width="w-20" />
    </td>
    <td className="px-4 py-3">
      <SkeletonLine width="w-24" />
    </td>
    <td className="px-4 py-3">
      <div className="flex justify-center gap-1">
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </td>
  </tr>
);

const UserAvatar = ({ user, size = "w-10 h-10" }: { user: any; size?: string }) => {
  const hasAvatar = user.avatar && user.avatar !== "null" && user.avatar !== "undefined";
  const bgColor = stringToColor(user.name);
  const initials = getInitials(user.name);

  return (
    <div className={`${size} rounded-full flex items-center justify-center overflow-hidden`}>
      {hasAvatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = "flex";
          }}
        />
      ) : null}
      <div 
        className={`w-full h-full flex items-center justify-center text-white font-medium ${hasAvatar ? 'hidden' : ''}`}
        style={{ backgroundColor: bgColor }}
      >
        {initials}
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <FiX size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const UserForm = ({ user = null, onSubmit, onCancel }: { user?: any; onSubmit: () => void; onCancel: () => void }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    employee_id: user?.employee_id || "",
    role: user?.role || "User",
    password: "",
    work_experience_level: user?.work_experience_level || "Entry Level",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState(user?.avatar || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setPreviewImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || (!user && !formData.password)) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key === 'phone' ? 'mobile' : key, value);
    });
    if (selectedFile) data.append('profileImage', selectedFile);

    try {
      const response = user 
        ? await Authentication.updateUser(user.id, data)
        : await Authentication.createUser(data);
      
      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message || `User ${user ? 'updated' : 'created'} successfully`);
        onSubmit();
      } else {
        toast.error(response.data.message || "Operation failed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex gap-6 mb-6">
        <div className="flex flex-col items-center">
          <div 
            className="w-24 h-24 rounded-full cursor-pointer relative group"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                <FiUser size={32} className="text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <FiUpload className="text-white" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <p className="text-sm text-gray-500 mt-2">Click to upload</p>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full border rounded px-3 py-2"
              disabled={isSubmitting}
            >
              {ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full border rounded px-3 py-2"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Employee ID</label>
            <input
              type="text"
              value={formData.employee_id}
              onChange={(e) => handleChange('employee_id', e.target.value)}
              className="w-full border rounded px-3 py-2"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Work Experience</label>
            <select
              value={formData.work_experience_level}
              onChange={(e) => handleChange('work_experience_level', e.target.value)}
              className="w-full border rounded px-3 py-2"
              disabled={isSubmitting}
            >
              {EXPERIENCE_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          {!user && (
            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
                minLength={6}
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#ff4e00] text-white rounded hover:bg-[#ff4e00]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {isSubmitting ? (user ? 'Updating...' : 'Creating...') : (user ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  );
};

 const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  entriesPerPage, 
  onEntriesPerPageChange,
  totalEntries,
  startEntry,
  endEntry
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  entriesPerPage: number;
  onEntriesPerPageChange: (entries: number) => void;
  totalEntries: number;
  startEntry: number;
  endEntry: number;
}) => {
  const pageNumbers = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Show</span>
          <select
            value={entriesPerPage}
            onChange={(e) => onEntriesPerPageChange(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-700">entries</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          Showing {startEntry} to {endEntry} of {totalEntries} entries
        </span>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            First
          </button>
          
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiChevronLeft size={16} />
          </button>

          {pageNumbers.map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 text-sm border rounded ${
                page === currentPage 
                  ? 'bg-[#ff4e00] text-white border-[#ff4e00]' 
                  : 'hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiChevronRight size={16} />
          </button>
          
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  employee_id: string;
  role: string;
  avatar: string;
  joinDate: string;
  password?: string;
  work_experience_level: string;
}

export default function UsersPage() {
  const { users: rawUsers, error, isLoading, refreshUsers } = useUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);

   const users = useMemo(() => {
    return rawUsers.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.mobile || "N/A",
      employee_id: user.employee_id || "",
      role: user.role,
      avatar: user.profile_image,
      joinDate: new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short", 
        day: "numeric"
      }),
      password: user.password || "",
      work_experience_level: user.work_experience_level || "Entry Level",
    }));
  }, [rawUsers]);

  // Handle SWR errors
  useEffect(() => {
    if (error) {
      toast.error("Failed to load users");
    }
  }, [error]);

  const filteredUsers = useMemo(() => {
    return users.filter((user: User) => {
      const matchesSearch = [user.name, user.email, user.employee_id]
        .some(field => field?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

   const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);
  
  const startEntry = filteredUsers.length === 0 ? 0 : startIndex + 1;
  const endEntry = Math.min(endIndex, filteredUsers.length);

   useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRole, entriesPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEntriesPerPageChange = (entries: number) => {
    setEntriesPerPage(entries);
    setCurrentPage(1);
  };

  const handleDelete = async (userId: number) => {
    try {
      setIsDeleting(true);
      const response = await Authentication.deleteUser(userId);
      if (response.status === 200) {
        toast.success("User deleted successfully");
        setDeleteUser(null);
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = () => {
    setEditUser(null);
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
       <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage system users and roles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#ff4e00] text-white rounded hover:bg-[#ff4e00]/90 disabled:opacity-50"
          disabled={isLoading}
        >
          <FiPlus size={16} />
          Add User
        </button>
      </div>

       <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#ff4e00]"
              disabled={isLoading}
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border rounded px-3 py-2"
            disabled={isLoading}
          >
            <option value="all">All Roles</option>
            {ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

       <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">
            Users ({isLoading ? '...' : filteredUsers.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Work Experience</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Employee ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Password</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Joined</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                 Array.from({ length: entriesPerPage }).map((_, index) => (
                  <TableRowSkeleton key={`skeleton-${index}`} />
                ))
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <FiUser size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No users found</p>
                  </td>
                </tr>
              ) : (
                currentUsers.map((user: User) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div>{user.email}</div>
                        <div className="text-gray-500">{user.phone}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{user.work_experience_level || "Entry Level"}</td>
                    <td className="px-4 py-3 text-sm">{user.employee_id || "—"}</td>
                    <td className="px-4 py-3 text-sm">{user.password || "—"}</td>
                    <td className="px-4 py-3 text-sm">{user.joinDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => setViewUser(user)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="View"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          onClick={() => setEditUser(user)}
                          className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                          title="Edit"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteUser(user)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

         {!isLoading && filteredUsers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            entriesPerPage={entriesPerPage}
            onEntriesPerPageChange={handleEntriesPerPageChange}
            totalEntries={filteredUsers.length}
            startEntry={startEntry}
            endEntry={endEntry}
          />
        )}
      </div>

       <Modal isOpen={!!viewUser} onClose={() => setViewUser(null)} title="User Details">
        {viewUser && (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <UserAvatar user={viewUser} size="w-16 h-16" />
              <div>
                <h3 className="text-lg font-semibold">{viewUser.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${ROLE_COLORS[viewUser.role]}`}>
                  {viewUser.role}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium">{viewUser.email}</p>
              </div>
              <div>
                <span className="text-gray-500">Phone:</span>
                <p className="font-medium">{viewUser.phone}</p>
              </div>
              <div>
                <span className="text-gray-500">Employee ID:</span>
                <p className="font-medium">{viewUser.employee_id || "—"}</p>
              </div>
              <div>
                <span className="text-gray-500">Password:</span>
                <p className="font-medium">{viewUser.password || "—"}</p>
              </div>
              <div>
                <span className="text-gray-500">Joined:</span>
                <p className="font-medium">{viewUser.joinDate}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setViewUser(null);
                  setDeleteUser(viewUser);
                }}
                className="px-4 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setViewUser(null);
                  setEditUser(viewUser);
                }}
                className="px-4 py-2 bg-[#ff4e00] text-white rounded hover:bg-[#ff4e00]/90"
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </Modal>

       <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New User">
        <UserForm onSubmit={handleFormSubmit} onCancel={() => setShowAddModal(false)} />
      </Modal>

       <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <UserForm user={editUser} onSubmit={handleFormSubmit} onCancel={() => setEditUser(null)} />
        )}
      </Modal>

       <Modal isOpen={!!deleteUser} onClose={() => setDeleteUser(null)} title="Confirm Delete">
        {deleteUser && (
          <div className="p-6 text-center">
            <div className="text-yellow-500 mb-4">
              <FiTrash2 size={48} className="mx-auto" />
            </div>
            <p className="mb-2">Are you sure you want to delete this user?</p>
            <p className="font-semibold mb-4">{deleteUser.name}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteUser(null)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteUser.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
