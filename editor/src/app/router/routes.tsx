// routes.tsx
// PURPOSE:
// This file is the central routing configuration for the application.
// RESPONSIBILITIES:
// 1. Define application URLs/routes.
// 2. Connect URLs to React components/pages.
// 3. Define which layout should wrap each route.
// 4. Protect authenticated routes using AuthGuard.
// 5. Protect guest-only routes using GuestGuard.
// 6. Protect role-specific routes using RoleGuard.
// 7. Redirect users based on authentication and role.
// 8. Load selected pages through LazyRoutes.
// IMPORTANT:
// This file does NOT directly call the backend.
//
// Authentication information comes from useAuth().
// AuthGuard / GuestGuard / RoleGuard decide whether the
// current user can access a route.
// Backend integration normally happens inside AuthProvider
// and the authentication service, not directly here.


import React from "react";

// RouteObject is the TypeScript type used by React Router
// for route configuration.
import type { RouteObject } from "react-router-dom";

// Navigate is used to redirect the user to another route.
import { Navigate } from "react-router-dom";


// APPLICATION LAYOUTS
// RootLayout -> Top-level application wrapper.
import { RootLayout } from "../layouts/RootLayout";

// AuthLayout -> Common layout for Login / Forgot Password / Reset Password.
import { AuthLayout } from "../layouts/AuthLayout";

// DashboardLayout -> Common layout for Admin dashboard pages.
import { DashboardLayout } from "../layouts/DashboardLayout";

// EditorLayout -> Common layout for Editor pages.
import { EditorLayout } from "../layouts/EditorLayout";

// ROUTE GUARDS

// AuthGuard -> Allows only authenticated users.
import { AuthGuard } from "../guards/AuthGuard";

// GuestGuard -> Allows only unauthenticated users.
//    Example: Login page should normally be for guests.
import { GuestGuard } from "../guards/GuestGuard";

// RoleGuard -> Allows access only to users with specific roles.
import { RoleGuard } from "../guards/RoleGuard";



// ROUTE CONFIGURATION

// Role enum -> Central list of supported user roles.
import { Role } from "../config/roles";

// ROUTE_PATHS -> Centralized route path definitions.
import { ROUTE_PATHS } from "./routePaths";


// AUTHENTICATION HOOK Provides the current authentication state and user.
import { useAuth } from "@/features/auth/index";


import {
  ResetPassword,
  ForgotPassword,
} from "@/features/auth";

// AUTHENTICATION PAGES Password reset form.
 

//  Forgot password page.



// LAZY-LOADED PAGES -> These pages are loaded through LazyRoutes.
// This helps reduce the initial bundle size because the
// application does not need to load every page immediately.
import {
  PortalLoginPage,
  DashboardHome,
  EditorPage,
  UsersPage
} from "./LazyRoutes";


// RootRedirector
// PURPOSE:
// Decides where the user should go when they visit: The destination depends on:
// 1. Whether the user is authenticated.
// 2. The user's role.

const RootRedirector: React.FC = () => {

  // Get current authentication state.isAuthenticated:-> true if user has a valid authenticated session.
  // user: -> Current authenticated user.
const { isAuthenticated, user } = useAuth();


  // USER IS NOT LOGGED IN  Send the user to Login.
  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTE_PATHS.LOGIN}
        replace
      />
    );
  }

  // USER IS AUTHENTICATED --> Decide where the user should go based on their role.
  switch (user?.role) 
  {
     // Admin users go to Dashboard.
    case Role.Admin:
      return (
        <Navigate
          to={ROUTE_PATHS.DASHBOARD}
          replace
        />
      );


    // Author users go to Editor.
    case Role.Author:
      return (
        <Navigate
          to={ROUTE_PATHS.EDITOR}
          replace
        />
      );


    
    // UNKNOWN / INVALID ROLE -> If no valid role is found, send the user to Login.
    default:
      return (
        <Navigate
          to={ROUTE_PATHS.LOGIN}
          replace
        />
      );
  }
};


// APPLICATION ROUTES  RouteObject[] means: "This is an array of React Router route definitions."

export const routes: RouteObject[] = [

  
  // ROOT ROUTE
  
  {
    path: ROUTE_PATHS.ROOT,

    // RootLayout becomes the parent layout for all children.
    element: <RootLayout />,

    children: [

     
      // DEFAULT ROOT ROUTE
      // When the user visits "/", RootRedirector decides where to send them.
      {
        index: true,
        element: <RootRedirector />,
      },


      // GUEST ROUTES  -> These routes are intended for users who are NOT logged in.
      // GuestGuard prevents authenticated users from accessing these pages.
      

      {
        element: (

          // GuestGuard checks authentication state.
          <GuestGuard>

            {/* AuthLayout provides common auth-page UI. */}
            <AuthLayout />

          </GuestGuard>
        ),

        children: [

          // LOGIN
          
          {
            path: ROUTE_PATHS.LOGIN,

            // Lazy-loaded Login page.
            element: <PortalLoginPage />,
          },


          
          // FORGOT PASSWORD
          {
            path: ROUTE_PATHS.FORGOT_PASSWORD,

            // Forgot Password page.
            element: <ForgotPassword />,
          },


          
          // RESET PASSWORD
          {
            path: ROUTE_PATHS.RESET_PASSWORD,

            // Password reset form.
            element: <ResetPassword />,
          },
        ],
      },


      
      // ADMIN ROUTES
      // These routes require:
      // 1. User must be authenticated.
      // 2. User must have Admin role.
      {
        element: (

          // AuthGuard checks whether the user is logged in.
          <AuthGuard>

            {/* DashboardLayout provides sidebar/header/etc. */}
            <DashboardLayout />

          </AuthGuard>
        ),

        children: [

          
          // ADMIN DASHBOARD
          {
            path: ROUTE_PATHS.DASHBOARD,

            element: (

              // Only Admin users can access this page.
              <RoleGuard
                allowedRoles={[Role.Admin]}
              >

                <DashboardHome />

              </RoleGuard>
            ),
          },


          
          // USERS MANAGEMENT
          {
            // IMPORTANT: This path is currently written directly here.
            // Prefer ROUTE_PATHS.USERS for consistency.
            path: "/dashboard/users",

            element: (

              // Only Admin users can access Users page.
              <RoleGuard
                allowedRoles={[Role.Admin]}
              >

                <UsersPage />

              </RoleGuard>
            ),
          },
        ],
      },


      // AUTHOR / EDITOR ROUTES
      // These routes require:
      // 1. User must be authenticated.
      // 2. User must have Author role.
     {
        element: (

          // User must be logged in.
          <AuthGuard>

            
            <EditorLayout />

          </AuthGuard>
        ),

        children: [

        
          // EDITOR
        {
            path: ROUTE_PATHS.EDITOR,

            element: (

              // Allow Admin and Author roles
              <RoleGuard
                allowedRoles={[Role.Admin, Role.Author]}
              >

                <EditorPage />

              </RoleGuard>
            ),
          },
        ],
      },


      
      // UNKNOWN ROUTES  -> If user visits a URL that does not exist,
      // RootRedirector decides where they should go.
      
      {
        path: "*",
        element: <RootRedirector />,
      },
    ],
  },
];
