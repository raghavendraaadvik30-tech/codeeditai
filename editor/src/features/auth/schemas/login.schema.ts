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
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
