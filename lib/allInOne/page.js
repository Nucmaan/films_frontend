import useSWR from "swr";
import axios from "axios";

export function useUserTaskStats(taskServiceUrl, employeeId) {
  const fetcher = url => axios.get(url).then(res => res.data);

  const { data, error, isLoading, mutate } = useSWR(
    taskServiceUrl && employeeId ? `${taskServiceUrl}/api/subtasks/assigned/${employeeId}/status-count` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );
  return {
    stats: data || null,
    error,
    isLoading,
    mutate,
  };
}

export function useUserCompletedTasks(taskServiceUrl, userId) {
  const fetcher = url => axios.get(url).then(res => res.data);
  const { data, error, isLoading, mutate } = useSWR(
    taskServiceUrl && userId ? `${taskServiceUrl}/api/subtasks/completed/${userId}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );
  return {
    tasks: Array.isArray(data) ? data : [],
    error,
    isLoading,
    mutate,
  };
}

export function useUserActiveAssignments(taskServiceUrl, userId) {
  const fetcher = url => axios.get(url).then(res => res.data);
  const { data, error, isLoading, mutate } = useSWR(
    taskServiceUrl && userId ? `${taskServiceUrl}/api/subtasks/assigned/${userId}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );
  return {
    assignments: Array.isArray(data) ? data : [],
    error,
    isLoading,
    mutate,
  };
}
