import useSWR from 'swr';
import axios from 'axios';

const projectService = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL;

// Function to fetch DRAMA projects specifically
const fetchDramaProjects = async () => {
  const response = await axios.post(
    `${projectService}/api/project/projects/byType`,
    { project_type: "DRAMA" }
  );
  return response.data;
};

// SWR hook specifically for DRAMA projects
export function useDramaProjects() {
  const { data, error, mutate, isLoading } = useSWR(
    'drama-projects', // Unique cache key for DRAMA projects
    fetchDramaProjects,
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
