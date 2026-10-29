
import { create } from "zustand";
import type {
  SuperAdminUser,
  ActivityLog,
} from "./types";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

export interface Workspace {
  id: string;
  name: string;
  code: string;
  status?: string;
  plan?: string;
  userCount?: number;
  adminName?: string;
  branchName?: string;
}

export interface SuperAdminBranch {
  id: string;
  name: string;
  code: string;
  country: string;
  city: string;
  state?: string;
  address?: string;
  subBranches?: number;
}

export interface WorkspaceSubBranch {
  id: string;
  workspaceId: string;
  workspaceName: string;
  branchId?: string;
  branchName?: string;
  address: string;
  code: string;
}

// --------------------------------------------------
// STORE STATE AND ACTIONS
// --------------------------------------------------

interface SuperAdminState {
  users: SuperAdminUser[];
  clients: Workspace[];
  branches: SuperAdminBranch[];
  subBranchesList: WorkspaceSubBranch[];
  activityLogs: ActivityLog[];

  // Users
  fetchUsers: () => void;
  addUser: (
    user: Omit<SuperAdminUser, "id" | "createdDate" | "lastLogin">
  ) => void;
  updateUser: (id: string, updates: Partial<SuperAdminUser>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;

  // Workspaces
  addWorkspace: (workspace: {
    name: string;
    code: string;
    branchName?: string;
  }) => void;
  deleteWorkspace: (id: string) => void;

  // Branches and sub-branches
  fetchBranches: () => void;
  addBranch: (
    branch: Omit<SuperAdminBranch, "id">
  ) => void;
  deleteBranch: (id: string) => void;
  addWorkspaceSubBranch: (
    subBranch: Omit<WorkspaceSubBranch, "id">
  ) => void;
  deleteWorkspaceSubBranch: (id: string) => void;

  // Activity logs
  fetchActivityLogs: () => void;
  logActivity: (
    activity: Omit<ActivityLog, "id">
  ) => void;
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const createId = (): string => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

// --------------------------------------------------
// ZUSTAND STORE
// --------------------------------------------------

export const useSuperAdminStore = create<SuperAdminState>(
  (set) => ({
    users: [],
    clients: [],
    branches: [],
    subBranchesList: [],
    activityLogs: [],

    // ----------------------------------------------
    // USERS
    // ----------------------------------------------

    fetchUsers: () => {
      // Replace with your API request when backend is connected.
    },

    addUser: (user) => {
      const newUser = {
        ...user,
        id: createId(),
        createdDate: new Date().toLocaleDateString(),
        lastLogin: "Never",
      } as SuperAdminUser;

      set((state) => ({
        users: [...state.users, newUser],
      }));
    },

    updateUser: (id, updates) => {
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, ...updates } : user
        ),
      }));
    },

    deleteUser: (id) => {
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
      }));
    },

    toggleUserStatus: (id) => {
      set((state) => ({
        users: state.users.map((user) => {
          if (user.id !== id) return user;

          return {
            ...user,
            status: user.status === "Active" ? "Suspended" : "Active",
          };
        }),
      }));
    },

    // ----------------------------------------------
    // WORKSPACES
    // ----------------------------------------------

    addWorkspace: ({ name, code, branchName }) => {
      const newWorkspace: Workspace = {
        id: createId(),
        name,
        code,
        branchName,
        status: "Active",
        plan: "Free",
        userCount: 0,
        adminName: "Not assigned",
      };

      set((state) => ({
        clients: [...state.clients, newWorkspace],
      }));
    },

    deleteWorkspace: (id) => {
      set((state) => ({
        clients: state.clients.filter(
          (workspace) => workspace.id !== id
        ),
      }));
    },

    // ----------------------------------------------
    // BRANCHES
    // ----------------------------------------------

    fetchBranches: () => {
      // Replace with your API request when backend is connected.
    },

    addBranch: (branch) => {
      const newBranch: SuperAdminBranch = {
        ...branch,
        id: createId(),
      };

      set((state) => ({
        branches: [...state.branches, newBranch],
      }));
    },

    deleteBranch: (id) => {
      set((state) => ({
        branches: state.branches.filter(
          (branch) => branch.id !== id
        ),
      }));
    },

    // ----------------------------------------------
    // SUB-BRANCHES
    // ----------------------------------------------

    addWorkspaceSubBranch: (subBranch) => {
      const newSubBranch: WorkspaceSubBranch = {
        ...subBranch,
        id: createId(),
      };

      set((state) => ({
        subBranchesList: [
          ...state.subBranchesList,
          newSubBranch,
        ],
      }));
    },

    deleteWorkspaceSubBranch: (id) => {
      set((state) => ({
        subBranchesList: state.subBranchesList.filter(
          (subBranch) => subBranch.id !== id
        ),
      }));
    },

    // ----------------------------------------------
    // ACTIVITY LOGS
    // ----------------------------------------------

    fetchActivityLogs: () => {
      // Replace with your API request when backend is connected.
    },

    logActivity: (activity) => {
      const newActivity = {
        ...activity,
        id: createId(),
      } as ActivityLog;

      set((state) => ({
        activityLogs: [newActivity, ...state.activityLogs],
      }));
    },
  })
);
