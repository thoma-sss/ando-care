"use client";

import { Button } from "./ui/Button";
import Image from "next/image";

interface StravaConnectProps {
  isConnected: boolean;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    profilePicture?: string | null;
  } | null;
  onConnect: () => void;
}

export function StravaConnect({ isConnected, user, onConnect }: StravaConnectProps) {
  if (isConnected && user) {
    return (
      <div className="animate-in">
        <div className="flex items-center gap-4 p-4 bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.2)] rounded-xl">
          <div className="relative">
            {user.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt="Profile"
                width={56}
                height={56}
                className="rounded-full"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#FC4C02] flex items-center justify-center text-white font-bold text-xl">
                {user.firstName?.[0] || "S"}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#22C55E] rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
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
            </div>
          </div>
          <div>
            <p className="text-[#22C55E] text-sm font-medium mb-1">Connected</p>
            <p className="text-[#FAFAFA] font-semibold">
              {user.firstName} {user.lastName}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-[rgba(252,76,2,0.1)] flex items-center justify-center mx-auto mb-4">
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8 text-[#FC4C02]"
            fill="currentColor"
          >
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[#FAFAFA] mb-2">
          Connect your Strava account
        </h3>
        <p className="text-[#A1A1AA] text-sm max-w-sm mx-auto">
          We&apos;ll use Strava to automatically enrich your activities with glucose data.
        </p>
      </div>

      <Button
        variant="strava"
        size="lg"
        onClick={onConnect}
        className="w-full"
        leftIcon={
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="currentColor"
          >
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
        }
      >
        Connect with Strava
      </Button>

      <p className="text-[#71717A] text-xs text-center mt-4">
        We only request read and write access to your activities.
      </p>
    </div>
  );
}

