import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url) => axios.get(url).then((res) => res.data);

export function useNotifications(page) {
  const baseUrl = process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL;

  const { data, error, isLoading } = useSWR(
    page ? `${baseUrl}/api/notifications/all?page=${page}` : null,
    fetcher
  );

  return {
    notifications: data?.data || [],
    isLoading,
    isError: !!error,
    meta: data
      ? {
          total: data.total,
          page: data.page,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
          hasNext: data.hasNext,
          hasPrevious: data.hasPrevious,
        }
      : null,
  };
}


export function useSoundEngineers() {
  const baseUrl = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;
  const { data, error, isLoading } = useSWR(
    baseUrl ? `${baseUrl}/api/task-assignment/usersWithCompletedTasksAssignedBySoundEngineer` : null,
    fetcher
  );

  return {
    users: data?.users || [],
    isLoading,
    isError: !!error,
  };
}