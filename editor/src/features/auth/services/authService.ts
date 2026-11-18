
import type {
  LoginRequest,
  LoginResponse,
} from "../types/authTypes";

import { normalizeRole } from "@/app/config/roles";
import { axiosInstance } from "@/shared/api/axios";

class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const payload: {
      email: string;
      password: string;
      workspace?: string;
    } = {
      email: data.email.trim(),
      password: data.password,
    };

    if (data.workspace?.trim()) {
      payload.workspace = data.workspace.trim();
    }

    const res = await axiosInstance.post("/auth/login", payload);

    if (!res.data?.success || !res.data?.data?.access_token) {
      throw new Error(
        res.data?.message || "Invalid email or password"
      );
    }

    const backendData = res.data.data;
    const rawUser = backendData.user;

    if (!rawUser) {
      throw new Error("Invalid authentication response: user missing");
    }

    const primaryRole =
      (Array.isArray(rawUser.roles) && rawUser.roles[0]) ||
      rawUser.role;

    if (!primaryRole) {
      throw new Error("Invalid authentication response: role missing");
    }

    const authenticatedUser = {
      id: String(rawUser.user_id || rawUser.id),
      name:
        rawUser.full_name ||
        rawUser.name ||
        data.email.split("@")[0],
      email: rawUser.email || data.email,
      role: normalizeRole(primaryRole),
      workspace:
        rawUser.workspace ||
        rawUser.workspace_code ||
        data.workspace ||
        "Default",
    };

    return {
      token: backendData.access_token,
      user: authenticatedUser,
    };
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

export default new AuthService();
