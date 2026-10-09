// ============================================================
// features/dashboard/index.ts
// ============================================================
// PUBLIC ENTRY POINT FOR DASHBOARD FEATURE
//
// Other parts of the application should import dashboard
// functionality from this file instead of accessing internal
// dashboard folders directly.
//
// Example:
//
// import {
//   Dashboard,
//   Users,
//   DashboardOverview,
//   useDashboard,
// } from "@/features/dashboard";
// ============================================================


// ------------------------------------------------------------
// Pages
// ------------------------------------------------------------

export { default as Dashboard } from "./pages/Dashboard";

export { default as Users } from "./pages/Users";


// ------------------------------------------------------------
// Components
// ------------------------------------------------------------

export { default as DashboardOverview }
  from "./components/DashboardOverview";

export { default as UserManagement }
  from "./components/UserManagement";


// ------------------------------------------------------------
// Hooks
// ------------------------------------------------------------

export { useDashboard }
  from "./hooks/useDashboard";


// ------------------------------------------------------------
// API
// ------------------------------------------------------------

export {
  DashboardApi,
  dashboardApi,
} from "./api/dashboardApi";


// ------------------------------------------------------------
// Repository
// ------------------------------------------------------------

export {
  DashboardRepository,
  dashboardRepository,
} from "./repository/DashboardRepository";


// ------------------------------------------------------------
// Services
// ------------------------------------------------------------

export {
  DashboardService,
  dashboardService,
} from "./services/DashboardService";


// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export type {
  RawApiDashboardData,
  DashboardDomainModel,
} from "./types/dashboard.types";
