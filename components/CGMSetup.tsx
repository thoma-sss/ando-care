"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Card } from "./ui/Card";

type CGMProvider = "librelink" | "dexcom" | null;

interface CGMSetupProps {
  userId: string;
  onComplete: () => void;
}

const LIBRE_REGIONS = [
  { value: "EU", label: "Europe (EU)" },
  { value: "EU2", label: "Europe 2 (EU2)" },
  { value: "US", label: "United States (US)" },
  { value: "DE", label: "Germany (DE)" },
  { value: "FR", label: "France (FR)" },
  { value: "CA", label: "Canada (CA)" },
  { value: "AU", label: "Australia (AU)" },
  { value: "AP", label: "Asia Pacific (AP)" },
  { value: "AE", label: "UAE (AE)" },
  { value: "JP", label: "Japan (JP)" },
  { value: "LA", label: "Latin America (LA)" },
  { value: "RU", label: "Russia (RU)" },
  { value: "CN", label: "China (CN)" },
];

const DEXCOM_SERVERS = [
  { value: "shareous1.dexcom.com", label: "Outside US (shareous1.dexcom.com)" },
  { value: "share2.dexcom.com", label: "United States (share2.dexcom.com)" },
];

export function CGMSetup({ userId, onComplete }: CGMSetupProps) {
  const [provider, setProvider] = useState<CGMProvider>(null);
  const [step, setStep] = useState<"select" | "credentials">("select");
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState("");
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // LibreLinkUp fields
  const [libreEmail, setLibreEmail] = useState("");
  const [librePassword, setLibrePassword] = useState("");
  const [libreRegion, setLibreRegion] = useState("EU");
  const [librePatientId, setLibrePatientId] = useState("");

  // Dexcom fields
  const [dexcomUsername, setDexcomUsername] = useState("");
  const [dexcomPassword, setDexcomPassword] = useState("");
  const [dexcomServer, setDexcomServer] = useState("shareous1.dexcom.com");

  const handleProviderSelect = (selectedProvider: CGMProvider) => {
    setProvider(selectedProvider);
    setStep("credentials");
    setTestResult(null);
    setError("");
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setError("");
    setTestResult(null);

    try {
      const endpoint = provider === "librelink" 
        ? "/api/librelink/test" 
        : "/api/dexcom/test";

      const body = provider === "librelink"
        ? { email: libreEmail, password: librePassword, region: libreRegion, patientId: librePatientId || undefined }
        : { username: dexcomUsername, password: dexcomPassword, server: dexcomServer };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Connection test failed");
      }

      setTestResult({
        success: true,
        message: data.message || `Connection successful - Found ${data.readingsCount || 0} glucose readings`,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : "Connection test failed",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!testResult?.success) {
      setError("Please test your connection first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const endpoint = provider === "librelink"
        ? "/api/librelink/credentials"
        : "/api/dexcom/credentials";

      const body = provider === "librelink"
        ? { userId, email: libreEmail, password: librePassword, region: libreRegion, patientId: librePatientId || undefined }
        : { userId, username: dexcomUsername, password: dexcomPassword, server: dexcomServer };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save credentials");
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save credentials");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "select") {
    return (
      <div className="animate-in">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-[#FAFAFA] mb-2">
            Choose your CGM provider
          </h3>
          <p className="text-[#A1A1AA] text-sm">
            Select the continuous glucose monitor you use
          </p>
        </div>

        <div className="grid gap-4">
          <Card
            variant="interactive"
            padding="md"
            onClick={() => handleProviderSelect("librelink")}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[rgba(255,107,53,0.1)] flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <div className="flex-1">
                <h4 className="text-[#FAFAFA] font-semibold">Freestyle Libre</h4>
                <p className="text-[#A1A1AA] text-sm">
                  Connect via LibreLinkUp
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#71717A]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Card>

          <Card
            variant="interactive"
            padding="md"
            onClick={() => handleProviderSelect("dexcom")}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[rgba(255,107,53,0.1)] flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div className="flex-1">
                <h4 className="text-[#FAFAFA] font-semibold">Dexcom</h4>
                <p className="text-[#A1A1AA] text-sm">
                  Connect via Dexcom Share
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#71717A]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <button
        onClick={() => {
          setStep("select");
          setTestResult(null);
          setError("");
        }}
        className="flex items-center gap-2 text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors mb-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Change provider
      </button>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#FAFAFA] mb-2">
          {provider === "librelink" ? "LibreLinkUp Credentials" : "Dexcom Share Credentials"}
        </h3>
        <p className="text-[#A1A1AA] text-sm">
          Enter your {provider === "librelink" ? "LibreLinkUp" : "Dexcom Share"} login credentials.
          They will be encrypted and stored securely.
        </p>
      </div>

      <div className="space-y-4">
        {provider === "librelink" ? (
          <>
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={libreEmail}
              onChange={(e) => setLibreEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Your LibreLinkUp password"
              value={librePassword}
              onChange={(e) => setLibrePassword(e.target.value)}
            />
            <Select
              label="Region"
              options={LIBRE_REGIONS}
              value={libreRegion}
              onChange={(e) => setLibreRegion(e.target.value)}
            />
            <Input
              label="Patient ID (optional)"
              placeholder="Leave empty if you only follow one person"
              value={librePatientId}
              onChange={(e) => setLibrePatientId(e.target.value)}
              hint="Required if you follow multiple people in LibreLinkUp"
            />
          </>
        ) : (
          <>
            <Input
              label="Username"
              placeholder="Your Dexcom username"
              value={dexcomUsername}
              onChange={(e) => setDexcomUsername(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Your Dexcom password"
              value={dexcomPassword}
              onChange={(e) => setDexcomPassword(e.target.value)}
            />
            <Select
              label="Server"
              options={DEXCOM_SERVERS}
              value={dexcomServer}
              onChange={(e) => setDexcomServer(e.target.value)}
            />
          </>
        )}

        {testResult && (
          <div
            className={`p-4 rounded-lg ${
              testResult.success
                ? "bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]"
                : "bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]"
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[#22C55E]"
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[#EF4444]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              <span
                className={
                  testResult.success ? "text-[#22C55E]" : "text-[#EF4444]"
                }
              >
                {testResult.message}
              </span>
            </div>
          </div>
        )}

        {error && (
          <p className="text-[#EF4444] text-sm">{error}</p>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={handleTestConnection}
            isLoading={isTesting}
            disabled={
              provider === "librelink"
                ? !libreEmail || !librePassword
                : !dexcomUsername || !dexcomPassword
            }
          >
            Test Connection
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveCredentials}
            isLoading={isLoading}
            disabled={!testResult?.success}
            className="flex-1"
          >
            Save & Activate
          </Button>
        </div>
      </div>
    </div>
  );
}

