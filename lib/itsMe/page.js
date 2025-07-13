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

// Fetch a single project by ID
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

// Fetch tasks for a project
export function useProjectTasks(projectId, taskService) {
  const shouldFetch = Boolean(projectId && taskService);
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? `${taskService}/api/task/projectTasks/${projectId}` : null,
    fetcher
  );
  return {
    tasks: data?.tasks || [],
    success: data?.success,
    error,
    isLoading,
    mutate,
  };
}

// Fetch users (filtered to exclude Admin/Supervisor)
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
