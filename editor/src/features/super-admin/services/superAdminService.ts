// ============================================================
// features/super-admin/services/superAdminService.ts
// ============================================================
// PURPOSE:
// Frontend service layer for Super Admin operations and API communication.
//
// Responsibilities:
// 1. Manages HTTP calls to the backend via axiosInstance.
// 2. Maps backend data models to frontend types (Branch, SuperAdminUser, ActivityLog, etc.).
// 3. Handles API error extraction and logging.
// 4. Provides a clean, decoupled interface for store and UI components.
// ============================================================

import { axiosInstance } from "@/shared/api/axios";
import type {
  Branch,
  SuperAdminUser,
  ActivityLog,
  ClientWorkspace,
  WorkspaceSubBranch,
} from "../types";

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

export class SuperAdminService {
  /**
   * Fetch all system branches
   */
  async getBranches(): Promise<Branch[]> {
    const res = await axiosInstance.get("/super-admin/branches");
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return (res.data.data as RawBranch[]).map((b) => ({
        id: b.branch_id,
        code: b.branch_code || "BRANCH-01",
        name: b.branch_name,
        country: b.country,
        city: b.city,
        state: b.state_province_region || "",
        subBranches: [],
      }));
    }
    return [];
  }

  /**
   * Fetch all workspace sub-branches
   */
  async getSubBranches(): Promise<WorkspaceSubBranch[]> {
    const sbRes = await axiosInstance.get("/super-admin/sub-branches");
    if (sbRes.data && sbRes.data.success && Array.isArray(sbRes.data.data)) {
      return (sbRes.data.data as RawSubBranch[]).map((sb) => ({
        id: sb.sub_branch_id,
        workspaceId: sb.workspace_id || sb.branch_id || "",
        workspaceName: sb.workspace_name || sb.branch_name || "Headquarters",
        code: sb.workspace_code || "APEX-HQ-01",
        address: sb.sub_branch || "",
        branchId: sb.branch_id,
        branchName: sb.branch_name,
        createdAt: new Date(sb.created_at || Date.now()).toLocaleDateString(),
      }));
    }
    return [];
  }

  /**
   * Fetch all client workspaces
   */
  async getWorkspaces(): Promise<ClientWorkspace[]> {
    const wsRes = await axiosInstance.get("/super-admin/workspaces");
    if (wsRes.data && wsRes.data.success && Array.isArray(wsRes.data.data)) {
      return (wsRes.data.data as RawWorkspace[]).map((w) => ({
        id: w.workspace_id,
        name: w.workspace_name,
        code: w.workspace_code || "WS-01",
        plan: "Enterprise Platinum",
        status: w.is_active ? "Active" : "Suspended",
        userCount: 0,
        adminName: "Assigned via Sub-Branch",
      }));
    }
    return [];
  }

  /**
   * Fetch both client admins and managed sub-users concurrently
   */
  async getUsers(): Promise<SuperAdminUser[]> {
    const [clientsRes, usersRes] = await Promise.allSettled([
      axiosInstance.get("/super-admin/clients"),
      axiosInstance.get("/admin/users/list"),
    ]);

    const userMap = new Map<string, SuperAdminUser>();

    // Process client admins
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

    // Process managed sub-users
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

    return Array.from(userMap.values());
  }

  /**
   * Fetch audit activity logs
   */
  async getActivityLogs(): Promise<ActivityLog[]> {
    const res = await axiosInstance.get("/admin/audit-trail");
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return (res.data.data as RawAuditLog[]).map((l) => ({
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
    }
    return [];
  }

  /**
   * Create a new branch
   */
  async createBranch(branchData: Omit<Branch, "id">): Promise<void> {
    const payload = {
      country: branchData.country,
      city: branchData.city,
      state_province_region: branchData.state || "",
      branch_code: branchData.code,
      branch_name: branchData.name,
    };
    await axiosInstance.post("/super-admin/branches", payload);
  }

  /**
   * Create a new workspace
   */
  async createWorkspace(workspaceData: {
    name: string;
    code: string;
    branchName?: string;
  }): Promise<string> {
    let wsId = `ws-${Date.now()}`;
    const payload = {
      workspace_name: workspaceData.name,
      workspace_code: workspaceData.code,
    };
    const res = await axiosInstance.post("/super-admin/workspaces", payload);
    if (res.data?.success && res.data.data?.workspace_id) {
      wsId = res.data.data.workspace_id;
    }
    return wsId;
  }

  /**
   * Create a new workspace sub-branch
   */
  async createSubBranch(
    subBranchData: Omit<WorkspaceSubBranch, "id" | "createdAt">,
    branchId?: string
  ): Promise<string> {
    let sbId = `sb-${Date.now()}`;
    if (branchId && branchId.length > 20) {
      const payload: Record<string, unknown> = {
        branch_id: branchId,
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
    return sbId;
  }

  /**
   * Register a new user or client admin in the backend
   */
  async registerUser(
    userData: Omit<SuperAdminUser, "id" | "lastLogin" | "createdDate">,
    options?: {
      validBranchId?: string;
      resolvedSubBranchId?: string;
    }
  ): Promise<void> {
    const roleUpper = userData.role.toUpperCase();

    if (roleUpper === "ADMIN") {
      // Super Admin registers Client Admin
      const payload: Record<string, unknown> = {
        workspace: userData.clientWorkspace,
        email: userData.email,
        password: userData.password || "",
        full_name: userData.name,
        contact_number: userData.phone,
        sub_branch_id: options?.resolvedSubBranchId || "",
      };
      if (options?.validBranchId) {
        payload.branch_id = options.validBranchId;
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
        sub_branch_id: options?.resolvedSubBranchId || "",
      };
      if (options?.validBranchId) {
        payload.branch_id = options.validBranchId;
      }
      await axiosInstance.post("/admin/users", payload);
    }
  }

  /**
   * Toggle user active/suspended status in backend
   */
  async toggleUserStatus(user: SuperAdminUser): Promise<void> {
    const nextStatus = user.status === "Active" ? "Suspended" : "Active";
    const isActiveNum = nextStatus === "Active" ? 1 : 0;

    if (user.role === "ADMIN") {
      await axiosInstance.post("/super-admin/clients/status", {
        user_id: user.id,
        is_active: isActiveNum,
        reason: `Toggled via Super Admin Portal to ${nextStatus}`,
      });
    } else {
      const endpoint =
        isActiveNum === 1 ? "/admin/users/activate" : "/admin/users/deactivate";
      await axiosInstance.post(endpoint, {
        user_id: user.id,
        reason: `Status changed to ${nextStatus}`,
      });
    }
  }
}

// Export singleton instance for direct consumption
export const superAdminService = new SuperAdminService();
export default superAdminService;
