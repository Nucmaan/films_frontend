import useSWR from "swr";
import axios from "axios";

export function useUsersWithCompletedTasks(taskServiceUrl, month, role) {
  const fetcher = async url => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return err.response.data;
      }
      throw err;
    }
  };

  const queryParams = [];
  if (month && month !== "current") queryParams.push(`month=${month}`);
  if (role && role !== "all") queryParams.push(`role=${encodeURIComponent(role)}`);
  const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

  const endpoint = taskServiceUrl
    ? `${taskServiceUrl}/api/task-assignment/usersWithCompletedTasks${queryString}`
    : null;

  const { data, error, isLoading, mutate } = useSWR(
    endpoint,
    fetcher,
    {
<<<<<<< HEAD
<<<<<<< HEAD
      revalidateOnFocus: false,
      dedupingInterval: 60000,
=======
      revalidateOnFocus: false, // Optional: don't refetch on window focus
      dedupingInterval: 60000,  // Optional: cache for 1 minute
>>>>>>> parent of 1e2a220 (v0.01)
=======
      revalidateOnFocus: false, // Optional: don't refetch on window focus
      dedupingInterval: 60000,  // Optional: cache for 1 minute
>>>>>>> parent of 1e2a220 (v0.01)
    }
  );

  return {
    users: data?.users || [],
    totalStaff: data?.totalStaff || 0,
    totalHours: data?.totalHours || 0,
    averageRate: data?.averageRate || 0,
    totalCommission: data?.totalCommission || 0,
    success: data?.success,
    error,
    apiMessage: data?.message,
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
