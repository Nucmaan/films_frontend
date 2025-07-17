import useSWR from "swr";
import axios from "axios";

export function useUserTaskStats(taskServiceUrl, userId) {
  const fetcher = url => axios.get(url).then(res => res.data);

  const { data, error, isLoading, mutate } = useSWR(
    taskServiceUrl && userId ? `${taskServiceUrl}/api/task-assignment/userTaskStats/${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );
  return {
    stats: data?.stats || null,
    success: data?.success,
    error,
    isLoading,
    mutate,
  };
}


export function useUserCompletedTasks(taskServiceUrl, userId) {
  const fetcher = url => axios.get(url).then(res => res.data);
  const { data, error, isLoading, mutate } = useSWR(
    taskServiceUrl && userId ? `${taskServiceUrl}/api/task-assignment/userCompletedTasks/${userId}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );
  return {
    tasks: data?.tasks || [],
    success: data?.success,
    error,
    isLoading,
    mutate,
  };
}

export function useUserActiveAssignments(taskServiceUrl, userId) {
  const fetcher = url => axios.get(url).then(res => res.data);
  const { data, error, isLoading, mutate } = useSWR(
    taskServiceUrl && userId ? `${taskServiceUrl}/api/task-assignment/userActiveAssignments/${userId}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );
  return {
    assignments: data?.assignments || [],
    success: data?.success,
    error,
    isLoading,
    mutate,
  };
}
