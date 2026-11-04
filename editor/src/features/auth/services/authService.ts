
import type {
  LoginRequest,
  LoginResponse,
} from "../types/authTypes";

import { Role, normalizeRole } from "@/app/config/roles";
import { axiosInstance } from "@/shared/api/axios";

class AuthService {
  async login(
    data: LoginRequest
  ): Promise<LoginResponse> {
    // ------------------------------------------------------------------
    // 1. LIVE BACKEND AUTHENTICATION (POST /auth/login)
    // ------------------------------------------------------------------
    let backendErrorMessage: string | null = null;
    try {
      const payload: { email: string; password: string; workspace?: string } = {
        email: data.email.trim(),
        password: data.password,
      };
      if (data.workspace && data.workspace.trim()) {
        payload.workspace = data.workspace.trim();
      }

      const res = await axiosInstance.post("/auth/login", payload);

      if (res.data?.success && res.data.data?.access_token) {
        const backendData = res.data.data;
        const rawUser = backendData.user || {};
        const primaryRoleStr =
          (Array.isArray(rawUser.roles) && rawUser.roles[0]) ||
          rawUser.role ||
          "author";

        const resolvedRole = normalizeRole(primaryRoleStr);

        const authenticatedUser = {
          id: String(rawUser.user_id || rawUser.id || Date.now()),
          name: rawUser.full_name || rawUser.name || (data.email.split("@")[0] || "User"),
          email: rawUser.email || data.email,
          role: resolvedRole,
          workspace: rawUser.workspace || rawUser.workspace_code || data.workspace || "Default",
        };

        const response: LoginResponse = {
          token: backendData.access_token,
          user: authenticatedUser,
        };

        return response;
      }
    } catch (apiError: unknown) {
      const err = apiError as { response?: { data?: { message?: string } }; message?: string };
      backendErrorMessage = err?.response?.data?.message || null;
      console.warn("Backend auth failed or unavailable, checking local fallback:", err?.response?.data || err?.message);
    }

    // ------------------------------------------------------------------
    // 2. OFFLINE / MOCK FALLBACK (DEVELOPMENT CONVENIENCE)
    // ------------------------------------------------------------------
    await new Promise((resolve) => setTimeout(resolve, 300));

    // ==========================
    // SUPER ADMIN FALLBACK
    // ==========================
    if (
      data.email.toLowerCase() === "superadmin@gmail.com" &&
      data.password === "superadmin123"
    ) {
      return {
        token: "mock-superadmin-token",
        user: {
          id: "0",
          name: "Super Administrator",
          email: data.email,
          role: Role.SuperAdmin,
          workspace: "superadmin",
        },
      };
    }

    // ==========================
    // ADMIN LOGIN
    // ==========================
    if (
      data.email.toLowerCase() === "admin@gmail.com" &&
      (
        data.password === "admin123" ||
        data.password === "Admin123!" ||
        data.password === "Password123!"
      )
    ) {
      return {
        token: "mock-admin-token",
        user: {
          id: "1",
          name: "Sarah Jenkins",
          email: data.email,
          role: Role.Admin,
          workspace: "default-sec",
        },
      };
    }

    // ==========================
    // AUTHOR LOGIN
    // ==========================
    if (
      data.email.toLowerCase() === "author@gmail.com" &&
      (
        data.password === "author123" ||
        data.password === "Author123!" ||
        data.password === "Password123!"
      )
    ) {
      return {
        token: "mock-author-token",
        user: {
          id: "2",
          name: "Bhumika C",
          email: data.email,
          role: Role.Author,
          workspace: "Clinical Research",
        },
      };
    }

    // ==========================
    // STORED USERS LOGIN
    // ==========================
    try {
      const storedUsersRaw = localStorage.getItem("users-storage");

      if (storedUsersRaw) {
        const parsed = JSON.parse(storedUsersRaw);
        const storeUsers = parsed?.state?.users || [];

        const match = storeUsers.find(
          (u: { email: string; password?: string }) =>
            u.email.toLowerCase() === data.email.toLowerCase() &&
            (!u.password || u.password === data.password)
        );

        if (match) {
          const userRole =
            match.role === "Admin"
              ? Role.Admin
              : Role.Author;

          return {
            token: `mock-${userRole.toLowerCase()}-token`,
            user: {
              id: match.id,
              name: match.fullName,
              email: match.email,
              role: userRole,
              workspace:
                userRole === Role.Admin
                  ? "default-sec"
                  : "Clinical Research",
            },
          };
        }
      }
    } catch {
      // Fall through
    }

    // ==========================
    // CUSTOM REGISTERED USERS FALLBACK
    // ==========================
    try {
      const customUsersRaw = localStorage.getItem("custom_registered_users");
      if (customUsersRaw) {
        const customUsers = JSON.parse(customUsersRaw);
        const match = customUsers.find(
          (u: { email?: string; password?: string; role?: string; name?: string; workspace?: string; id?: string }) =>
            u.email?.toLowerCase() === data.email.toLowerCase() &&
            u.password === data.password
        );
        if (match) {
          const userRole = normalizeRole(match.role || "Admin");
          return {
            token: `mock-${userRole.toLowerCase()}-token`,
            user: {
              id: match.id || String(Date.now()),
              name: match.name,
              email: match.email,
              role: userRole,
              workspace: match.workspace || "APEX-HQ-01",
            },
          };
        }
      }
    } catch {
      // Fall through to error
    }

    throw new Error(backendErrorMessage || "Invalid email or password");
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

export default new AuthService();
