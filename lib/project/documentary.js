import useSWR from 'swr';
import axios from 'axios';

const projectService = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL;

// Function to fetch Documentary projects with pagination
const fetchDocumentaryProjects = async ([, page]) => {
  const response = await axios.post(
    `${projectService}/api/project/projects/byType`,
    { project_type: "Documentary", page }
  );
  return response.data;
};

// SWR hook for paginated Documentary projects
export function useDocumentaryProjects(page = 1) {
  const { data, error, mutate, isLoading } = useSWR(
    ['documentary-projects', page],
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
    page: data?.page || 1,
    pageSize: data?.pageSize || 40,
    totalPages: data?.totalPages || 1,
    hasNext: data?.hasNext || false,
    hasPrevious: data?.hasPrevious || false,
    isLoading,
    isError: error,
    mutate,
    error: error?.message || null
  };
} 