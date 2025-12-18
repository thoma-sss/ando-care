import { NextRequest, NextResponse } from "next/server";
import { getStravaAuthUrl } from "@/lib/strava/client";

export async function GET(request: NextRequest) {
  const baseUrl = process.env.APP_BASE_URL || `http://${request.headers.get("host")}`;

  // Check if Strava credentials are configured
  if (!process.env.STRAVA_CLIENT_ID || !process.env.STRAVA_CLIENT_SECRET) {
    return NextResponse.json(
      {
        error: "Strava OAuth not configured",
        message: "Please set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET in your .env.local file",
        help: "Get your credentials from https://www.strava.com/settings/api",
      },
      { status: 503 }
    );
  }

  try {
    const authUrl = getStravaAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Strava auth error:", error);
    return NextResponse.redirect(`${baseUrl}/strava?error=auth_failed`);
  }
}
