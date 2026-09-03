// LazyRoutes.tsx
// PURPOSE:
// This file defines the pages that should be loaded lazily.

// Lazy loading means the application does NOT load every page's JavaScript code when the application starts.
// Instead, a page is downloaded only when the user needs it.

// BENEFITS:
// 1. Faster initial application loading.
// 2. Smaller initial JavaScript bundle.
// 3. Better performance for larger applications.

// IMPORTANT:
// This file does NOT contain:
// - API calls
// - Backend logic
// - Authentication logic
// - Database logic
// - Business logic

// It only tells React how to dynamically import page components.

import { lazy } from "react";
// React.lazy() -> Creates a lazy-loaded React component.
// The imported page is loaded only when the component is actually rendered.
// These lazy components are later used by routes.tsx.


export const PortalLoginPage = lazy(() =>
  import("../../features/auth/index").then((module) => ({ default: module.Login }))
);

export const DashboardHome = lazy(() =>
  import("../../features/dashboard/index").then((module) => ({ default: module.Dashboard }))
);


export const UsersPage = lazy(() =>
  import("../../features/dashboard/index").then((module) => ({
    default: module.Dashboard,
  }))
);

export const EditorPage = lazy(() =>
  import("../../features/editor/index").then((module) => ({
    default: module.EditorPage,
  }))
);