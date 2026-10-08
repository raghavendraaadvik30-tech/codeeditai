/**
 * Reset Password Confirmation Page
 * ---------------------------------
 * Displays the confirmation screen after a password recovery request
 * has been successfully submitted.
 *
 * Responsibilities:
 * - Reads the user's email from React Router location state.
 * - Displays a confirmation message that the recovery email was sent.
 * - Shows the email address associated with the recovery request.
 * - Informs the user that the recovery link should be used within 15 minutes.
 * - Provides navigation back to the Login page.
 *
 * Navigation Flow:
 *
 * Forgot Password
 *       ↓
 * Password Recovery Request
 *       ↓
 * Reset Password Confirmation
 *       ↓
 * User receives recovery email
 *       ↓
 * Back to Login
 *
 * Backend:
 * This component does not directly communicate with the backend.
 * The actual password recovery request should be handled by the
 * authentication service/repository before this page is displayed.
 *
 * The email displayed here is received through React Router location state.
 * When the backend is connected, the recovery flow should be handled by
 * the authentication layer rather than by this component.
 */
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import { ROUTE_PATHS } from "@/app/router/routePaths";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const email =
    (location.state as { email?: string })?.email ??
    "user@example.com";

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">

      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-wide">
            LOGIN
            <span className="ml-1 text-lg font-bold text-primary">
              PORTAL
            </span>
          </h1>

        </div>

        <Card className="rounded-2xl border border-secondary shadow-xl">

          <CardHeader>

            <CardTitle className="text-center text-xl">
              Login
            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-5">

            <div className="rounded-xl border border-success-200 bg-success-50 p-6 text-center">

              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success-100">

                <ShieldCheck className="h-7 w-7 text-success-600" />

              </div>

              <h3 className="text-xl font-bold text-foreground">
                Recovery Link Dispatched
              </h3>

              <p className="mt-3 text-sm text-secondary-foreground">
                A secure password recovery email has been sent to:
              </p>

              <p className="mt-2 break-all font-bold text-primary">
                {email}
              </p>

              <p className="mt-5 text-sm leading-6 text-muted-foreground">
                Please follow the instructions in the email within
                <span className="font-semibold"> 15 minutes </span>
                to reset your password.
              </p>

            </div>

            <Button
              className="w-full bg-foreground hover:bg-foreground"
              onClick={() => navigate(ROUTE_PATHS.LOGIN)}
            >
              Back to Login
            </Button>

          </CardContent>

        </Card>

      </div>

    </div>
  );
}