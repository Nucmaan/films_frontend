import useSWR from 'swr';
import axios from 'axios';

const projectService = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL;

 const fetchDramaProjects = async ([, page]) => {
  const response = await axios.post(
    `${projectService}/api/project/projects/byType`,
    { project_type: "DRAMA", page }
  );
  return response.data;
};

 export function useDramaProjects(page = 1) {
  const { data, error, mutate, isLoading } = useSWR(
    ['drama-projects', page],
    fetchDramaProjects,
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
