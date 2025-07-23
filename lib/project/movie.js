import useSWR from 'swr';
import axios from 'axios';

const projectService = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL;

// Function to fetch Movie projects with pagination
const fetchMovieProjects = async ([, page]) => {
  const response = await axios.post(
    `${projectService}/api/project/projects/byType`,
    { project_type: "Movie", page }
  );
  return response.data;
};

// SWR hook for paginated Movie projects
export function useMovieProjects(page = 1) {
  const { data, error, mutate, isLoading } = useSWR(
    ['movie-projects', page],
    fetchMovieProjects,
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