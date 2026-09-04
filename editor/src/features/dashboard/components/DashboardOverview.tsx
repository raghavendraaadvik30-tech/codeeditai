/*
Purpose:
DashboardOverview.tsx displays the main administrative dashboard overview. It reads user information from useUsersStore() and calculates user statistics for the dashboard.

What each part does:

useUsersStore() – Gets the current users list from the shared users store.
totalUsers – Calculates the total number of registered users.
activeUsers – Counts users whose status is "Active".
adminUsers – Counts users with the "Admin" role.
authorUsers – Counts users with the "Author" role.
reviewerUsers – Counts users with the "Reviewer" role.
cardDetails – Defines the statistics displayed in the dashboard cards, including title, value, description, icon, and styling.
Statistics Cards – Displays total users, active users, and admin accounts.
User Role Distribution – Displays the number of Admin, Author, and Reviewer users.

Important:
This component is mainly responsible for displaying and calculating dashboard statistics.
It does not directly call the backend API. The user data is obtained through useUsersStore().

*/
import { useUsersStore } from "@/shared/stores/usersStore";
import {
  Users,
  UserCheck,
  ShieldCheck,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default function DashboardOverview() {
  const { users } = useUsersStore();

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (u) => u.status === "Active"
  ).length;

  const adminUsers = users.filter(
    (u) => u.role === "Admin"
  ).length;

  const authorUsers = users.filter(
    (u) => u.role === "Author"
  ).length;

  const reviewerUsers = users.filter(
    (u) => u.role === "Reviewer"
  ).length;

  const cardDetails = [
    {
      title: "Total Registered Users",
      value: totalUsers,
      description: "Active master accounts",
      icon: Users,
      color:
        "text-blue-600 bg-blue-50 border border-blue-100",
    },
    {
      title: "Active Workspace Access Keys",
      value: activeUsers,
      description: "Validated authors & reviewers",
      icon: UserCheck,
      color:
        "text-emerald-600 bg-emerald-50 border border-emerald-100",
    },
    {
      title: "Admin Accounts",
      value: adminUsers,
      description: "Admins with directory authority",
      icon: ShieldCheck,
      color:
        "text-indigo-600 bg-indigo-50 border border-indigo-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">
          System Administration Overview
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Global user authority directories,
          status ledgers and trial access matrices.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cardDetails.map((card, index) => {
          const Icon = card.icon;

          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">
                  {card.title}
                </CardTitle>

                <div className={`p-3 rounded-xl ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>

              <CardContent>
                <h2 className="text-4xl font-bold">
                  {card.value}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>
            User Role Distribution
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-5">

            <div className="flex justify-between items-center">
              <span className="text-slate-700">
                Admin
              </span>

              <span className="font-semibold">
                {adminUsers}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-700">
                Author
              </span>

              <span className="font-semibold">
                {authorUsers}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-700">
                Reviewer
              </span>

              <span className="font-semibold">
                {reviewerUsers}
              </span>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}