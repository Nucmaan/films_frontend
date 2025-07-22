import useSWR from 'swr';

const fetcher = async (url, options) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.info = await res.json().catch(() => ({}));
    error.status = res.status;
    throw error;
  }
  return res.json();
};

 export function useProject(id, projectService) {
  const shouldFetch = Boolean(id && projectService);
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? `${projectService}/api/project/singleProject/${id}` : null,
    fetcher
  );
  return {
    project: data?.project,
    success: data?.success,
    error,
    isLoading,
    mutate,
  };
}

 export function useProjectTasks(projectId, taskService, page = 1) {
  const shouldFetch = Boolean(projectId && taskService);
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? `${taskService}/api/task/projectTasks/${projectId}?page=${page}` : null,
    fetcher
  );
  return {
    tasks: data?.tasks || [],
    total: data?.total || 0,
    page: data?.page || 1,
    pageSize: data?.pageSize || 50,
    totalPages: data?.totalPages || 1,
    hasNext: data?.hasNext || false,
    hasPrevious: data?.hasPrevious || false,
    success: data?.success,
    error,
    isLoading,
    mutate,
  };
}

 export function useProjectUsers(userService) {
  const shouldFetch = Boolean(userService);
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? `${userService}/api/auth/users` : null,
    fetcher
  );
  let users = data?.users || data || [];
  if (Array.isArray(users)) {
    users = users.filter((user) => user.role !== 'Admin' && user.role !== 'Supervisor');
  } else {
    users = [];
  }
  return {
    users,
    error,
    isLoading,
    mutate,
  };
}
