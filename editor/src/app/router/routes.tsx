
import React from "react";
import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";

import { RootLayout } from "../layouts/RootLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { EditorLayout } from "../layouts/EditorLayout";
// import SuperAdminLayout from "../layouts/SuperAdminLayout";

import { AuthGuard } from "../guards/AuthGuard";
import { GuestGuard } from "../guards/GuestGuard";
import { RoleGuard } from "../guards/RoleGuard";

import { Role, normalizeRole } from "../config/roles";
import { ROUTE_PATHS } from "./routePaths";
import { useAuth } from "@/features/auth/index";

import {
  ResetPassword,
  ForgotPassword,
} from "@/features/auth";

import {
  PortalLoginPage,
  DashboardHome,
  EditorPage,
  UsersPage,
} from "./LazyRoutes";

// Super Admin pages
// import {
//   SuperAdminLogin,
//   SuperAdminDashboard,
//   SuperAdminUsersPage,
//   AdminsPage,
//   BranchesPage,
//   ClientsPage,
//   WorkspacesPage,
//   ActivityTrackingPage,
//   NotificationsPage,
//   RegisterAdminPage,
//   ReportsPage,
//   SecuritySessionsPage,
//   SubBranchesPage,
//   SubscriptionsPage,
//   SystemSettingsPage,
// } from "@/features/super-admin";

// --------------------------------------------------
// ROOT REDIRECTOR
// --------------------------------------------------

const RootRedirector: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  }

  const userRole = normalizeRole(user?.role);

  switch (userRole) {
    // case Role.SuperAdmin:
    //   return (
    //     <Navigate
    //       to={ROUTE_PATHS.SUPER_ADMIN_DASHBOARD}
    //       replace
    //     />
    //   );

    case Role.Admin:
      return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;

    case Role.Author:
      return <Navigate to={ROUTE_PATHS.EDITOR} replace />;

    default:
      return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  }
};

// --------------------------------------------------
// ROUTES
// --------------------------------------------------

export const routes: RouteObject[] = [
  {
    path: ROUTE_PATHS.ROOT,
    element: <RootLayout />,
    children: [
      // Root redirect
      {
        index: true,
        element: <RootRedirector />,
      },

      // ----------------------------------------------
      // GUEST ROUTES
      // ----------------------------------------------

      {
        element: (
          <GuestGuard>
            <AuthLayout />
          </GuestGuard>
        ),
        children: [
          {
            path: ROUTE_PATHS.LOGIN,
            element: <PortalLoginPage />,
          },
          {
            path: ROUTE_PATHS.FORGOT_PASSWORD,
            element: <ForgotPassword />,
          },
          {
            path: ROUTE_PATHS.RESET_PASSWORD,
            element: <ResetPassword />,
          },
        ],
      },

      // Super Admin login uses its own login page layout.
      // {
      //   path: ROUTE_PATHS.SUPER_ADMIN_LOGIN,
      //   element: (
      //     <GuestGuard>
      //       <SuperAdminLogin />
      //     </GuestGuard>
      //   ),
      // },

      // ----------------------------------------------
      // ADMIN DASHBOARD ROUTES
      // ----------------------------------------------

      {
        element: (
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        ),
        children: [
          {
            path: ROUTE_PATHS.DASHBOARD,
            element: (
              <RoleGuard allowedRoles={[Role.Admin]}>
                <DashboardHome />
              </RoleGuard>
            ),
          },
          {
            path: ROUTE_PATHS.USERS,
            element: (
              <RoleGuard allowedRoles={[Role.Admin]}>
                <UsersPage />
              </RoleGuard>
            ),
          },
        ],
      },

      // ----------------------------------------------
      // EDITOR ROUTES
      // ----------------------------------------------

      {
        element: (
          <AuthGuard>
            <EditorLayout />
          </AuthGuard>
        ),
        children: [
          {
            path: ROUTE_PATHS.EDITOR,
            element: (
              <RoleGuard allowedRoles={[Role.Admin, Role.Author]}>
                <EditorPage />
              </RoleGuard>
            ),
          },
        ],
      },

      // ----------------------------------------------
      // SUPER ADMIN ROUTES
      // ----------------------------------------------

      // {
      //   element: (
      //     <AuthGuard>
      //       <RoleGuard allowedRoles={[Role.SuperAdmin]}>
      //         <SuperAdminLayout />
      //       </RoleGuard>
      //     </AuthGuard>
      //   ),
      //   children: [
      //     {
      //       path: "/super-admin",
      //       element: (
      //         <Navigate
      //           to={ROUTE_PATHS.SUPER_ADMIN_DASHBOARD}
      //           replace
      //         />
      //       ),
      //     },
      //     {
      //       path: ROUTE_PATHS.SUPER_ADMIN_DASHBOARD,
      //       element: <SuperAdminDashboard />,
      //     },
      //     {
      //       path: ROUTE_PATHS.SUPER_ADMIN_USERS,
      //       element: <SuperAdminUsersPage />,
      //     },
      //     {
      //       path: ROUTE_PATHS.SUPER_ADMIN_ADMINS,
      //       element: <AdminsPage />,
      //     },
      //     {
      //       path: ROUTE_PATHS.SUPER_ADMIN_BRANCHES,
      //       element: <BranchesPage />,
      //     },
      //     {
      //       path: "/super-admin/admins/branches",
      //       element: <BranchesPage />,
      //     },
      //     {
      //       path: ROUTE_PATHS.SUPER_ADMIN_CLIENTS,
      //       element: <ClientsPage />,
      //     },
      //     {
      //       path: ROUTE_PATHS.SUPER_ADMIN_WORKSPACES,
      //       element: <WorkspacesPage />,
      //     },
      //     {
      //       path: "/super-admin/admins/workspaces",
      //       element: <WorkspacesPage />,
      //     },
      //     {
      //       path: ROUTE_PATHS.SUPER_ADMIN_ACTIVITY,
      //       element: <ActivityTrackingPage />,
      //     },
      //     {
      //       path: ROUTE_PATHS.SUPER_ADMIN_NOTIFICATIONS,
      //       element: <NotificationsPage />,
      //     },
      //     {
      //       path: ROUTE_PATHS.SUPER_ADMIN_REGISTER_ADMIN,
      //       element: <RegisterAdminPage />,
      //     },
      //     {
      //       path: ROUTE_PATHS.SUPER_ADMIN_REPORTS,
      //       element: <ReportsPage />,
      //     },
      //     {
      //       path: ROUTE_PATHS.SUPER_ADMIN_SESSIONS,
      //       element: <SecuritySessionsPage />,
      //     },
      //     {
      //       path: "/super-admin/security",
      //       element: <SecuritySessionsPage />,
      //     },
      //     {
      //       path: ROUTE_PATHS.SUPER_ADMIN_SUB_BRANCHES,
      //       element: <SubBranchesPage />,
      //     },
      //     {
      //       path: "/super-admin/admins/sub-branches",
      //       element: <SubBranchesPage />,
      //     },
      //     {
      //       path: ROUTE_PATHS.SUPER_ADMIN_SUBSCRIPTIONS,
      //       element: <SubscriptionsPage />,
      //     },
      //     {
      //       path: ROUTE_PATHS.SUPER_ADMIN_SETTINGS,
      //       element: <SystemSettingsPage />,
      //     },
      //   ],
      // },

      // ----------------------------------------------
      // UNKNOWN ROUTES
      // ----------------------------------------------

      {
        path: "*",
        element: <RootRedirector />,
      },
    ],
  },
];
