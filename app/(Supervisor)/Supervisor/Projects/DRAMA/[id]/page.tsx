"use client";

export const runtime = 'edge';

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { FiX, FiImage, FiArrowLeft } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import userAuth from "@/myStore/userAuth";
import { motion } from "framer-motion";
import Image from "next/image";
import Project from "@/service/Project";
import { useDramaProjects } from "@/lib/project/drama";

const PROJECT_STATUSES = ["Pending", "In Progress", "Completed", "Planning"];
const PROJECT_PRIORITIES = ["Low", "Medium", "High"];

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = useParams();
  

  const [project, setProject] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [availableChannels, setAvailableChannels] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Use SWR hook to get DRAMA projects
  const { projects: dramaProjects, mutate: refreshProjects } = useDramaProjects();

  // Fetch the project data
  const fetchProject = async () => {
    try {
      console.log('Fetching project with ID:', id);
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL}/api/project/singleProject/${id}`);
      console.log('Project API response:', response);
      
      if (response.status === 200 && response.data.success) {
        const projectData = response.data.project;
        console.log('Project data successfully loaded:', projectData);
        
        // Verify this is a Movie project
        if (projectData.project_type !== "DRAMA") {
          toast.error("This project is not a DRAMA project");
          router.push('/Supervisor/Projects/DRAMA');
          return;
        }
        
        // Debug date formats
        if (projectData.deadline) {
          console.log('Original deadline:', projectData.deadline);
          console.log('Parsed as Date object:', new Date(projectData.deadline));
          console.log('ISO string format:', new Date(projectData.deadline).toISOString());
          console.log('ISO date only:', new Date(projectData.deadline).toISOString().split('T')[0]);
          console.log('Locale string:', new Date(projectData.deadline).toLocaleString());
        }
        
        setProject(projectData);
        
        // Debug the project channel
        console.log('Project channel from API:', projectData.channel);
        
        // Set preview image if project has one
        if (projectData.project_image) {
          setPreviewImage(projectData.project_image);
        }
      } else {
        console.error('Failed to load project. Response:', response);
        toast.error("Failed to load project");
        setTimeout(() => {
          router.push('/Supervisor/Projects/DRAMA');
        }, 1500);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Error loading project";
      toast.error(message);
      setTimeout(() => {
        router.push('/Supervisor/Projects/DRAMA');
      }, 1500);
    } finally {
      // Removed loading state
    }
  };

  useEffect(() => {
    if (id) {
      fetchProject();
      // fetchChannels(); // REMOVE THIS LINE
    }
  }, [id]);

  // Extract available channels from dramaProjects
  useEffect(() => {
    if (dramaProjects && dramaProjects.length > 0) {
      const uniqueChannels = [...new Set(dramaProjects.map((project: any) => 
        project.channel || "unknown"
      ))].sort() as string[];
      setAvailableChannels(uniqueChannels);
    }
  }, [dramaProjects]);

  // Reset image states
  const resetImageStates = () => {
    setPreviewImage(project?.project_image || null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate if it's actually an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewImage(event.target.result as string);
        } else {
          toast.error("Failed to preview image");
        }
      };
      reader.onerror = () => {
        toast.error("Error processing image");
      };
      reader.readAsDataURL(file);
    } else {
      // If no new file is selected, revert to the original project image
      setPreviewImage(project?.project_image || null);
      setSelectedFile(null);
    }
  };

  // Handle clicking on the image area to select a file
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!project) return;
    
    try {
      setIsSubmitting(true);
      
      const form = event.target as HTMLFormElement;
      const formData = new FormData();
      
      // Get form values
      const name = (form.elements.namedItem('name') as HTMLInputElement).value;
      const deadlineInput = (form.elements.namedItem('deadline') as HTMLInputElement).value;
      const status = (form.elements.namedItem('status') as HTMLSelectElement).value;
      const priority = (form.elements.namedItem('priority') as HTMLSelectElement).value;
      const channel = (form.elements.namedItem('channel') as HTMLSelectElement).value;
      const progress = (form.elements.namedItem('progress') as HTMLInputElement).value;
      const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
      
      console.log('Raw deadline input:', deadlineInput);
      
      // Append all form data
      formData.append('id', project.id);
      formData.append('name', name);
      formData.append('deadline', deadlineInput); 
      formData.append('status', status);
      formData.append('priority', priority);
      formData.append('project_type', 'DRAMA'); // Always set to Movie
      formData.append('channel', channel);
      formData.append('progress', progress);
      formData.append('description', description);
      
      if (selectedFile) {
        formData.append('project_image', selectedFile);
      }
      
      console.log('Form data being sent:');
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL}/api/project/updateProject/${project.id}`,
        formData,
        { 
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('Update response:', response);
      
      if (response.data.success) {
        toast.success("Project updated successfully");
        // Refresh the SWR cache to reflect the changes
        refreshProjects();
        router.push('/Supervisor/Projects/DRAMA');
      } else {
        toast.error(response.data.message || "Failed to update project");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update project";
      console.error("Project update error:", error);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };



  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Project not found</h1>
        <button
          onClick={() => router.push('/Supervisor/Projects/DRAMA')}
          className="px-4 py-2 bg-[#ff4e00] text-white rounded-md hover:bg-[#ff4e00]/90 transition-colors"
        >
          Back to DRAMA
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="mb-6">
        <button
          onClick={() => router.push('/Supervisor/Projects/DRAMA')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-[#ff4e00] transition-colors"
        >
          <FiArrowLeft />
          <span>Back to DRAMA Projects</span>
        </button>

        <h1 className="text-2xl font-bold mb-2 text-gray-800">Edit DRAMA Project: {project.name}</h1>
        <p className="text-gray-500">Make changes to your DRAMA project details</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <input type="hidden" name="id" value={project.id} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Image upload section */}
            <div className="md:col-span-1">
              <div 
                onClick={handleImageClick}
                className="w-full aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:bg-gray-50 mb-2"
              >
                {previewImage ? (
                  <div className="relative w-full h-full">
                    <Image 
                      src={previewImage} 
                      alt="Preview" 
                      width={400}
                      height={176}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(project.project_image || null);
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
            
            {/* Main content */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Project Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={project.name}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    required
                    defaultValue={project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ''}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  <select
                    name="status"
                    required
                    defaultValue={project.status}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  >
                    {PROJECT_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Priority</label>
                  <select
                    name="priority"
                    required
                    defaultValue={project.priority}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  >
                    {PROJECT_PRIORITIES.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Channel</label>
                  <select
                    name="channel"
                    required
                    defaultValue={project.channel || "unknown"}
                    key={`${project.channel}-${availableChannels.length}`} // Force re-render when project or channels change
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  >
                    {/* Always include the current project's channel if it exists */}
                    {project.channel && !availableChannels.includes(project.channel) && (
                      <option key={project.channel} value={project.channel}>
                        {project.channel}
                      </option>
                    )}
                    {availableChannels.length > 0 ? (
                      availableChannels.map(channel => (
                        <option key={channel} value={channel}>
                          {channel === "unknown" ? "Unknown" : channel}
                        </option>
                      ))
                    ) : (
                      <option value="Astaan Films">Astaan Films</option>
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    name="progress"
                    min="0"
                    max="100"
                    required
                    defaultValue={project.progress}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  defaultValue={project.description}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/Supervisor/Projects/DRAMA')}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm bg-[#ff4e00] text-white rounded-md hover:bg-[#ff4e00]/90 transition-colors flex items-center"
            >
              {isSubmitting ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
