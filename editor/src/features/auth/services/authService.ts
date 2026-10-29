
import type {
  LoginRequest,
  LoginResponse,
} from "../types/authTypes";

import { Role } from "@/app/config/roles";

class AuthService {
  async login(
    data: LoginRequest
  ): Promise<LoginResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // ==========================
    // SUPER ADMIN LOGIN
    // ==========================
    if (
      data.workspace === "superadmin" &&
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
      // Fall back to the default invalid-credentials error.
    }

    throw new Error("Invalid email or password");
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

export default new AuthService();
