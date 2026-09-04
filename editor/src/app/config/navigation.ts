/* Navigation configuration for the application.
* Responsibility:
* Defines available navigation items.
* - Defines the URL for each item.
* - Defines the icon displayed in the UI.
* - Defines which user roles are allowed to see/access each item.
* IMPORTANT:
* The `roles` property only defines the role mapping.
* Actual route protection must also be implemented separately
* in the router/route guard.
*/


import { LayoutGrid, Users, FileText } from "lucide-react";
import { Role } from "./roles";

export const navigationItems = [
  {
    // Admin dashboard
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutGrid,
    roles: [Role.Admin],
  },
  {
    // Admin-only user management
    title: "Users",
    path: "/dashboard/users",
    icon: Users,
    roles: [Role.Admin],
  },
  {
     // Editor available to Authors and Reviewers
    title: "Editor",
    path: "/editor",
    icon: FileText,
    roles: [Role.Author],
  },
];