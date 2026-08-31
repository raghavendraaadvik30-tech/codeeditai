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
      data.workspace === "admin" &&
      data.email === "admin@gmail.com" &&
      data.password === "admin123"
    ) {
      return {
        token: "mock-admin-token",
        user: {
          id: "1",
          name: "Administrator",
          email: data.email,
          role: Role.Admin,
          workspace: data.workspace,
        },
      };
    }

    // ==========================
    // AUTHOR LOGIN
    // ==========================
    if (
      data.workspace === "author" &&
      data.email === "author@gmail.com" &&
      data.password === "author123"
    ) {
      return {
        token: "mock-author-token",
        user: {
          id: "2",
          name: "Author User",
          email: data.email,
          role: Role.Author,
          workspace: data.workspace,
        },
      };
    }

    throw new Error("Invalid workspace, email, or password");
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

export default new AuthService();