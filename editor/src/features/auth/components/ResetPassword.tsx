
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import docupilotLogo from "../../../assets/images/docupilot-logo.png";
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
    (location.state as { email?: string } | null)?.email ??
    "";

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
      {/* Background effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 25%, rgba(255,255,255,0.85), rgba(211,227,253,0.3) 50%, transparent 80%)",
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


        </header>

        {/* Confirmation card */}
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

          <CardContent className="space-y-5 px-0 pb-0">
            <div
              className="rounded-2xl border p-5 text-center sm:p-6"
              style={{
                background: "#EAF2FF",
                borderColor: "#D3E3FD",
              }}
            >
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: "#D3E3FD" }}
              >
                <MailCheck
                  className="h-7 w-7"
                  style={{ color: "#324480" }}
                />
              </div>

              <h2
                className="text-xl font-bold"
                style={{ color: "#324480" }}
              >
                Recovery Request Submitted
              </h2>

              <p className="mt-3 text-sm leading-6" style={{ color: "#64748B" }}>
                Your recovery request has been processed by the
                current demo flow.
              </p>

              {email && (
                <>
                  <p
                    className="mt-4 text-sm"
                    style={{ color: "#64748B" }}
                  >
                    Email address
                  </p>

                  <p
                    className="mt-1 break-all font-bold"
                    style={{ color: "#324480" }}
                  >
                    {email}
                  </p>
                </>
              )}

            </div>

            <Button
              type="button"
              onClick={() => navigate(ROUTE_PATHS.LOGIN)}
              className="h-12 w-full rounded-xl border-0 font-semibold"
              style={{
                background: "#D3E3FD",
                color: "#324480",
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
