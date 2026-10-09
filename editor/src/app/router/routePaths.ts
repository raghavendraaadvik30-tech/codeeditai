// routePaths.ts
// PURPOSE:
// This file contains all frontend URL/path definitions used by the application's router.
// WHY DO WE HAVE THIS FILE?
// Instead of writing URL strings such as "/login" or "/dashboard" in many different files, we define them once here and reuse them.
// RESPONSIBILITIES:
// 1. Store application route paths in one central location.
// 2. Prevent duplicate URL strings across the project.
// 3. Make route changes easier and safer.
// 4. Provide a single source of truth for route URLs.
// IMPORTANT:
// This file contains ONLY route configuration.
// It should NOT contain:
// - API calls
// - authentication logic
// - database logic
// - business logic
// - page components
// BACKEND:
// Backend integration normally does NOT require changes here.
// These are frontend URLs used by React Router.



// Export the route-path object so other files can import it.
// Example: import { ROUTE_PATHS } from "./routePaths";
// Then:

// ROUTE_PATHS.LOGIN
// ROUTE_PATHS.DASHBOARD
// ROUTE_PATHS.EDITOR

export const ROUTE_PATHS = {

  
  // ROOT -> "/" represents the application's root URL.
  // Example: http://localhost:3000/ Your routes.tsx uses this as the top-level route.


  ROOT: "/",


  // LOGIN -> URL used for the login page.
  // Example: http://localhost:3000/login


  LOGIN: "/login",


  
  // FORGOT PASSWORD -> URL used for the forgot-password page.
  // Example: http://localhost:3000/forgot-password
 
  FORGOT_PASSWORD: "/forgot-password",


  
  // RESET PASSWORD -> URL used for the password reset page.
  // Example: http://localhost:3000/reset-password

  RESET_PASSWORD: "/reset-password",


  // DASHBOARD -> URL used for the main dashboard page.
  // Example: http://localhost:3000/dashboard
  DASHBOARD: "/dashboard",


  
  // EDITOR ->URL used for the Editor page.
  // Example: http://localhost:3000/editor

  EDITOR: "/editor",



  // FUTURE ROUTES -> Additional routes such as Users, Settings, Documents,Reports, etc. should also be added here instead of writing route strings directly inside components.
  // Example:
  // USERS: "/dashboard/users",
  // SETTINGS: "/settings",
  // DOCUMENTS: "/documents",
  
  
} as const;
