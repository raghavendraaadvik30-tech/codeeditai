// AppProvider

// PURPOSE:
// AppProvider is the central provider component of the application.
// It wraps the entire application with shared/global providers such as:

// 1. QueryProvider -> Provides React Query functionality.
// 2. AuthProvider   -> Provides authentication/user information.

// Because these providers are placed here, child components can
// access them without manually passing data through props.

// BACKEND:
// This file does NOT directly communicate with the backend.
// Backend/API communication should be implemented inside:

// - AuthProvider / authService
// - Query hooks
// - API services
// AppProvider only connects those providers together at the application level.



import React from "react";

// QueryProvider provides React Query functionality to the
// entire application.
// It is normally responsible for providing QueryClient and
// allowing components to use useQuery(), useMutation(), etc.
import { QueryProvider } from "./QueryProvider";

// AuthProvider provides authentication state and functions   such as:
// - current user
// - authentication status
// - login
// - logout
// - token/session handling
import { AuthProvider } from "../../features/auth/index";
import { SettingsProvider } from "../../features/editor/modules/settings";



// AppProviderProps

// Defines the props accepted by AppProvider.
// children:
// Represents all components placed inside <AppProvider>.
// Example:
// <AppProvider>
//     <App />
// </AppProvider>
// Here <App /> becomes "children".'
// React.ReactNode allows children to be:

// - JSX
// - Components
// - Text
// - Fragments
// - etc.


interface AppProviderProps {
  children: React.ReactNode;
}


// AppProvider Component

// React.FC<AppProviderProps>
// -> Defines this as a React functional component that accepts
//    AppProviderProps.

// ({ children })
// -> Extracts the children property from props.


export const AppProvider: React.FC<AppProviderProps> = ({
  children,
}) => {

  return (

    // QueryProvider
    
    // Makes React Query available to every component inside
    // this provider.
    
    // Child components can use:
    
    // useQuery()
    // useMutation()
    // useQueryClient()
    // without creating another QueryProvider.
   

    <QueryProvider>


      {/*          AuthProvider
          Makes authentication state available to all children.

          Components can access authentication through something
          like:

              const { user, logout } = useAuth();

          instead of passing user information manually through
          multiple components. */}

      <AuthProvider>
        <SettingsProvider>

          {/* children

              This is the actual application.

              Example:

              <AppProvider>
                <RouterProvider router={router} />
              </AppProvider>

              The RouterProvider would be rendered here. */}

          {children}
        </SettingsProvider>
      </AuthProvider>

    </QueryProvider>
  );
};
