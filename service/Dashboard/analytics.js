import axios from "axios";
import useSWR from "swr";

export const swrFetcher = url => axios.get(url, { withCredentials: true }).then(res => res.data);

const userServiceUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
const projectService = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL;
const taskService = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;

 export const useUserDashboard = () => {
  const { data, error, isLoading, mutate } = useSWR(
    `${userServiceUrl}/api/auth/dashboard`,
    swrFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  );

  return {
    data: data?.dashboard,
    error,
    isLoading,
    mutate
  };
};

export const useProjectDashboard = () => {
  const { data, error, isLoading, mutate } = useSWR(
    `${projectService}/api/project/dashboard`,
    swrFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  );

  return {
    data: data?.dashboard,
    error,
    isLoading,
    mutate
  };
};

export const useTaskDashboard = () => {
  const { data, error, isLoading, mutate } = useSWR(
    `${taskService}/api/task/DashboardTasks`,
    swrFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  );

  // Normalize: if data is a number, wrap it in { count: data }
  const normalizedData = typeof data === "number" ? { count: data } : data;

  return {
    data: normalizedData,
    error,
    isLoading,
    mutate
  };
};

export const useSubtaskDashboard = () => {
  const { data, error, isLoading, mutate } = useSWR(
    `${taskService}/api/subtasks/dashboard`,
    swrFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  );

  // Normalize: if data is a number, wrap it in { count: data }
  const normalizedData = typeof data === "number" ? { count: data } : data;

  return {
    data: normalizedData,
    error,
    isLoading,
    mutate
  };
};

export const useMyDashboardProjects = () => {
  const { data, error, isLoading, mutate } = useSWR(
    `${projectService}/api/project/projects/details`,
    swrFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate
  };
};

// Legacy functions for backward compatibility
export const getUserList = () => {
    return axios
        .get(`${userServiceUrl}/api/auth/dashboard`, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        })
        .then(res => res.data);
};

export const getProjectList = () => {
    return axios
        .get(`${projectService}/api/project/dashboard`, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        })
        .then(res => res.data);
};

export const getTaskList = () => {
    return axios
        .get(`${taskService}/api/task/DashboardTasks`, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        })
        .then(res => res.data);
};

export const getSubtaskList = () => {
    return axios
        .get(`${taskService}/api/subtasks/dashboard`, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        })
        .then(res => res.data);
};

export const MyDashboardProject = () => {
    return axios
        .get(`${projectService}/api/project/projects/details`, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        })
        .then(res => res.data);
};


