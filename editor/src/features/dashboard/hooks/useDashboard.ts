/*
Purpose:
useDashboard is a custom React hook that manages dashboard data,
loading state, error handling, and dashboard refresh operations.

What each part does:
useState – Stores dashboard data, loading status, and error messages.
useCallback – Keeps the dashboard fetch function stable between renders.
dashboardService – Fetches the dashboard summary from the service layer.
DashboardDomainModel – Defines the expected dashboard data structure.

fetchDashboardData() –
Calls dashboardService.fetchDashboardSummary(), stores the returned
dashboard data, and handles loading and API errors.

useEffect –
Automatically loads dashboard data when the component using this
hook is first rendered.

refresh() –
Allows the dashboard to manually fetch the latest data again.

Returns:
- data – Dashboard summary data.
- isLoading – Indicates whether dashboard data is loading.
- error – Contains an error message if loading fails.
- refresh – Function to reload dashboard data.

Flow:
Dashboard Component
        ↓
   useDashboard()
        ↓
dashboardService
        ↓
     API / Backend
        ↓
Dashboard Data
        ↓
      UI Display

This hook keeps data-fetching logic separate from the dashboard UI.
*/



import {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  dashboardService,
} from "../services/DashboardService";

import type {
  DashboardDomainModel,
} from "../types/dashboard.types";


export function useDashboard() {

  const [data, setData] =
    useState<DashboardDomainModel | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  const fetchDashboardData =
    useCallback(async () => {

      setIsLoading(true);
      setError(null);

      try {

        const summary =
          await dashboardService.fetchDashboardSummary();

        setData(summary);

      } catch (err) {

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard data."
        );

      } finally {

        setIsLoading(false);
      }

    }, []);


  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);


  const refresh = useCallback(() => {
    return fetchDashboardData();
  }, [fetchDashboardData]);


  return {
    data,
    isLoading,
    error,
    refresh,
  };
}
