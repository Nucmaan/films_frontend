"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingReuse from "@/components/LoadingReuse";
import ProjectKanbanSkeleton from "@/components/ProjectKanbanSkeleton";
import { FiEdit, FiEye, FiTrash2, FiCalendar, FiClock, FiFlag, FiX, FiPlus, FiSearch, FiUpload, FiImage, FiFilter, FiInfo, FiLayers } from "react-icons/fi";
import { useRouter } from "next/navigation";
import userAuth from "@/myStore/userAuth";
import { motion } from "framer-motion";
import Project from "@/service/Project";
import Image from "next/image";
import { useDramaProjects } from "@/lib/project/drama"; 
 
const PROJECT_STATUSES = ["Pending", "In Progress", "Completed", "Planning"];
const PROJECT_PRIORITIES = [ "Low", "Medium", "High"];

const getStatusColor = (status: string) => {
  switch(status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "In Progress":
      return "bg-blue-100 text-blue-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Planning":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: string) => {
  switch(priority) {
    case "Low":
      return "bg-green-100 text-green-800";
    case "Medium":
      return "bg-blue-100 text-blue-800";
    case "High":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityDot = (priority: string) => {
  switch(priority) {
    case "Low":
      return "bg-green-500";
    case "Medium":
      return "bg-blue-500";
    case "High":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
};

const calculateDaysLeft = (deadline: string) => {
  if (!deadline) return { days: 0, overdue: false };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  
  const differenceMs = deadlineDate.getTime() - today.getTime();
  const differenceDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));
  
  return { days: Math.abs(differenceDays), overdue: differenceDays < 0 };
};

 const AddTaskButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className="border border-dashed border-gray-200 rounded-lg p-2.5 flex items-center justify-center mb-4 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-1.5 text-gray-400">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
        <span className="text-sm">Add Task</span>
      </div>
    </div>
  );
};

// Enhanced Kanban Card to match the shared image design
const KanbanCard = ({ 
  project, 
  onView, 
  onEdit, 
  onDelete 
}: { 
  project: any; 
  onView: () => void; 
  onEdit: () => void; 
  onDelete: () => void;
}) => {
  const { days, overdue } = calculateDaysLeft(project.deadline);
  
  const getImageUrl = (project: any) => {
    console.log('Project image URL:', project.project_image);
    if (project.project_image) {
      return project.project_image;
    }
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE2OSIgdmlld0JveD0iMCAwIDMwMCAxNjkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNjkiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjY2Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
       <div className={`h-1.5 w-full ${
        project.status === "Pending" ? "bg-yellow-400" : 
        project.status === "In Progress" ? "bg-blue-400" : 
        project.status === "Completed" ? "bg-green-400" : 
        project.status === "Planning" ? "bg-purple-400" : 
        "bg-gray-300"
      }`}></div>
      
       <div className="w-full aspect-video overflow-hidden">
        {getImageUrl(project) ? (
          <img
            src={getImageUrl(project)}
          alt={project.name}
          width={400}
          height={176}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
        />
        ) : null}
      </div>
      
       <div className="p-5">
        <div className="flex justify-between items-start mb-4">
           <div>
            <h3 className="font-medium text-gray-800 text-lg mb-1" title={project.name}>
              {project.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{project.creator_name || "Astaan Film"}</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {project.project_type}
              </span>
            </div>
          </div>
          
           <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            project.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
            project.status === "In Progress" ? "bg-blue-100 text-blue-800" :
            project.status === "Completed" ? "bg-green-100 text-green-800" :
            project.status === "Planning" ? "bg-purple-100 text-purple-800" :
            "bg-gray-100 text-gray-800"
          }`}>
            {project.status}
          </span>
        </div>
        
         <div className="space-y-3 mb-4">
           <div className="flex flex-col text-sm text-gray-600 gap-2">
             <div className="flex items-center gap-1.5">
              <svg className="text-[#ff4e00]/70" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-gray-500">Created: {formatDate(project.created_at || project.start_date)}</span>
            </div>
            
             <div className="flex items-center gap-1.5">
              <svg className="text-[#ff4e00]/70" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="text-gray-500">
               
                {(
                  <span className="text-gray-500">
                    {project.deadline ? project.deadline.substring(0, 10) : 'none'}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
        
         <div className="flex items-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${getPriorityDot(project.priority)}`}></div>
          <span className="text-sm text-gray-600">{project.priority} Priority</span>
        </div>
         
        
         <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 bg-[#ff4e00] text-white py-2 px-3 rounded-lg hover:bg-[#ff4e00]/90 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <FiEye size={16} />
            View
          </button>
          <button
            onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
            title="Edit Project"
          >
            <FiEdit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100"
            title="Delete Project"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ProjectsPage() {
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedChannel, setSelectedChannel] = useState("All");
  const [projectList, setProjectList] = useState<any[]>([]);
  const [availableChannels, setAvailableChannels] = useState<string[]>([]);
  const [viewingProject, setViewingProject] = useState<any>(null);
  const [deletingProject, setDeletingProject] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const user = userAuth((state) => state.user);
  const [page, setPage] = useState(1);

   const {
    projects: dramaProjects,
    total,
    page: currentPage,
    pageSize,
    totalPages,
    hasNext,
    hasPrevious,
    isLoading,
    error,
    mutate: refreshProjects
  } = useDramaProjects(page);

  useEffect(() => {
    if (dramaProjects) {
      const uniqueChannels = [...new Set(dramaProjects.map((project: any) => 
        project.channel || "unknown"
      ))].sort() as string[];
      setAvailableChannels(uniqueChannels);
      setProjectList(dramaProjects);
    }
  }, [dramaProjects]);

  const filteredProjects = projectList.filter((project: any) => {
    
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesStatus = true;
    if (selectedStatus !== "All") {
      matchesStatus = project.status === selectedStatus;
    }

    let matchesPriority = true;
    if (selectedPriority !== "All") {
      matchesPriority = project.priority === selectedPriority;
    }

     let matchesChannel = true;
    if (selectedChannel !== "All") {
      if (project.channel) {
        matchesChannel = project.channel === selectedChannel;
      } else {
         matchesChannel = selectedChannel === "unknown";
      }
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesChannel;
  });

  const getCategorizedProjects = () => {
    const todoProjects = filteredProjects.filter(project => project.status === "Pending" || project.status === "To Do");
    const inProgressProjects = filteredProjects.filter(project => project.status === "In Progress" || project.status === "On Progress");
    const reviewProjects = filteredProjects.filter(project => project.status === "Review" || project.status === "In Review");
    const completedProjects = filteredProjects.filter(project => project.status === "Completed");
    
    return {
      todo: todoProjects,
      inProgress: inProgressProjects,
      review: reviewProjects,
      completed: completedProjects
    };
  };

   const handleViewProject = (projectId: number) => {
    router.push(`/Supervisor/Projects/${projectId}`);
  };

   const handleEditProject = (projectId: number) => {
    router.push(`/Supervisor/Projects/DRAMA/${projectId}`);
  };

   const handleDeleteProject = async (projectId: number) => {
    try {
      setIsDeleting(true);
      const response = await Project.deleteProject(projectId,page);
      
              if (response.data.success) {
          toast.success("Project deleted successfully");
          refreshProjects(); 
          setDeletingProject(null);
        } else {
        toast.error(response.data.message || "Failed to delete project");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete project";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

   const resetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All");
    setSelectedPriority("All");
    setSelectedChannel("All");
  };

   const DeleteConfirmModal = ({ project, onClose, onConfirm }: { project: any; onClose: () => void; onConfirm: () => void }) => {
    return (
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-full p-0">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Confirm Delete</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>
          
          <div className="text-gray-600 mb-6">
            Are you sure you want to delete the project <strong>"{project?.name}"</strong>? This action cannot be undone.
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const resetImageStates = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size must be less than 5MB");
        return;
      }
      
       const allowedTypes = [
        "image/jpeg",
        "image/png", 
        "image/jpg",
        "image/gif"
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, JPG, or GIF)");
        return;
      }
      
      setSelectedFile(file);
      
       const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAddProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      
       const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const deadline = formData.get('deadline') as string;
      const status = formData.get('status') as string;
      const priority = formData.get('priority') as string;
      const channel = formData.get('channel') as string;

      if (!name || !description || !deadline || !status || !priority || !channel) {
        toast.error("Please fill in all required fields");
        return;
      }

       formData.append('project_type', 'DRAMA');
      
       formData.append('created_by', user?.id?.toString() || '');
      
       if (selectedFile) {
        formData.append('project_image', selectedFile);
      }

      const response = await Project.createProject(formData);
      
      if (response.data.success) {
        toast.success("Project created successfully!");
        setShowAddModal(false);
        resetImageStates();
        if (formRef.current) {
          formRef.current.reset();
        }
        refreshProjects();  
      } else {
        toast.error(response.data.message || "Failed to create project");
      }
    } catch (error: any) {
       const message = error.response?.data?.message || "Failed to create project";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const AddProjectModal = ({ onClose }: { onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Add New Project</h2>
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>
          
          <form ref={formRef} onSubmit={handleAddProject} className="p-4">
            <div className="space-y-3">
               <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Project Image</label>
                <div className="mt-1">
                  <div
                    onClick={handleImageClick}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50"
                  >
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <FiImage className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-1 text-xs text-gray-500">Click to upload image</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Project Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Enter project name"
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Channel</label>
                <select
                  name="channel"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                >
                  {availableChannels.length > 0 ? (
                    availableChannels.map(channel => (
                      <option key={channel} value={channel}>
                        {channel === "unknown" ? "Unknown" : channel}
                      </option>
                    ))
                  ) : (
                    <option value="Astaan TV">Astaan TV</option>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    name="status"
                    required
                    defaultValue="Pending"
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  >
                    {PROJECT_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                  <select
                    name="priority"
                    required
                    defaultValue="Medium"
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  >
                    {PROJECT_PRIORITIES.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  placeholder="Enter project description"
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-1.5 text-sm bg-[#ff4e00] text-white rounded-md hover:bg-[#ff4e00]/90 transition-colors flex items-center"
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

   if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ProjectKanbanSkeleton />
      </div>
    );
  }

   if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg font-medium mb-2">Error loading projects</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button 
            onClick={() => refreshProjects()}
            className="px-4 py-2 bg-[#ff4e00] text-white rounded-lg hover:bg-[#ff4e00]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800 flex items-center">
              <FiLayers className="mr-3 text-[#ff4e00]" size={32} />
              <span>Drama Dubbing</span>
            </h1>
            <div className="flex items-center gap-3 text-gray-600">
              <span className="text-lg font-medium">
                {selectedChannel === "All" ? "All Channels" : 
                 (selectedChannel === "unknown" ? "Unknown" : selectedChannel)}
              </span>
              <span className="bg-[#ff4e00] text-white px-3 py-1 rounded-full text-sm font-semibold">
                {filteredProjects.length} Projects
              </span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-[#ff4e00] to-[#ff7e33] hover:from-[#ff4500] hover:to-[#ff7300] text-white flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all shadow-md"
            onClick={() => setShowAddModal(true)}
          >
            <FiPlus size={18} />
            <span>Add New Project</span>
          </motion.button>
        </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects by name or description..."
                className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <select
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent transition-all bg-white min-w-[140px]"
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
              >
                <option value="All">All Channels</option>
                {availableChannels.map(channel => (
                  <option key={channel} value={channel}>
                    {channel === "unknown" ? "Unknown" : channel}
                  </option>
                ))}
              </select>

              <select
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent transition-all bg-white min-w-[140px]"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
              
              <select
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent transition-all bg-white min-w-[140px]"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                <option value="All">All Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              
              <button
                className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

         <div className="flex gap-6 overflow-x-auto mt-6">
          {[
            { key: "Planning", label: "PLANNING", color: "text-purple-600 bg-purple-50 border-t-2 border-purple-400", countColor: "text-purple-600" },
            { key: "In Progress", label: "IN PROGRESS", color: "text-blue-600 bg-blue-50 border-t-2 border-blue-400", countColor: "text-blue-600" },
            { key: "Completed", label: "COMPLETED", color: "text-green-600 bg-green-50 border-t-2 border-green-400", countColor: "text-green-600" },
            { key: "Pending", label: "PENDING", color: "text-yellow-600 bg-yellow-50 border-t-2 border-yellow-400", countColor: "text-yellow-600" },
          ].map(column => (
            <div key={column.key} className="flex-1 min-w-[320px]">
              <div className={`flex items-center gap-2 mb-2 justify-center p-2 rounded-t-lg ${column.color}`}>
                <span className="font-bold text-2xl uppercase">{column.label}</span>
                <span className={`bg-white px-2 py-1 rounded-full text-sm font-bold ${column.countColor}`}>
                  {filteredProjects.filter(p => p.status === column.key).length}
                </span>
              </div>
              <div className="space-y-4">
                {filteredProjects.filter(p => p.status === column.key).length === 0 ? (
                  <div className="text-gray-400 text-center py-8">No projects</div>
                ) : (
                  filteredProjects
                    .filter(p => p.status === column.key)
                    .map(project => (
                      <KanbanCard
                        key={project.id}
                        project={project}
                        onView={() => handleViewProject(project.id)}
                        onEdit={() => handleEditProject(project.id)}
                        onDelete={() => setDeletingProject(project)}
                      />
                    ))
                )}
                 <button
                  className="w-full mt-2 py-2 border border-dashed rounded text-gray-400 hover:bg-gray-50"
                  onClick={() => setShowAddModal(true)}
                >
                  + Add New Project
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
       {deletingProject && (
        <DeleteConfirmModal 
          project={deletingProject}
          onClose={() => setDeletingProject(null)}
          onConfirm={() => handleDeleteProject(deletingProject.id)}
        />
      )}
      
      {showAddModal && (
        <AddProjectModal 
          onClose={() => setShowAddModal(false)}
        />
      )}

       <div className="flex justify-center items-center gap-4 mt-8">
        <button
          className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!hasPrevious || page === 1}
        >
          Previous
        </button>
        <span className="font-medium">Page {currentPage} of {totalPages}</span>
        <button
          className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNext || page === totalPages}
        >
          Next
        </button>
      </div>
    </motion.div>
  );
}