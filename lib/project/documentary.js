import useSWR from 'swr';
import axios from 'axios';

const projectService = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL;

// Function to fetch Documentary projects specifically
const fetchDocumentaryProjects = async () => {
  const response = await axios.post(
    `${projectService}/api/project/projects/byType`,
    { project_type: "Documentary" }
  );
  return response.data;
};

// SWR hook specifically for Documentary projects
export function useDocumentaryProjects() {
  const { data, error, mutate, isLoading } = useSWR(
    'documentary-projects', // Unique cache key for Documentary projects
    fetchDocumentaryProjects,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      errorRetryCount: 3,
      errorRetryInterval: 5000, // 5 seconds
    }
  );

  return {
    projects: data?.projects || [],
    total: data?.total || 0,
    isLoading,
    isError: error,
    mutate,
    error: error?.message || null
  };
} 