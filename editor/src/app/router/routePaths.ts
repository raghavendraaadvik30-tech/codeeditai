
export const ROUTE_PATHS = {
  // General
  ROOT: "/",
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Admin
  DASHBOARD: "/dashboard",
  USERS: "/dashboard/users",

  // Editor
  EDITOR: "/editor",

  // Super Admin authentication
  SUPER_ADMIN_LOGIN: "/super-admin/login",

  // Super Admin pages
  SUPER_ADMIN_DASHBOARD: "/super-admin/dashboard",
  SUPER_ADMIN_USERS: "/super-admin/users",
  SUPER_ADMIN_ADMINS: "/super-admin/admins",
  SUPER_ADMIN_BRANCHES: "/super-admin/branches",
  SUPER_ADMIN_CLIENTS: "/super-admin/clients",
  SUPER_ADMIN_WORKSPACES: "/super-admin/workspaces",
  SUPER_ADMIN_ACTIVITY: "/super-admin/activity",
  SUPER_ADMIN_NOTIFICATIONS: "/super-admin/notifications",
  SUPER_ADMIN_REGISTER_ADMIN: "/super-admin/admins/register",
  SUPER_ADMIN_REPORTS: "/super-admin/reports",
  SUPER_ADMIN_SESSIONS: "/super-admin/sessions",
  SUPER_ADMIN_SUB_BRANCHES: "/super-admin/sub-branches",
  SUPER_ADMIN_SUBSCRIPTIONS: "/super-admin/subscriptions",
  SUPER_ADMIN_SETTINGS: "/super-admin/settings",
} as const;
