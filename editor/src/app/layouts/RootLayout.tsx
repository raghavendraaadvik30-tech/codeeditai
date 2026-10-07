// Provides the application's root layout, renders nested routes, and displays a loading fallback while lazy-loaded pages are loading.
import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";

export const RootLayout: React.FC = () => {
  return (
    <div className="h-full w-full min-h-0 overflow-hidden bg-muted antialiased font-sans">
      <Suspense
        fallback={
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <div className="text-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-sm font-medium text-muted-foreground">
                Loading system view...
              </p>
            </div>
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </div>
  );
};