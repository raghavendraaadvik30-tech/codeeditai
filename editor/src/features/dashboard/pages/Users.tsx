/*
Purpose:
Users is the user-management page component.

What it does:
- Imports and renders UserManagement.
- Provides the page-level layout and spacing.
- Keeps user-management logic and UI inside UserManagement.

Flow:
Users Page
    ↓
UserManagement
    ↓
User List / User Management UI
*/
import UserManagement from "../components/UserManagement";

export default function Users() {
  return (
    <div className="space-y-8">
      <UserManagement />
    </div>
  );
}
