import useSWR from "swr";
import axios from "axios";

export function useUsersWithCompletedTasks(taskServiceUrl) {
  const fetcher = url => axios.get(url).then(res => res.data);

  const { data, error, isLoading, mutate } = useSWR(
    taskServiceUrl ? `${taskServiceUrl}/api/task-assignment/usersWithCompletedTasks` : null,
    fetcher,
    {
      revalidateOnFocus: false,  
      dedupingInterval: 60000,  
    }
  );

  return {
    users: data?.users || [],
    success: data?.success,
    error,
    isLoading,
    mutate,
  };
}

export function useUserWithTasks(taskServiceUrl, userId) {
  const fetcher = url => axios.get(url).then(res => res.data);

  const { data, error, isLoading, mutate } = useSWR(
    taskServiceUrl && userId
      ? `${taskServiceUrl}/api/task-assignment/userWithTasks/${userId}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    user: data?.user || null,
    success: data?.success,
    error,
    isLoading,
    mutate,
  };
}

export function useUserLeaderboardStats(taskServiceUrl) {
  const fetcher = url => axios.get(url).then(res => res.data);

  const { data, error, isLoading, mutate } = useSWR(
    taskServiceUrl ? `${taskServiceUrl}/api/task-assignment/userLeaderboardStats` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    leaderboard: data?.leaderboard || [],
    success: data?.success,
    error,
    isLoading,
    mutate,
  };
}
