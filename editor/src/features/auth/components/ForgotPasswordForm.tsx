
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import docupilotLogo from "../../../assets/images/docupilot-logo.png";

import { Mail, Loader2, ArrowRight } from "lucide-react";

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

    if (!emailRegex.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (isSubmitting || !validateEmail()) return;

    setIsSubmitting(true);

    try {
      /*
       * DEVELOPMENT PLACEHOLDER:
       * Replace this timeout with your authService API call
       * when the backend is ready.
       *
       * The current version does NOT send an actual email.
       */
      await new Promise((resolve) => setTimeout(resolve, 1500));

      navigate(ROUTE_PATHS.RESET_PASSWORD, {
        state: { email: email.trim() },
      });
    } catch {
      setEmailError(
        "Unable to process your request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8"
      style={{
        background:
          "linear-gradient(135deg, #F8FAFF 0%, #EEF4FF 35%, #D3E3FD 75%, #F5F8FF 100%)",
        color: "#142C4A",
        fontFamily: 'var(--font-family, "Manrope", "Inter", sans-serif)',
      }}
    >
      {/* Ambient background effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 25%, rgba(255,255,255,0.85) 0%, rgba(211,227,253,0.3) 50%, transparent 80%)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full blur-3xl"
        style={{ background: "rgba(147,181,235,0.20)" }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-20 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "rgba(147,181,235,0.22)" }}
      />

      {/* Main content */}
      <section className="relative z-10 w-full max-w-[560px]">
        {/* Page heading */}
        <header className="mb-8 text-center">
          <div className="mb-5 flex flex-col items-center">
            <img
              src={docupilotLogo}
              alt="DocuPilot Logo"
              className="h-auto w-[140px] object-contain"
            />

            <h4 className="-mt-1 text-center text-sm font-medium tracking-wide text-[#324480]">
              Doc. Prep. Reimagined!
            </h4>
          </div>
          {/* <h1
            className="mt-5 text-3xl font-black tracking-wide"
            style={{ color: "#324480" }}
          >
            LOGIN
          </h1> */}

          {/* <p
            className="mt-1 text-sm"
            style={{ color: "#64748B" }}
          >
            Recover access to your account
          </p> */}
        </header>

        {/* Password recovery card */}
        <Card
          className="overflow-hidden rounded-[28px] border p-5 shadow-xl sm:p-7"
          style={{
            background: "rgba(255,255,255,0.96)",
            borderColor: "rgba(211,227,253,0.95)",
            boxShadow:
              "0 25px 70px rgba(80,120,190,0.15), 0 8px 28px rgba(20,44,74,0.07)",
          }}
        >
          <CardHeader className="px-0 pb-5 pt-0">
            <CardTitle
              className="text-center text-xl font-bold"
              style={{ color: "#324480" }}
            >
              Password Reset
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 px-0 pb-0">
            {/* Information panel */}
            <div
              className="rounded-2xl border p-4 sm:p-5"
              style={{
                background: "#EAF2FF",
                borderColor: "#D3E3FD",
              }}
            >
              <h2
                className="text-sm font-bold"
                style={{ color: "#324480" }}
              >
                Password Reset Verification
              </h2>

              <p
                className="mt-2 text-sm leading-6"
                style={{ color: "#64748B" }}
              >
                Enter your registered email address below.
                We'll send you a password reset link if your
                account exists.
              </p>
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="recovery-email"
                  className="text-sm font-bold"
                  style={{ color: "#324480" }}
                >
                  Email Address
                </Label>

                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2"
                    style={{ color: "#324480" }}
                  />

                  <Input
                    id="recovery-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="example@email.com"
                    value={email}
                    required
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={
                      emailError ? "recovery-email-error" : undefined
                    }
                    onChange={(e) => {
                      setEmail(e.target.value);

                      if (emailError) {
                        setEmailError("");
                      }
                    }}
                    className="h-12 rounded-xl pl-11 pr-4 text-sm shadow-none transition-colors focus-visible:ring-2"
                    style={{
                      background: "#EAF2FF",
                      borderColor: emailError ? "#E11D48" : "#D3E3FD",
                      color: "#142C4A",
                    }}
                  />
                </div>

                {emailError && (
                  <p
                    id="recovery-email-error"
                    role="alert"
                    className="text-xs font-medium text-rose-600"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => navigate(ROUTE_PATHS.LOGIN)}
                  className="h-11 flex-1 rounded-xl border font-semibold"
                  style={{
                    background: "#FFFFFF",
                    borderColor: "#D3E3FD",
                    color: "#324480",
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 flex-1 rounded-xl border-0 font-semibold shadow-sm transition-colors"
                  style={{
                    background: isSubmitting ? "#C2D9F7" : "#D3E3FD",
                    color: "#324480",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
