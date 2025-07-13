import useSWR from 'swr';
import axios from 'axios';

const projectService = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL;

// Function to fetch project details
const fetchProjectDetails = async () => {
  const response = await axios.get(
    `${projectService}/api/project/projects/details`
  );
  return response.data;
};

// SWR hook for project details
export function useProjectDetails() {
  const { data, error, mutate, isLoading } = useSWR(
    'project-details',
    fetchProjectDetails,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      errorRetryCount: 3,
      errorRetryInterval: 5000, // 5 seconds
    }
  );

  return {
    details: data?.details || {},
    isLoading,
    isError: error,
    mutate,
    error: error?.message || null
  };
}
