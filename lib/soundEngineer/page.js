import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url) => axios.get(url).then((res) => res.data);

export function useSoundEngineerTracking() {
  const baseUrl = process.env.NEXT_PUBLIC_TASK_SERVICE_URL || 'http://localhost:5002';
  const endpoint = `${baseUrl}/api/task-assignment/usersWithCompletedTasksAssignedBySoundEngineer`;
  const { data, error, isLoading } = useSWR(endpoint, fetcher);
  return {
    users: data?.users || [],
    isLoading,
    isError: !!error,
  };
}
