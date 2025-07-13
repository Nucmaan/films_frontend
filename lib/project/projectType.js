import useSWR from 'swr';
import axios from 'axios';

const projectService = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL;

// Simple function to fetch projects by type
const fetchProjectsByType = async (projectType) => {
  const response = await axios.post(
    `${projectService}/api/project/projects/byType`,
    { project_type: projectType }
  );
  return response.data;
};

// SWR hook for projects by type
export function useProjectsByType(projectType) {
  const { data, error, mutate, isLoading } = useSWR(
    projectType ? `projects-by-type-${projectType}` : null,
    () => fetchProjectsByType(projectType),
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
