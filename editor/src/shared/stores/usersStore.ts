import { create } from "zustand"
import type { User } from "@/shared/types/index"
import {
  userService,
  type CreateUserInput,
} from "@/features/dashboard/services/UserService"

// Shape of a user object as returned by the backend (snake_case)
interface ApiUser {
  user_id: number | string
  full_name?: string | null
  email?: string | null
  role?: string | null
  is_active?: number | string | boolean | null
  created_at?: string | null
}

// APIResponse payload can be an array or wrapped in data / users
type UsersResponseData =
  ApiUser[] | { data?: ApiUser[]; users?: ApiUser[] } | undefined

interface UsersState {
  users: User[]
  searchQuery: string
  roleFilter: string
  isLoading: boolean
  error: string | null

  fetchUsers: () => Promise<void>
  addUser: (user: CreateUserInput) => Promise<void>

  changeUserPassword: (
    userId: string | number,
    newPassword: string
  ) => Promise<void>

  setSearchQuery: (query: string) => void
  setRoleFilter: (role: string) => void
  clearError: () => void
  deleteUser: (userId: string | number) => Promise<void>
}

export const useUsersStore = create<UsersState>()((set) => ({
  users: [],
  searchQuery: "",
  roleFilter: "All",
  isLoading: false,
  error: null,

  // Fetch users from backend
  fetchUsers: async () => {
    set({ isLoading: true, error: null })

    try {
      const response = await userService.getUsers()

      // APIResponse: { success, message, data: [...] }
      const responseData = response?.data as UsersResponseData

      const apiUsers: ApiUser[] = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.data)
          ? responseData.data
          : Array.isArray(responseData?.users)
            ? responseData.users
            : []

      // Convert backend snake_case into frontend camelCase
      const users: User[] = apiUsers.map((user) => ({
        id: user.user_id,
        fullName: user.full_name ?? "",
        email: user.email ?? "",
        role: user.role ?? "",
        status: Number(user.is_active) === 1 ? "Active" : "Inactive",
        createdDate: user.created_at
          ? new Date(user.created_at).toLocaleDateString()
          : "",
      })) as User[]

      set({
        users,
        isLoading: false,
      })
    } catch (error: unknown) {
      console.error("Failed to fetch users:", error)

      set({
        error: "Failed to fetch users. Please try again.",
        isLoading: false,
      })
    }
  },

  // Create user through backend
  addUser: async (userData) => {
    set({ error: null })

    try {
      await userService.createUser(userData)

      await useUsersStore.getState().fetchUsers()

      // Propagate refresh errors as well
      if (useUsersStore.getState().error) {
        throw new Error(useUsersStore.getState().error!)
      }
    } catch (error: unknown) {
      console.error("Failed to create user:", error)

      set({
        error: "Failed to create user. Please try again.",
      })

      throw error
    }
  },

  // Change a user's password through backend
  changeUserPassword: async (userId, newPassword) => {
    set({ error: null })

    try {
      await userService.changeUserPassword(String(userId), newPassword)
    } catch (error: unknown) {
      console.error("Failed to change user password:", error)

      set({
        error: "Failed to change password. Please try again.",
      })

      throw error
    }
  },

  // Delete a user through backend
  deleteUser: async (userId) => {
    set({ error: null })

    try {
      await userService.deleteUser(String(userId))

      // Refresh users after successful deletion
      await useUsersStore.getState().fetchUsers()

      // Propagate refresh errors as well
      if (useUsersStore.getState().error) {
        throw new Error(useUsersStore.getState().error!)
      }
    } catch (error: unknown) {
      console.error("Failed to delete user:", error)

      set({
        error: "Failed to delete user. Please try again.",
      })

      throw error
    }
  },

  // Search and filter state
  setSearchQuery: (query) => set({ searchQuery: query }),

  setRoleFilter: (role) => set({ roleFilter: role }),

  clearError: () => set({ error: null }),
}))
