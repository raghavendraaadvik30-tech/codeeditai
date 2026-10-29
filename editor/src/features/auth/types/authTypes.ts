/*Purpose

`authTypes.ts` defines the TypeScript data structures used by the authentication module.
It ensures that login requests, user information, and login responses follow a consistent structure throughout the application.

Interfaces

`LoginRequest`

Defines the data required when a user attempts to log in.

- `workspace` – User's workspace name
- `email` – User's email address
- `password` – User's password

 `User`

Defines the structure of an authenticated user.

- `id` – Unique user identifier
- `name` – User's name
- `email` – User's email address
- `role` – User's application role
- `workspace` – User's workspace

The `role` uses the centralized `Role` enum.

`LoginResponse`

Defines the expected result of a successful login.

- `token` – Authentication token
- `user` – Authenticated user's information
*/
import { Role } from "@/app/config/roles";

export interface LoginRequest {
  email: string;
  password: string;
  workspace: string;
} 

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  workspace: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
