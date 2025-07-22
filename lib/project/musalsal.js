import useSWR from 'swr';
import axios from 'axios';

const projectService = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL;

 const fetchMusalsalProjects = async () => {
  const response = await axios.post(
    `${projectService}/api/project/projects/byType`,
    { project_type: "Musalsal" }
  );
  return response.data;
};

 export function useMusalsalProjects() {
  const { data, error, mutate, isLoading } = useSWR(
    'musalsal-projects',  
    fetchMusalsalProjects,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,  
      errorRetryCount: 3,
      errorRetryInterval: 5000, 
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