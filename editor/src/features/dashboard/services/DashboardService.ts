// ============================================================
// DashboardService.ts
// ============================================================
// PURPOSE:
// Service layer for Dashboard business logic.
//
// Currently the backend already provides the dashboard
// summary values, so the service simply returns the
// repository result.
//
// Any future business calculations should be placed here,
// not inside the React component.
// ============================================================

import {
  DashboardRepository,
  dashboardRepository,
} from "../repository/DashboardRepository";

import type {
  DashboardDomainModel,
} from "../types/dashboard.types";


export class DashboardService {
  private repository: DashboardRepository;

  constructor(
    repositoryInstance = dashboardRepository
  ) {
    this.repository = repositoryInstance;
  }


  async fetchDashboardSummary(): Promise<DashboardDomainModel> {
    const data =
      await this.repository.getDashboardData();

    return data;
  }
}


// Shared service instance.
export const dashboardService =
  new DashboardService();
