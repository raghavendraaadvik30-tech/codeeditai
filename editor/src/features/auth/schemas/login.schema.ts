/*Purpose

Defines the validation rules for the Login form using Zod.

### What it validates

- **Workspace**
  - Minimum 3 characters
  - Maximum 50 characters
  - Allows only letters, numbers, hyphens (`-`), and underscores (`_`)

- **Email**
  - Required
  - Must be a valid email address

- **Password**
  - Must be at least 8 characters

### `LoginFormData`

```ts
z.infer<typeof loginSchema>
*/

import { z } from "zod";

export const loginSchema = z.object({
  workspace: z
    .string()
    .min(3, "Workspace must be at least 3 characters")
    .max(50, "Workspace must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Workspace can only contain letters, numbers, hyphens (-), and underscores (_)"
    ),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
