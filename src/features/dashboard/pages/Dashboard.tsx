/*
Purpose:
Dashboard is the main dashboard page component.

What it does:
- Imports and renders DashboardOverview.
- Provides the page-level layout and spacing.
- Keeps the page component simple by leaving dashboard
  statistics and UI logic to DashboardOverview.

Flow:
Dashboard Page
     ↓
DashboardOverview
     ↓
Dashboard Statistics / UI
*/

import DashboardOverview from "../components/DashboardOverview";



export function Dashboard() {
  return (
    <div className="space-y-8">
      <DashboardOverview />
    </div>
  );
}

export default Dashboard;

