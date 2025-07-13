"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingReuse from "@/components/LoadingReuse";
import { FiEdit, FiEye, FiTrash2, FiCalendar, FiClock, FiFlag, FiX, FiPlus, FiSearch, FiUpload, FiImage, FiFilter, FiInfo, FiLayers } from "react-icons/fi";
import { useRouter } from "next/navigation";
import userAuth from "@/myStore/userAuth";
import { motion } from "framer-motion";
import Project from "@/service/Project";

const PROJECT_STATUSES = ["Pending", "In Progress", "Completed"];
const PROJECT_PRIORITIES = [ "Low", "Medium", "High"];
const PROJECT_TYPES = ["Documentary"];


const getStatusColor = (status: string) => {
  switch(status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "In Progress":
      return "bg-blue-100 text-blue-800";
    case "Completed":
      return "bg-green-100 text-green-800";
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
  
    const imageUrl = useMemo(() => {
    if (!project.project_image) {
      return "https://via.placeholder.com/300x169?text=No+Image";
    }
    return project.project_image;
  }, [project.project_image]);
  
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
       <div className={`h-1.5 w-full ${
        project.status === "Pending" ? "bg-yellow-400" : 
        project.status === "In Progress" ? "bg-blue-400" : 
        project.status === "Completed" ? "bg-green-400" : 
        "bg-gray-300"
      }`}></div>
      
       <div className="w-full aspect-video overflow-hidden">
        {project.project_image ? (
          <img 
            src={imageUrl}
            alt={project.name}
            className="w-full h-full object-cover"
            onError={(e) => {
               console.error("Image failed to load:", project.project_image);
              e.currentTarget.src = "https://via.placeholder.com/300x169?text=Image+Not+Found";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <FiImage size={40} className="text-gray-400" />
          </div>
        )}
      </div>
      
       <div className="p-5">
        <div className="flex justify-between items-start mb-4">
           <div>
            <h3 className="font-medium text-gray-800 text-lg mb-1" title={project.name}>
              {project.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{project.creator_name || "Astaan Film"}</span>
            </div>
          </div>
          
           <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            project.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
            project.status === "In Progress" ? "bg-blue-100 text-blue-800" :
            project.status === "Completed" ? "bg-green-100 text-green-800" :
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
        
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
              {project.priority}
            </span>
            {project.project_type && project.project_type !== "unknown" && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {project.project_type}
              </span>
            )}
          </div>
          
           <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {project.tasks_count || 0} Tasks
            </span>
          </div>
        </div>
      </div>
      
       <div className="flex justify-end gap-1 px-4 py-2 border-t border-gray-100">
        <button 
          onClick={onView}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
          title="View Details"
        >
          <FiEye size={16} />
        </button>
        <button 
          onClick={onEdit}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors border border-amber-100"
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
  );
};

export default function ProjectsPage() {
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectList, setProjectList] = useState<any[]>([]);
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

  const taskServiceUrl = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;


  const getProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await Project.getAllProjects();
      
      if (response.status === 200) {
        // Filter projects to only show Documentary type projects
        const documentaryProjects = response.data.projects.filter((project: any) => 
          project.project_type === "Documentary"
        );
        
        // Fetch task counts for each project with better error handling
        const projectsWithTaskCounts = await Promise.all(
          documentaryProjects.map(async (project: any) => {
            try {
              // Make sure project.id exists and is valid
              if (!project.id) {
                console.warn(`Project without ID found:`, project);
                return {
                  ...project,
                  tasks_count: 0
                };
              }

              const tasksResponse = await axios.get(
                `${taskServiceUrl}/api/task/projectTasks/${project.id}`
              ).catch(error => {
                 if (error.response && error.response.status === 404) {
                  console.log(`No tasks found for project ${project.id}`);
                  return { data: { success: true, tasks: [] } };
                }
                throw error; 
              });
              
               if (tasksResponse && tasksResponse.data && tasksResponse.data.success) {
                return {
                  ...project,
                  tasks_count: tasksResponse.data.tasks ? tasksResponse.data.tasks.length : 0
                };
              }
              
              return {
                ...project,
                tasks_count: 0
              };
            } catch (error) {
              console.error(`Error fetching tasks for project ${project.id}:`, error);
               return {
                ...project,
                tasks_count: 0
              };
            }
          })
        );
        
        setProjectList(projectsWithTaskCounts);
      } else {
        toast.error("Failed to load projects");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Server error";
      toast.error(message);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    getProjects();
  }, []);

  const filteredProjects = projectList.filter((project: any) => {
     const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesStatus = true;
    if (selectedStatus !== "All") {
      if (PROJECT_TYPES.includes(selectedStatus)) {
        matchesStatus = project.project_type === selectedStatus;
      } else {
        matchesStatus = project.status === selectedStatus;
      }
    }

    let matchesPriority = true;
    if (selectedPriority !== "All") {
      matchesPriority = project.priority === selectedPriority;
    }

    return matchesSearch && matchesStatus && matchesPriority;
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
    router.push(`/Supervisor/Projects/Documentary/${projectId}`);
  };

   const handleDeleteProject = async (projectId: number) => {
    try {
      setIsDeleting(true);
      const response = await Project.deleteProject(projectId);
      
      if (response.data.success) {
        toast.success("Project deleted successfully");
        getProjects();  
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
              <FiX size={20} className="text-gray-600" />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-center text-yellow-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-center mb-2">Are you sure you want to delete this project?</p>
            <p className="text-center font-semibold">{project.name}</p>
            <p className="text-center text-sm text-gray-500">This action cannot be undone.</p>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </button>
          </div>
        </div>
      </div>
    );
  };

   const resetImageStates = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
       if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      console.log("Image selected:", file.name, "Size:", Math.round(file.size / 1024), "KB");
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          console.log("Preview image created successfully");
          setPreviewImage(event.target.result as string);
        } else {
          console.error("Failed to create preview");
          toast.error("Failed to preview image");
        }
      };
      reader.onerror = () => {
        console.error("FileReader error:", reader.error);
        toast.error("Error processing image");
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
      setSelectedFile(null);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

   const handleAddProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const form = event.target as HTMLFormElement;
      const formData = new FormData();
      
       const name = (form.elements.namedItem('name') as HTMLInputElement).value;
      const deadline = (form.elements.namedItem('deadline') as HTMLInputElement).value;
      const status = (form.elements.namedItem('status') as HTMLSelectElement).value;
      const priority = (form.elements.namedItem('priority') as HTMLSelectElement).value;
      const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
      
       formData.append('name', name);
      formData.append('description', description);
      formData.append('deadline', deadline);
      formData.append('created_by', user?.id?.toString() || "");
      formData.append('status', status);
      formData.append('priority', priority);
      formData.append('project_type', 'Documentary');  
      formData.append('progress', '0');  
      
       if (selectedFile) {
        formData.append('project_image', selectedFile);
      }
      
      console.log("Form data entries:", [...formData.entries()].map(entry => `${entry[0]}: ${entry[1]}`));
      
      const response = await Project.createProject(formData);
      
      if (response.data.success) {
        toast.success("Project created successfully");
        
        
        await getProjects();
        
         setShowAddModal(false);
        resetImageStates();
      } else {
        toast.error(response.data.message || "Failed to create project");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create project";
      toast.error(message);
      console.error("Project creation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

   const AddProjectModal = ({ onClose }: { onClose: () => void }) => {
    return (
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 max-w-2xl w-full">
        <div className="p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Add New Project</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX size={20} className="text-gray-600" />
            </button>
          </div>
          
          <form ref={formRef} onSubmit={handleAddProject} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="md:col-span-1">
                <div 
                  onClick={handleImageClick}
                  className="w-full aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:bg-gray-50 mb-2"
                >
                  {previewImage ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(null);
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FiImage size={40} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Upload Project Image</p>
                      <p className="text-xs text-gray-400 mt-1">Click to browse</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <p className="text-xs text-gray-500 text-center">Recommended size: 1280x720px</p>
              </div>
              
               <div className="md:col-span-2">
                <div className="grid grid-cols-2 gap-4 mb-4">
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
                    <label className="block text-xs font-medium text-gray-600 mb-1">Deadline</label>
                    <input
                      type="date"
                      name="deadline"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                    <select
                      name="status"
                      required
                      defaultValue="Pending"
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    >
                      {PROJECT_STATUSES.filter(status => status !== "All").map(status => (
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
                      {PROJECT_PRIORITIES.filter(priority => priority !== "All").map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Project Type</label>
                    <div className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-gray-50 text-gray-700">
                    Documentary
                    </div>
                    <input type="hidden" name="project_type" value="Documentary" />
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
              <span>All Documentary</span>
            </h1>
           
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-[#ff4e00] to-[#ff7e33] hover:from-[#ff4500] hover:to-[#ff7300] text-white flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all shadow-md"
            onClick={() => setShowAddModal(true)}
          >
            <FiPlus size={18} />
            <span>Add New Documentary</span>
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
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
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
            { key: "Pending", label: "PENDING", color: "text-yellow-600 bg-yellow-50 border-t-2 border-yellow-400" },
            { key: "In Progress", label: "IN PROGRESS", color: "text-blue-600 bg-blue-50 border-t-2 border-blue-400" },
            { key: "Completed", label: "COMPLETED", color: "text-green-600 bg-green-50 border-t-2 border-green-400" },
          ].map(column => (
            <div key={column.key} className="flex-1 min-w-[320px]">
              <div className={`flex items-center gap-2 mb-2 justify-center p-2 rounded-t-lg ${column.color}`}>
                <span className="font-bold text-2xl uppercase">{column.label}</span>
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
                  + Add New
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
    </motion.div>
  );
}