import useSWR from 'swr';
import axios from 'axios';

const projectService = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL;

 const fetchProjectDetails = async () => {
  const response = await axios.get(
    `${projectService}/api/project/projects/details`
  );
  return response.data;
};

 export function useProjectDetails() {
  const { data, error, mutate, isLoading } = useSWR(
    'project-details',
    fetchProjectDetails,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,  
      errorRetryCount: 3,
      errorRetryInterval: 5000,  
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
