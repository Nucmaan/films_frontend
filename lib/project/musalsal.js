import useSWR from 'swr';
import axios from 'axios';

const projectService = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL;

// Function to fetch Musalsal projects specifically
const fetchMusalsalProjects = async () => {
  const response = await axios.post(
    `${projectService}/api/project/projects/byType`,
    { project_type: "Musalsal" }
  );
  return response.data;
};

// SWR hook specifically for Musalsal projects
export function useMusalsalProjects() {
  const { data, error, mutate, isLoading } = useSWR(
    'musalsal-projects', // Unique cache key for Musalsal projects
    fetchMusalsalProjects,
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