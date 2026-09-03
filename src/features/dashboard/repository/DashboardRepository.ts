// ============================================================
// DashboardRepository.ts
// ============================================================
// PURPOSE:
// Retrieves dashboard data from DashboardApi and converts
// backend field names into the frontend domain model.
// ============================================================

import {
  DashboardApi,
  dashboardApi,
} from "../api/dashboardApi";

import type {
  DashboardDomainModel,
  RawApiDashboardData,
} from "../types/dashboard.types";


export class DashboardRepository {
  private api: DashboardApi;

  constructor(apiInstance = dashboardApi) {
    this.api = apiInstance;
  }


  // Fetch dashboard data from API.
  async getDashboardData(): Promise<DashboardDomainModel> {
    const rawData =
      await this.api.getDashboardAnalytics();

    return this.mapToDomainModel(rawData);
  }


  // Convert backend snake_case fields into frontend
  // camelCase fields.
  private mapToDomainModel(
    raw: RawApiDashboardData
  ): DashboardDomainModel {

    return {
      totalUsers:
        raw.total_registered_users,

      activeWorkspaceAccessKeys:
        raw.active_workspace_access_keys,

      adminAccounts:
        raw.admin_accounts,

      roleDistribution: {
        admin:
          raw.role_distribution.admin,

        author:
          raw.role_distribution.author,

        reviewer:
          raw.role_distribution.reviewer,
      },
    };
  }
}


// Shared repository instance.
export const dashboardRepository =
  new DashboardRepository();