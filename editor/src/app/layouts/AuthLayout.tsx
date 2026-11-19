/**
 * AuthLayout
 * Responsibility: Provides a shared layout/container for authentication pages
 * such as Login, Register, and Forgot Password.
 * <Outlet /> renders the currently matched nested route.
 * No authentication/business logic or backend API calls should be added here.
 */



import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="h-full w-full overflow-y-auto">
      <Outlet />
    </div>
  );
}; 


  
