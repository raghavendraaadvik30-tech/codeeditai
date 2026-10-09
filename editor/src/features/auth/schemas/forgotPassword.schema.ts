/*
Purpose
Defines the validation rules for the Forgot Password form using Zod.

What it does

- Validates that the email field is not empty.
- Checks that the entered value is a valid email address.
- Provides clear validation error messages.
- Creates a TypeScript type automatically from the validation schema.

Validation

```text
Email
 ↓
Required?
 ↓
Valid email format?
 ↓
Valid → Continue
Invalid → Show error
*/

import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email"),
});

export type ForgotPasswordFormData = z.infer<
  typeof forgotPasswordSchema
>;
