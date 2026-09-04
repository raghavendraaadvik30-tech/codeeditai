/*
`DashboardApi.ts` — Description

**Purpose:**
`DashboardApi.ts` is responsible for communicating with the **Dashboard backend API** and fetching dashboard analytics data.

**What each part does:**

* **`DashboardApi` class** – Encapsulates dashboard API operations.
* **`baseUrl`** – Stores the base API endpoint. Defaults to `/api/v1/dashboard`.
* **`getDashboardAnalytics()`** – Sends a `GET` request to `/api/v1/dashboard/analytics`.
* **`fetch()`** – Performs the actual HTTP request to the backend.
* **`response.ok`** – Checks whether the API request was successful.
* **Error handling** – Throws an error when the backend returns an unsuccessful response.
* **`response.json()`** – Converts the API response into JSON and returns it as `RawApiDashboardData`.
* **`dashboardApi`** – Creates and exports a shared instance of `DashboardApi` so other dashboard files can directly use the API.


**Backend note:**
This file is the **API communication layer**. It does not contain dashboard UI, business logic, or data transformation. Those responsibilities should remain in their respective service, hook, or component layers.
*/





import type {
  RawApiDashboardData,
} from "../types/dashboard.types";


export class DashboardApi {
  private baseUrl: string;

  constructor(
    baseUrl = "/api/v1/dashboard"
  ) {
    this.baseUrl = baseUrl;
  }


  async getDashboardAnalytics(): Promise<RawApiDashboardData> {

    const url =
      `${this.baseUrl}/analytics`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });


    if (!response.ok) {
      throw new Error(
        `Failed to fetch dashboard data: ${response.statusText}`
      );
    }


    return response.json();
  }
}


// Shared API instance.
export const dashboardApi =
  new DashboardApi();