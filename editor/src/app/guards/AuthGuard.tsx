  /**
 * AuthGuard protects authenticated routes.
 * Checks authentication state before rendering protected pages.
 * Redirects unauthenticated users to the Login page.
 * Authentication state is provided by useAuth().
 * Backend integration should update the auth/session logic,
 * while this guard can remain unchanged.
 */
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/index";
import { ROUTE_PATHS } from "@/app/router/routePaths";

interface Props {
  children: ReactNode;
}

export function AuthGuard({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();

if (isLoading) {
  return <div>Loading...</div>;
}

if (!isAuthenticated) {
  return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
}

return <>{children}</>;
  

}
