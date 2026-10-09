// App.tsx
// PURPOSE:
// App.tsx is the main/root React component of the application.
// It connects two important application-level systems:
// 1. AppProvider -> Provides global services such as:
//       - React Query
//       - Authentication
// 2. RouterProvider -> Provides React Router navigation and route handling.
// App.tsx should remain simple.
// It should mainly compose the application structure.

// IMPORTANT:
// This file does NOT contain:
// - API calls
// - Database logic
// - Authentication implementation
// - Business logic
// - Individual page UI

// Those responsibilities belong to other files.
// RouterProvider provides the React Router instance to the entire application.
// It allows components to use routing features such as:
// - Link
// - useNavigate
// - useLocation
// - Outlet
// - route navigation
import { RouterProvider } from "react-router-dom";

// router.ts creates the browser router using routes.tsx.
import { router } from "./router";


// AppProvider is the central provider wrapper. It contains global providers such as:
// - QueryProvider
// - AuthProvider

import { AppProvider } from "./providers/AppProvider";

// App Component -> This is the main React component of the application.

// It combines:
//     AppProvider
//          ↓
//     RouterProvider
//          ↓
//       Application


export default function App() {

  return (

    
    // AppProvider
    // Provides global application services to everything inside it.
    // Current providers inside AppProvider:
    // AppProvider
    //    ├── QueryProvider
    //    └── AuthProvider
    // Therefore every route/page below this component can access
    // React Query and authentication state.
  
  <AppProvider>


      {/* RouterProvider
          Provides the React Router instance to the entire app.
          "router" comes from router.ts.
          router.ts
             ↓
          createBrowserRouter(routes)
             ↓
          RouterProvider
             ↓
          Application routes */}

      <RouterProvider router={router} />


    </AppProvider>
  );
}
