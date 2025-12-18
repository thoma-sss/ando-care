import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { exchangeStravaCode } from "@/lib/strava/client";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const scope = searchParams.get("scope");

  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  // Handle error from Strava
  if (error) {
    console.error("Strava OAuth error:", error);
    return NextResponse.redirect(`${baseUrl}/strava?error=${error}`);
  }

  // Validate code presence
  if (!code) {
    return NextResponse.redirect(`${baseUrl}/strava?error=missing_code`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await exchangeStravaCode(code);
    
    const {
      access_token,
      refresh_token,
      expires_at,
      athlete,
    } = tokenResponse;

    // Upsert user
    const user = await prisma.user.upsert({
      where: {
        athleteId: BigInt(athlete.id),
      },
      update: {
        firstName: athlete.firstname,
        lastName: athlete.lastname,
        profilePicture: athlete.profile_medium || athlete.profile,
      },
      create: {
        athleteId: BigInt(athlete.id),
        firstName: athlete.firstname,
        lastName: athlete.lastname,
        profilePicture: athlete.profile_medium || athlete.profile,
      },
    });

    // Upsert Strava token
    await prisma.stravaToken.upsert({
      where: {
        userId: user.id,
      },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(expires_at * 1000),
        scope: scope || undefined,
      },
      create: {
        userId: user.id,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(expires_at * 1000),
        scope: scope || undefined,
      },
    });

    // Create default settings if they don't exist
    await prisma.settings.upsert({
      where: {
        userId: user.id,
      },
      update: {},
      create: {
        userId: user.id,
        lowThreshold: 70,
        highThreshold: 180,
        unit: "mmol/L",
      },
    });

    // Redirect to setup page with user ID
    return NextResponse.redirect(
      `${baseUrl}/strava?userId=${user.id}&connected=true`
    );
  } catch (error) {
    console.error("Strava callback error:", error);
    return NextResponse.redirect(`${baseUrl}/strava?error=callback_failed`);
  }
}

