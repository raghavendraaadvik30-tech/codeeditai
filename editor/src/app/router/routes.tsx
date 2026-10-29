
import React from "react";
import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";

import { RootLayout } from "../layouts/RootLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { EditorLayout } from "../layouts/EditorLayout";
import SuperAdminLayout from "../layouts/SuperAdminLayout";

import { AuthGuard } from "../guards/AuthGuard";
import { GuestGuard } from "../guards/GuestGuard";
import { RoleGuard } from "../guards/RoleGuard";

import { Role } from "../config/roles";
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
import SuperAdminLoginPage from "@/features/superAdmin/pages/SuperAdminLoginPage";
import SuperAdminDashboardPage from "@/features/superAdmin/pages/SuperAdminDashboardPage";
import SuperAdminUsersPage from "@/features/superAdmin/pages/SuperAdminUsersPage";
import AdminsPage from "@/features/superAdmin/pages/AdminsPage";
import BranchesPage from "@/features/superAdmin/pages/BranchesPage";
import ClientsPage from "@/features/superAdmin/pages/ClientsPage";
import WorkspacesPage from "@/features/superAdmin/pages/WorkspacesPage";
import ActivityTrackingPage from "@/features/superAdmin/pages/ActivityTrackingPage";
import NotificationPage from "@/features/superAdmin/pages/NotificationPage";
import RegisterAdminPage from "@/features/superAdmin/pages/RegisterAdminPage";
import ReportPage from "@/features/superAdmin/pages/ReportPage";
import SecuritySessionPage from "@/features/superAdmin/pages/SecuritySessionPage";
import SubBranchPage from "@/features/superAdmin/pages/SubBranchPage";
import SubscriptionsPage from "@/features/superAdmin/pages/SubscriptionsPage";
import SystemSettingsPage from "@/features/superAdmin/pages/SystemSettingsPage";

// --------------------------------------------------
// ROOT REDIRECTOR
// --------------------------------------------------

const RootRedirector: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  }

  switch (user?.role) {
    case Role.SuperAdmin:
      return (
        <Navigate
          to={ROUTE_PATHS.SUPER_ADMIN_DASHBOARD}
          replace
        />
      );

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
      {
        path: ROUTE_PATHS.SUPER_ADMIN_LOGIN,
        element: (
          <GuestGuard>
            <SuperAdminLoginPage />
          </GuestGuard>
        ),
      },

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

      {
        path: "/super-admin",
        element: (
          <AuthGuard>
            <RoleGuard allowedRoles={[Role.SuperAdmin]}>
              <SuperAdminLayout />
            </RoleGuard>
          </AuthGuard>
        ),
        children: [
          {
            index: true,
            element: (
              <Navigate
                to={ROUTE_PATHS.SUPER_ADMIN_DASHBOARD}
                replace
              />
            ),
          },
          {
            path: ROUTE_PATHS.SUPER_ADMIN_DASHBOARD,
            element: <SuperAdminDashboardPage />,
          },
          {
            path: ROUTE_PATHS.SUPER_ADMIN_USERS,
            element: <SuperAdminUsersPage />,
          },
          {
            path: ROUTE_PATHS.SUPER_ADMIN_ADMINS,
            element: <AdminsPage />,
          },
          {
            path: ROUTE_PATHS.SUPER_ADMIN_BRANCHES,
            element: <BranchesPage />,
          },
          {
            path: ROUTE_PATHS.SUPER_ADMIN_CLIENTS,
            element: <ClientsPage />,
          },
          {
            path: ROUTE_PATHS.SUPER_ADMIN_WORKSPACES,
            element: <WorkspacesPage />,
          },
          {
            path: ROUTE_PATHS.SUPER_ADMIN_ACTIVITY,
            element: <ActivityTrackingPage />,
          },
          {
            path: ROUTE_PATHS.SUPER_ADMIN_NOTIFICATIONS,
            element: <NotificationPage />,
          },
          {
            path: ROUTE_PATHS.SUPER_ADMIN_REGISTER_ADMIN,
            element: <RegisterAdminPage />,
          },
          {
            path: ROUTE_PATHS.SUPER_ADMIN_REPORTS,
            element: <ReportPage />,
          },
          {
            path: ROUTE_PATHS.SUPER_ADMIN_SESSIONS,
            element: <SecuritySessionPage />,
          },
          {
            path: ROUTE_PATHS.SUPER_ADMIN_SUB_BRANCHES,
            element: <SubBranchPage />,
          },
          {
            path: ROUTE_PATHS.SUPER_ADMIN_SUBSCRIPTIONS,
            element: <SubscriptionsPage />,
          },
          {
            path: ROUTE_PATHS.SUPER_ADMIN_SETTINGS,
            element: <SystemSettingsPage />,
          },
        ],
      },

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
