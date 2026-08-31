// router.ts
// PURPOSE:
// This file creates the application's React Router instance.
// RESPONSIBILITIES:
// 1. Import the central route definitions.
// 2. Create a browser-based router using those routes.
// 3. Export the router so it can be provided to the application using <RouterProvider />.

// IMPORTANT:
// This file does NOT contain:
// - API calls
// - Authentication logic
// - Authorization logic
// - Database logic
// - Business logic

// The actual route definitions are maintained in routes.tsx.
// This file only converts those definitions into a router instance that React Router can use.
// createBrowserRouter creates a React Router instance that works with browser URLs and the History API.
import { createBrowserRouter } from "react-router-dom";


// Import the centralized route configuration.

// routes.tsx contains:
// - paths , - layouts, - pages, - guards, - redirects
import { routes } from "./routes";


// CREATE APPLICATION ROUTER
//  createBrowserRouter(routes) -> Takes your route definitions and creates the router.

// Example:

// routes.tsx
//     ↓
// routes
//     ↓
// createBrowserRouter(routes)
//     ↓
// router

// This router is then used by RouterProvider.

export const router = createBrowserRouter(routes);