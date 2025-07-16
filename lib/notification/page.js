import useSWR from 'swr';
import axios from 'axios';

const fetcher = url => axios.get(url).then(res => res.data);

export function useNotifications(notificationServiceUrl) {
  const { data, error, isLoading } = useSWR(
    notificationServiceUrl ? `${notificationServiceUrl}/api/notifications/all` : null,
    fetcher
  );

  return {
    notifications: data?.data || [],
    isLoading,
    isError: !!error,
  };
}

