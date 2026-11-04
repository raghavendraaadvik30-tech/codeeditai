import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Branch, SuperAdminUser, ActivityLog, ClientWorkspace, WorkspaceSubBranch } from "./types";
import { axiosInstance } from "@/shared/api/axios";

interface SuperAdminState {
  branches: Branch[];
  users: SuperAdminUser[];
  activityLogs: ActivityLog[];
  clients: ClientWorkspace[];
  subBranchesList: WorkspaceSubBranch[];
  isLoading: boolean;

  // Async Backend Synchronization
  fetchBranches: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchActivityLogs: () => Promise<void>;

  // Branch actions
  addBranch: (branch: Omit<Branch, "id">) => Promise<void>;
  deleteBranch: (id: string) => void;

  // Workspace actions
  addWorkspace: (workspace: { name: string; code: string; branchName?: string }) => void;
  deleteWorkspace: (id: string) => void;

  // Sub-branch actions
  addWorkspaceSubBranch: (subBranch: Omit<WorkspaceSubBranch, "id" | "createdAt">) => void;
  deleteWorkspaceSubBranch: (id: string) => void;

  // User actions
  addUser: (user: Omit<SuperAdminUser, "id" | "lastLogin" | "createdDate">) => Promise<void>;
  updateUser: (id: string, user: Partial<SuperAdminUser>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => Promise<void>;

  // Activity log action
  logActivity: (log: Omit<ActivityLog, "id">) => void;
}

const initialBranches: Branch[] = [];
const initialUsers: SuperAdminUser[] = [];
const initialLogs: ActivityLog[] = [];
const initialClients: ClientWorkspace[] = [];
const initialSubBranches: WorkspaceSubBranch[] = [];

interface RawBranch {
  branch_id: string;
  branch_code?: string;
  branch_name: string;
  country: string;
  city: string;
  state_province_region?: string;
}

interface RawSubBranch {
  sub_branch_id: string;
  workspace_id?: string;
  branch_id?: string;
  workspace_name?: string;
  branch_name?: string;
  workspace_code?: string;
  sub_branch?: string;
  created_at?: string | number;
}

interface RawWorkspace {
  workspace_id: string;
  workspace_name: string;
  workspace_code?: string;
  is_active?: boolean;
}

interface RawUser {
  user_id: string;
  full_name?: string;
  workspace?: string;
  email: string;
  contact_number?: string;
  workspace_code?: string;
  workspace_name?: string;
  branch_name?: string;
  sub_branch?: string;
  sub_branch_id?: string;
  created_by_admin_name?: string;
  created_by_admin_email?: string;
  role?: string;
  is_active?: number;
  created_at?: string | number;
}

interface RawAuditLog {
  audit_id: string;
  actor_name?: string;
  actor_role?: string;
  action?: string;
  description?: string;
  target_name?: string;
  created_at?: string | number;
}

export const useSuperAdminStore = create<SuperAdminState>()(
  persist(
    (set, get) => ({
      branches: initialBranches,
      users: initialUsers,
      activityLogs: initialLogs,
      clients: initialClients,
      subBranchesList: initialSubBranches,
      isLoading: false,

      // ==========================================
      // FETCH BRANCHES FROM BACKEND
      // ==========================================
      fetchBranches: async () => {
        try {
          set({ isLoading: true });
          const res = await axiosInstance.get("/super-admin/branches");
          if (res.data && res.data.success && Array.isArray(res.data.data)) {
            const mappedBranches: Branch[] = (res.data.data as RawBranch[]).map((b) => ({
              id: b.branch_id,
              code: b.branch_code || "BRANCH-01",
              name: b.branch_name,
              country: b.country,
              city: b.city,
              state: b.state_province_region || "",
              subBranches: [],
            }));
            if (mappedBranches.length > 0) {
              set({ branches: mappedBranches });
            }
          }

          // Fetch Sub-Branches from backend if available
          try {
            const sbRes = await axiosInstance.get("/super-admin/sub-branches");
            if (sbRes.data && sbRes.data.success && Array.isArray(sbRes.data.data)) {
              const mappedSubBranches: WorkspaceSubBranch[] = (sbRes.data.data as RawSubBranch[]).map((sb) => ({
                id: sb.sub_branch_id,
                workspaceId: sb.workspace_id || sb.branch_id || "",
                workspaceName: sb.workspace_name || sb.branch_name || "Headquarters",
                code: sb.workspace_code || "APEX-HQ-01",
                address: sb.sub_branch || "",
                branchId: sb.branch_id,
                branchName: sb.branch_name,
                createdAt: new Date(sb.created_at || Date.now()).toLocaleDateString(),
              }));
              if (mappedSubBranches.length > 0) {
                set({ subBranchesList: mappedSubBranches });
              }
            }
          } catch (_e) {
            // Keep default sub-branches list if backend endpoint is unavailable
          }

          // Fetch Workspaces from backend if available
          try {
            const wsRes = await axiosInstance.get("/super-admin/workspaces");
            if (wsRes.data && wsRes.data.success && Array.isArray(wsRes.data.data)) {
              const mappedWorkspaces: ClientWorkspace[] = (wsRes.data.data as RawWorkspace[]).map((w) => ({
                id: w.workspace_id,
                name: w.workspace_name,
                code: w.workspace_code || "WS-01",
                plan: "Enterprise Platinum",
                status: w.is_active ? "Active" : "Suspended",
                userCount: 0,
                adminName: "Assigned via Sub-Branch",
              }));
              if (mappedWorkspaces.length > 0) {
                set({ clients: mappedWorkspaces });
              }
            }
          } catch (_e) {
            // Keep default clients
          }
        } catch (err) {
          console.warn("Could not fetch branches from backend API:", err);
        } finally {
          set({ isLoading: false });
        }
      },

      // ==========================================
      // FETCH USERS FROM BACKEND
      // ==========================================
      fetchUsers: async () => {
        try {
          set({ isLoading: true });
          // Fetch Client Admins and Managed Users
          const [clientsRes, usersRes] = await Promise.allSettled([
            axiosInstance.get("/super-admin/clients"),
            axiosInstance.get("/admin/users/list"),
          ]);

          const userMap = new Map<string, SuperAdminUser>();

          if (clientsRes.status === "fulfilled" && clientsRes.value.data?.success) {
            const clientsList: RawUser[] = clientsRes.value.data.data || [];
            const mappedClients: SuperAdminUser[] = clientsList.map((c) => ({
              id: c.user_id,
              name: c.full_name || c.workspace || c.email.split("@")[0],
              phone: c.contact_number || "",
              email: c.email,
              clientWorkspace: c.workspace_code || c.workspace || "",
              workspaceCode: c.workspace_code || c.workspace,
              workspaceName: c.workspace_name || c.workspace,
              branchName: c.branch_name,
              subBranch: c.sub_branch || c.sub_branch_id,
              assignedAdmin: c.created_by_admin_name
                ? `${c.created_by_admin_name} (${c.created_by_admin_email})`
                : "Super Admin HQ",
              assignedAdminEmail: c.created_by_admin_email,
              role: ((c.role || "ADMIN").toUpperCase() as SuperAdminUser["role"]),
              status: c.is_active === 1 ? "Active" : "Suspended",
              lastLogin: "Active Today",
              createdDate: new Date(c.created_at || Date.now()).toLocaleDateString(),
            }));

            mappedClients.forEach((u) => {
              userMap.set(u.email.toLowerCase(), u);
            });
          }

          if (usersRes.status === "fulfilled" && usersRes.value.data?.success) {
            const subUsersList: RawUser[] = usersRes.value.data.data || [];
            const mappedSubUsers: SuperAdminUser[] = subUsersList.map((u) => ({
              id: u.user_id,
              name: u.full_name || u.workspace || u.email.split("@")[0],
              phone: u.contact_number || "",
              email: u.email,
              clientWorkspace: u.workspace_code || u.workspace || "",
              workspaceCode: u.workspace_code || u.workspace,
              workspaceName: u.workspace_name || u.workspace,
              branchName: u.branch_name,
              subBranch: u.sub_branch || u.sub_branch_id,
              assignedAdmin: u.created_by_admin_name
                ? `${u.created_by_admin_name} (${u.created_by_admin_email})`
                : "Client Admin",
              assignedAdminEmail: u.created_by_admin_email,
              role: ((u.role || "AUTHOR").toUpperCase() as SuperAdminUser["role"]),
              status: u.is_active === 1 ? "Active" : "Suspended",
              lastLogin: "Active Today",
              createdDate: new Date(u.created_at || Date.now()).toLocaleDateString(),
            }));

            mappedSubUsers.forEach((u) => {
              if (!userMap.has(u.email.toLowerCase())) {
                userMap.set(u.email.toLowerCase(), u);
              }
            });
          }

          const uniqueUsers = Array.from(userMap.values());
          if (uniqueUsers.length > 0) {
            set({ users: uniqueUsers });
          }
        } catch (err) {
          console.warn("Could not fetch users from backend API:", err);
        } finally {
          set({ isLoading: false });
        }
      },

      // ==========================================
      // FETCH AUDIT LOGS FROM BACKEND
      // ==========================================
      fetchActivityLogs: async () => {
        try {
          const res = await axiosInstance.get("/admin/audit-trail");
          if (res.data && res.data.success && Array.isArray(res.data.data)) {
            const logs: ActivityLog[] = (res.data.data as RawAuditLog[]).map((l) => ({
              id: l.audit_id,
              performedBy: l.actor_name || "Admin",
              performedByRole: l.actor_role || "Admin",
              activity: l.action || "Admin Action",
              activityDescription: l.description || "Activity performed",
              affectedUser: l.target_name || "User",
              affectedTarget: `Target (${l.target_name || "System"})`,
              dateTime: new Date(l.created_at || Date.now()).toLocaleString(),
              status: "Successful",
              category: "Admin Activity",
            }));
            set({ activityLogs: logs });
          }
        } catch (err) {
          console.warn("Could not fetch audit logs:", err);
        }
      },

      // ==========================================
      // ADD BRANCH TO BACKEND
      // ==========================================
      addBranch: async (branchData) => {
        try {
          const payload = {
            country: branchData.country,
            city: branchData.city,
            state_province_region: branchData.state || "",
            branch_code: branchData.code,
            branch_name: branchData.name,
          };
          const res = await axiosInstance.post("/super-admin/branches", payload);
          if (res.data && res.data.success) {
            await get().fetchBranches();
          }
        } catch (err: unknown) {
          const apiErr = err as { response?: { data?: unknown }; message?: string };
          console.warn("Failed to create branch via API:", apiErr?.response?.data || apiErr?.message);
        }

        // Fallback local update
        set((state) => {
          const newBranch: Branch = {
            id: `br-${Date.now()}`,
            ...branchData,
          };
          return { branches: [newBranch, ...state.branches] };
        });
      },

      deleteBranch: (id) => {
        set((state) => ({
          branches: state.branches.filter((b) => b.id !== id),
        }));
      },

      // ==========================================
      // WORKSPACE ACTIONS
      // ==========================================
      addWorkspace: async (wsData) => {
        let wsId = `ws-${Date.now()}`;
        try {
          const res = await axiosInstance.post("/super-admin/workspaces", {
            workspace_name: wsData.name,
            workspace_code: wsData.code,
          });
          if (res.data?.success && res.data.data?.workspace_id) {
            wsId = res.data.data.workspace_id;
          }
        } catch (_e) {
          console.warn("Could not save workspace to backend, using local state:", _e);
        }

        const newWs: ClientWorkspace = {
          id: wsId,
          name: wsData.name,
          code: wsData.code,
          plan: "Enterprise Platinum",
          status: "Active",
          userCount: 0,
          adminName: "Assigned via Sub-Branch",
          branchName: wsData.branchName,
        };
        set((state) => ({
          clients: [newWs, ...state.clients.filter((c) => c.name.toLowerCase() !== wsData.name.toLowerCase())],
        }));
      },

      deleteWorkspace: (id) => {
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
          subBranchesList: state.subBranchesList.filter((sb) => sb.workspaceId !== id),
        }));
      },

      // ==========================================
      // WORKSPACE SUB-BRANCH ACTIONS
      // ==========================================
      addWorkspaceSubBranch: async (subBranchData) => {
        let sbId = `sb-${Date.now()}`;
        try {
          // Find matching branch
          const branch = get().branches.find(
            (b) => b.id === subBranchData.branchId || b.name === subBranchData.branchName
          ) || get().branches[0];

          if (branch?.id && branch.id.length > 20) {
            const payload: Record<string, unknown> = {
              branch_id: branch.id,
              workspace_name: subBranchData.workspaceName,
              sub_branch: subBranchData.address,
              workspace_code: subBranchData.code,
            };
            if (subBranchData.workspaceId && subBranchData.workspaceId.length > 20) {
              payload.workspace_id = subBranchData.workspaceId;
            }
            const res = await axiosInstance.post("/super-admin/sub-branches", payload);
            if (res.data?.success && res.data.data?.sub_branch_id) {
              sbId = res.data.data.sub_branch_id;
            }
          }
        } catch (_e) {
          console.warn("Could not save sub-branch to backend, using local state:", _e);
        }

        const newSubBranch: WorkspaceSubBranch = {
          id: sbId,
          workspaceId: subBranchData.workspaceId || `ws-${Date.now()}`,
          workspaceName: subBranchData.workspaceName,
          code: subBranchData.code,
          address: subBranchData.address,
          branchId: subBranchData.branchId,
          branchName: subBranchData.branchName,
          createdAt: new Date().toLocaleDateString(),
        };
        set((state) => ({
          subBranchesList: [newSubBranch, ...state.subBranchesList],
        }));
      },

      deleteWorkspaceSubBranch: (id) => {
        set((state) => ({
          subBranchesList: state.subBranchesList.filter((sb) => sb.id !== id),
        }));
      },

      // ==========================================
      // ADD USER / REGISTER CLIENT ADMIN IN BACKEND
      // ==========================================
      addUser: async (userData) => {
        const roleUpper = userData.role.toUpperCase();

        // Find branch and sub_branch UUID if selected or matched
        const matchedSb = get().subBranchesList.find(
          (sb) =>
            sb.code.toLowerCase() === (userData.clientWorkspace || "").trim().toLowerCase() ||
            sb.address.toLowerCase() === (userData.subBranch || "").trim().toLowerCase()
        );

        const foundBranch = get().branches.find(
          (b) => b.name === userData.branchName || b.id === userData.branchName
        );
        const validBranchId =
          (foundBranch?.id && foundBranch.id.length > 20 ? foundBranch.id : undefined) ||
          (matchedSb?.workspaceId && matchedSb.workspaceId.length > 20 ? matchedSb.workspaceId : undefined);

        const resolvedSubBranchId =
          matchedSb?.id && matchedSb.id.length > 20 ? matchedSb.id : userData.subBranch || "";

        try {
          if (roleUpper === "ADMIN") {
            // Super Admin registers Client Admin
            const payload: Record<string, unknown> = {
              workspace: userData.clientWorkspace,
              email: userData.email,
              password: userData.password || "",
              full_name: userData.name,
              contact_number: userData.phone,
              sub_branch_id: resolvedSubBranchId,
            };
            if (validBranchId) {
              payload.branch_id = validBranchId;
            }
            await axiosInstance.post("/super-admin/clients", payload);
          } else {
            // Admin registers Author or Reviewer
            const payload: Record<string, unknown> = {
              workspace: userData.clientWorkspace,
              full_name: userData.name,
              contact_number: userData.phone,
              email: userData.email,
              password: userData.password || "",
              role: userData.role.toLowerCase(),
              sub_branch_id: resolvedSubBranchId,
            };
            if (validBranchId) {
              payload.branch_id = validBranchId;
            }
            await axiosInstance.post("/admin/users", payload);
          }

          // Re-sync with Database
          await get().fetchUsers();
        } catch (err: unknown) {
          const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
          console.error("Backend registration error:", apiErr?.response?.data || apiErr?.message);
          const errorMsg =
            apiErr?.response?.data?.message || apiErr?.message || "Failed to register user in backend";
          throw new Error(errorMsg, { cause: err });
        }

        // Save to local fallback credential store so dev mode / offline login works
        try {
          const rawReg = localStorage.getItem("custom_registered_users");
          const regList = rawReg ? JSON.parse(rawReg) : [];
          regList.push({
            workspace: userData.clientWorkspace,
            email: userData.email.toLowerCase(),
            password: userData.password || "",
            name: userData.name,
            role: userData.role,
          });
          localStorage.setItem("custom_registered_users", JSON.stringify(regList));
        } catch (_e) {
          console.warn("Failed to save custom registered user locally:", _e);
        }
      },

      updateUser: (id, updatedData) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updatedData } : u)),
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
      },

      // ==========================================
      // TOGGLE STATUS IN BACKEND
      // ==========================================
      toggleUserStatus: async (id) => {
        const user = get().users.find((u) => u.id === id);
        if (!user) return;

        const nextStatus = user.status === "Active" ? "Suspended" : "Active";
        const isActiveNum = nextStatus === "Active" ? 1 : 0;

        try {
          if (user.role === "ADMIN") {
            await axiosInstance.post("/super-admin/clients/status", {
              user_id: user.id,
              is_active: isActiveNum,
              reason: `Toggled via Super Admin Portal to ${nextStatus}`,
            });
          } else {
            const endpoint = isActiveNum === 1 ? "/admin/users/activate" : "/admin/users/deactivate";
            await axiosInstance.post(endpoint, {
              user_id: user.id,
              reason: `Toggled via Portal to ${nextStatus}`,
            });
          }
        } catch (err: unknown) {
          const apiErr = err as { response?: { data?: unknown }; message?: string };
          console.warn("Failed to update status on backend:", apiErr?.response?.data || apiErr?.message);
        }

        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, status: nextStatus } : u)),
        }));
      },

      logActivity: (logData) => {
        const newLog: ActivityLog = {
          id: `log-${Date.now()}`,
          ...logData,
        };
        set((state) => ({
          activityLogs: [newLog, ...state.activityLogs],
        }));
      },
    }),
    {
      name: "super_admin_portal_v1",
    }
  )
);
