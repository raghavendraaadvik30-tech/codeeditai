// ============================================================
// dashboard.types.ts
// ============================================================
// PURPOSE:
// Defines the raw backend response and the clean frontend
// Dashboard domain model.
//
// CURRENT DASHBOARD:
// System Administration Overview
//
// Metrics:
// - Total Registered Users
// - Active Workspace Access Keys
// - Admin Accounts
// - Role Distribution
// ============================================================


// ------------------------------------------------------------
// RAW BACKEND RESPONSE
// ------------------------------------------------------------
// This must match the JSON returned by your backend.
// ------------------------------------------------------------

export interface RawApiDashboardData {
  total_registered_users: number;

  active_workspace_access_keys: number;

  admin_accounts: number;

  role_distribution: {
    admin: number;
    author: number;
    reviewer: number;
  };
}


// ------------------------------------------------------------
// FRONTEND DOMAIN MODEL
// ------------------------------------------------------------
// This is the clean structure used by React components.
// ------------------------------------------------------------

export interface DashboardDomainModel {
  totalUsers: number;

  activeWorkspaceAccessKeys: number;

  adminAccounts: number;

  roleDistribution: {
    admin: number;
    author: number;
    reviewer: number;
  };
}


// ------------------------------------------------------------
// USER
// ------------------------------------------------------------
// Keep this only if dashboard/user-related components need it.
// Do NOT store plain-text passwords in production.
// ------------------------------------------------------------

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "Admin" | "Author" | "Reviewer";
  status: "Active" | "Inactive" | "Suspended";
  createdDate: string;
}
