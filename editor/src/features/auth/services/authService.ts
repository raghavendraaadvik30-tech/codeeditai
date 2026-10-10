/*Purpose

`authService.ts` is responsible for handling authentication-related operations.

Currently, it uses **mock login data** to simulate backend authentication. When the real backend is connected, this service can be updated to make the actual API request without changing the Login UI or AuthProvider structure.

### What it does

- Accepts workspace, email, and password through `LoginRequest`.
- Simulates an API delay using `setTimeout()`.
- Checks the provided credentials against the current mock users.
- Returns a mock authentication token and user information for valid credentials.
- Supports different user roles such as `Admin` and `Author`.
- Throws an error when the credentials are invalid.
- Provides a `logout()` method that removes stored authentication data from `localStorage`.

### Current Mock Login

```text
Admin
workspace: admin
email: admin@gmail.com
password: admin123
        ↓
Role.Admin*/


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
    // ADMIN LOGIN
    // ==========================
    if (
      data.email.toLowerCase() === "admin@gmail.com" &&
      (data.password === "admin123" || data.password === "Admin123!" || data.password === "Password123!")
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
      (data.password === "author123" || data.password === "Author123!" || data.password === "Password123!")
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
    // REVIEWER LOGIN
    // ==========================
    if (
      data.email.toLowerCase() === "reviewer@gmail.com" &&
      (data.password === "reviewer123" || data.password === "Reviewer123!" || data.password === "Password123!")
    ) {
      return {
        token: "mock-reviewer-token",
        user: {
          id: "3",
          name: "Elena Rostova",
          email: data.email,
          role: Role.Reviewer,
          workspace: "Medical Review",
        },
      };
    }

    // Check users from localStorage/store if present
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
          const userRole = match.role === "Admin" ? Role.Admin : match.role === "Reviewer" ? Role.Reviewer : Role.Author;
          return {
            token: `mock-${userRole.toLowerCase()}-token`,
            user: {
              id: match.id,
              name: match.fullName,
              email: match.email,
              role: userRole,
              workspace: userRole === Role.Admin ? "default-sec" : "Clinical Research",
            },
          };
        }
      }
    } catch {
      // Fallback to default error
    }

    throw new Error("Invalid email or password");
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

export default new AuthService();
