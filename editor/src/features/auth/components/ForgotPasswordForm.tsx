/*ForgotPasswordForm.tsx is the frontend password-recovery page that collects and validates
 the user's email, shows loading/error states,and navigates to the reset flow; 
 it currently simulates the backend with setTimeout(), 
 so when the backend is connected, 
 only the submission logic should be replaced with an authService API call while the UI and validation can remain largely unchanged.*/

 import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import { ROUTE_PATHS } from "@/app/router/routePaths";

export default function ForgotPasswordForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = () => {
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      return false;
    }

    const emailRegex =
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    if (!emailRegex.test(email)) {
      setEmailError("Enter a valid email address.");
      return false;
    }

    return true;
  };

  // const handleSubmit = async (
  //   e: React.FormEvent<HTMLFormElement>
  // ) => {
  //   e.preventDefault();

  //   if (!validateEmail()) return;

  //   setIsSubmitting(true);

  //   try {
  //     // TODO: Replace with your Forgot Password API
  //     await new Promise((resolve) =>
  //       setTimeout(resolve, 1500)
  //     );

  //     alert(
  //       "Password reset link has been sent successfully."
  //     );

  //     navigate(ROUTE_PATHS.LOGIN);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };




  const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  if (!validateEmail()) return;

  setIsSubmitting(true);

  // Simulate sending email
  setTimeout(() => {
    setIsSubmitting(false);

    navigate(ROUTE_PATHS.RESET_PASSWORD, {
      state: { email },
    });
  }, 1500);
};

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">

      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground shadow-lg">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-wide text-foreground">
            LOGIN
          </h1>

          <p className="text-sm text-muted-foreground">
            Recover access to your account
          </p>

        </div>

        {/* Card */}
        <Card className="rounded-2xl border border-secondary shadow-xl">

          <CardHeader>
            <CardTitle className="text-center text-xl">
              Password Reset
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">

            {/* Info Box */}
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">

              <h3 className="text-sm font-bold text-primary/90">
                Password Reset Verification
              </h3>

              <p className="mt-2 text-sm leading-6 text-secondary-foreground">
                Enter your registered email address below.
                We'll send you a password reset link if your
                account exists.
              </p>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}
              <div className="space-y-2">

                <Label htmlFor="email">
                  Email Address
                </Label>

                <div className="relative">

                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);

                      if (emailError) {
                        setEmailError("");
                      }
                    }}
                    className="pl-10"
                  />

                </div>

                {emailError && (
                  <p className="text-xs text-destructive">
                    {emailError}
                  </p>
                )}

              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">

                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    navigate(ROUTE_PATHS.LOGIN)
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

              </div>

            </form>

          </CardContent>

        </Card>

      </div>

    </div>
  );
}




// await new Promise((resolve) =>
//   setTimeout(resolve, 1500)
// );             for backend