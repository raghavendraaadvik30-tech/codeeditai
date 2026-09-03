/*useUsersStore.ts is a Zustand store currently managing a hardcoded mock user list,
 search/filter state, and local CRUD operations with localStorage persistence; 
 once the backend is connected, the mock users and local CRUD logic should be replaced or integrated with userService/API calls, 
 while search/filter UI state can remain in Zustand.*/
 
import { create } from "zustand";
import { persist } from "zustand/middleware";
import  type { User } from "@/shared/types/index";

interface UsersState {
  users: User[];
  searchQuery: string;
  roleFilter: string;
  addUser: (user: Omit<User, "id" | "createdDate"> & { password?: string }) => void;
  updateUser: (id: string, updatedData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setRoleFilter: (role: string) => void;
}

const initialUsers: User[] = [
  {
    id: "PX-1049",
    fullName: "Dr. Helen Carter",
    email: "h.carter@example.com",
    password: "Password123!",
    phone: "+1 (555) 019-2831",
    role: "Admin",
    status: "Active",
    createdDate: "2026-01-15",
    lastLogin: "2026-06-19 14:32:05",
  },
  {
    id: "PX-2081",
    fullName: "Marcus Aurelius Vance",
    email: "m.vance@example.com",
    password: "Password123!",
    phone: "+44 20 7946 0958",
    role: "Author",
    status: "Active",
    createdDate: "2026-02-10",
    lastLogin: "2026-06-20 09:12:44",
  },
  {
    id: "PX-3011",
    fullName: "Sarah Connor Jenkins",
    email: "s.jenkins@example.com",
    password: "Password123!",
    phone: "+1 (555) 014-9923",
    role: "Reviewer",
    status: "Active",
    createdDate: "2026-03-02",
    lastLogin: "2026-06-18 11:05:19",
  },
  {
    id: "PX-4072",
    fullName: "Robert Chen",
    email: "r.chen@example.com",
    password: "Password123!",
    phone: "+86 10 6510 3920",
    role: "Author",
    status: "Suspended",
    createdDate: "2026-03-18",
  },
  {
    id: "PX-5034",
    fullName: "Elena Rostova",
    email: "e.rostova@example.com",
    password: "Password123!",
    phone: "+49 30 8920 1851",
    role: "Reviewer",
    status: "Suspended",
    createdDate: "2026-04-05",
  }
];

export const useUsersStore = create<UsersState>()(
  persist(
    (set) => ({
      users: initialUsers,
      searchQuery: "",
      roleFilter: "All",

      addUser: (userData) => {
        set((state) => {
          const randomIdNum = Math.floor(1000 + Math.random() * 9000);
          const newUser: User = {
            id: `PX-${randomIdNum}`,
            fullName: userData.fullName,
            email: userData.email,
            password: userData.password || "Password123!",
            phone: userData.phone,
            role: userData.role,
            status: userData.status,
            createdDate: new Date().toISOString().split("T")[0],
          };
          return { users: [newUser, ...state.users] };
        });
      },

      updateUser: (id, updatedData) => {
        set((state) => {
          const updated = state.users.map((u) =>
            u.id === id ? { ...u, ...updatedData } : u
          );
          return { users: updated };
        });
      },

      deleteUser: (id) => {
        set((state) => {
          const updated = state.users.filter((u) => u.id !== id);
          return { users: updated };
        });
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setRoleFilter: (role) => set({ roleFilter: role }),
    }),
    {
      name: "system_users_list_v1", // Updated key to match clean state
    }
  )
);
