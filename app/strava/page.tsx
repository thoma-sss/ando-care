"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { StravaConnect } from "@/components/StravaConnect";
import { CGMSetup } from "@/components/CGMSetup";
import { Card } from "@/components/ui/Card";

type Step = 1 | 2 | 3;

interface UserData {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
  cgmProvider: string | null;
}

function SetupWizardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isStravaConnected, setIsStravaConnected] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = searchParams.get("userId");
    const connected = searchParams.get("connected");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(getErrorMessage(errorParam));
    }

    if (connected === "true" && userId) {
      // Fetch user data
      fetchUserData(userId);
    }
  }, [searchParams]);

  const fetchUserData = async (userId: string) => {
    try {
      // In a real app, you'd have an API endpoint for this
      // For now, we'll just set the connection state
      setIsStravaConnected(true);
      setUser({
        id: userId,
        firstName: "Athlete",
        lastName: "",
        profilePicture: null,
        cgmProvider: null,
      });
      setCurrentStep(2);
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
      access_denied: "You denied access to your Strava account.",
      auth_failed: "Authentication failed. Please try again.",
      missing_code: "Invalid OAuth response. Please try again.",
      callback_failed: "Failed to complete authentication. Please try again.",
    };
    return errorMessages[errorCode] || "An error occurred. Please try again.";
  };

  const handleStravaConnect = () => {
    window.location.href = "/api/auth/strava";
  };

  const handleCGMComplete = () => {
    setCurrentStep(3);
  };

  const steps = [
    { number: 1, label: "Connect Strava" },
    { number: 2, label: "Setup CGM" },
    { number: 3, label: "Done" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] bg-gradient-radial">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#FAFAFA] tracking-tight">
            ando
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                      transition-all duration-300
                      ${
                        currentStep >= step.number
                          ? "bg-[#FF6B35] text-white"
                          : "bg-[rgba(255,255,255,0.05)] text-[#71717A]"
                      }
                    `}
                  >
                    {currentStep > step.number ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`
                        w-16 sm:w-24 h-0.5 mx-2
                        transition-all duration-300
                        ${
                          currentStep > step.number
                            ? "bg-[#FF6B35]"
                            : "bg-[rgba(255,255,255,0.08)]"
                        }
                      `}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm">
              {steps.map((step) => (
                <span
                  key={step.number}
                  className={`
                    transition-colors duration-300
                    ${
                      currentStep >= step.number
                        ? "text-[#FAFAFA]"
                        : "text-[#71717A]"
                    }
                  `}
                >
                  {step.label}
                </span>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-xl">
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[#EF4444] flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-[#EF4444]">{error}</p>
              </div>
            </div>
          )}

          {/* Step Content */}
          <Card variant="glass" padding="lg">
            {currentStep === 1 && (
              <StravaConnect
                isConnected={isStravaConnected}
                user={user}
                onConnect={handleStravaConnect}
              />
            )}

            {currentStep === 2 && user && (
              <CGMSetup userId={user.id} onComplete={handleCGMComplete} />
            )}

            {currentStep === 3 && (
              <div className="animate-in text-center">
                <div className="w-20 h-20 rounded-full bg-[rgba(34,197,94,0.1)] flex items-center justify-center mx-auto mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-[#22C55E]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#FAFAFA] mb-3">
                  You&apos;re all set!
                </h3>
                <p className="text-[#A1A1AA] mb-6 max-w-sm mx-auto">
                  Your next Strava activity will automatically include CGM data.
                  Go for a ride or run and watch the magic happen!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#FF8555] transition-all"
                  >
                    Back to home
                  </Link>
                </div>
              </div>
            )}
          </Card>

          {/* Help Text */}
          {currentStep < 3 && (
            <p className="text-center text-[#71717A] text-sm mt-6">
              Having trouble?{" "}
              <a
                href="mailto:support@ando.care"
                className="text-[#FF6B35] hover:underline"
              >
                Contact support
              </a>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SetupWizardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#FF6B35] border-t-transparent rounded-full" />
      </div>
    }>
      <SetupWizardContent />
    </Suspense>
  );
}

