import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  employee_id : string,
  expLevel : string;
  role: string;
  profile_image: string;
  isverified: boolean;
  created_at: string;
}

interface UserAuthState {
  user: User | null;
  loginUser: (user: User) => void;
  logoutUser: () => void;
  updateUser: (updatedUser: User) => void;
}

const userAuth = create<UserAuthState>()(
  persist(
    (set) => ({
      user: null,
      loginUser: (user) => set({ user }),
      logoutUser: () => set({ user: null }),
      updateUser: (updatedUser) => set({ user: updatedUser }),
    }),
    {
      name: "Astan-storage", 
      storage: createJSONStorage(() => localStorage),  
    }
  )
);

export default userAuth;
