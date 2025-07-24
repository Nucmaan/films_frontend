import axios from "axios";
import useSWR, { mutate } from "swr";

export const swrFetcher = url => axios.get(url, { withCredentials: true }).then(res => res.data);

const userService = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

 export const useUsers = () => {
  const { data, error, isLoading, mutate: refreshUsers } = useSWR(
    `${userService}/api/auth/users`,
    swrFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  );

  return {
    users: data?.users || [],
    error,
    isLoading,
    refreshUsers
  };
};

export const useUser = (userId) => {
  const { data, error, isLoading, mutate: refreshUser } = useSWR(
    userId ? `${userService}/api/auth/users/${userId}` : null,
    swrFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  );

  return {
    user: data?.user || null,
    error,
    isLoading,
    refreshUser
  };
};

const Authentication = {
  login: async (identifier, password) => {
    return await axios.post(
      `${userService}/api/auth/login`,
      { identifier, password },
      { withCredentials: true }
    );
  },
  
  logout: async () => {
    return await axios.get(
      `${userService}/api/auth/logout`,
      { withCredentials: true }
    );
  },
  
  getUsers: async () => {
    return await axios.get(
      `${userService}/api/auth/users`,
      { withCredentials: true }
    );
  },
  
  getUserById: async (userId) => {
    return await axios.get(
      `${userService}/api/auth/users/${userId}`,
      { withCredentials: true }
    );
  },
  
  createUser: async (userData) => {
    const response = await axios.post(
      `${userService}/api/auth/register`,
      userData,
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    // Invalidate and revalidate users cache
    await mutate(`${userService}/api/auth/users`);
    
    return response;
  },
  
  updateUser: async (userId, userData) => {
    const response = await axios.put(
      `${userService}/api/auth/users/${userId}`,
      userData,
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    // Invalidate and revalidate users cache
    await mutate(`${userService}/api/auth/users`);
    await mutate(`${userService}/api/auth/users/${userId}`);
    
    return response;
  },
  
  deleteUser: async (userId) => {
    const response = await axios.delete(
      `${userService}/api/auth/users/${userId}`,
      { withCredentials: true }
    );
    
    // Invalidate and revalidate users cache
    await mutate(`${userService}/api/auth/users`);
    
    return response;
  }
};

export default Authentication;
