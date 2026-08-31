// QueryProvider
// PURPOSE:
// QueryProvider configures TanStack React Query for the entire
// React application.
// RESPONSIBILITIES:
// 1. Create a single QueryClient.
// 2. Provide the QueryClient to the entire application.
// 3. Configure API query behavior.
// 4. Configure retry behavior.
// 5. Configure caching/stale-data behavior.
// IMPORTANT:
// This file does NOT directly call any backend API.
// Actual API calls should happen inside:
// - API services
// - custom hooks
// - useQuery()
// - useMutation()
// Example:
// useQuery({
//   queryKey: ["users"],
//   queryFn: getUsers
// })
// QueryProvider simply provides the React Query environment
// required by those hooks.


import React, { useState } from "react";

// QueryClient -> Manages React Query's cache and server-state.
// QueryClientProvider -> Makes the QueryClient available to all child components.
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

// QueryProviderProps
// Defines the props accepted by QueryProvider.
// children represents the complete application that will be
// placed inside QueryClientProvider.


interface QueryProviderProps {
  children: React.ReactNode;
}

// QueryProvider
// This component creates and provides one shared QueryClient
// to the entire application.

export const QueryProvider: React.FC<QueryProviderProps> = ({
  children,
}) => {


  // Create QueryClient
  // useState is used to create the QueryClient only once
  // for the lifetime of this component.
  // This is important because we don't want to create a new
  // QueryClient every time the component re-renders.
  

  const [queryClient] = useState(
    () =>

      // Create a new React Query client.
      new QueryClient({

     
        // Default query configuration
        defaultOptions: {

          queries: {

          // refetchOnWindowFocus
          // false means:
          // When the user switches to another application and then comes back to this browser window, React Query will NOT automatically refetch the query.
          // Example:
            
            // User opens Dashboard
            //      ↓
            // User switches to another tab
            //      ↓
            // User comes back
            //
            // API is NOT automatically called again.
         
            refetchOnWindowFocus: false,


            // retry
          // If an API request fails, React Query will retry the request 1 additional time.
        // Example:
          
            // Request → FAILED
            //             ↓
            //        Retry once
            //             ↓
            //         Success/Fail
            //
            // This is useful for temporary network failures.
           

            retry: 1,


            
            // staleTime
            
            // Defines how long fetched data is considered "fresh". 5 * 60 * 1000 milliseconds = 5 minutes
            // Therefore, after fetching data, React Query  considers it fresh for 5 minutes.
            // During this period React Query can reuse the cached data instead of unnecessarily fetching it.
            

            staleTime: 5 * 60 * 1000,
          },
        },
      })
  );



  // QueryClientProvider
  // Provides the QueryClient to every component inside this provider.
  // After this, child components can use:
  
  // useQuery()
  // useMutation()
  // useQueryClient()   without creating their own QueryClient.
  
  return (
    <QueryClientProvider client={queryClient}>

      {/* The complete application */}
      {children}

    </QueryClientProvider>
  );
};