import { NextRequest, NextResponse } from "next/server";
import { testLibreLinkUpConnection } from "@/lib/librelink/client";
import type { LibreLinkUpRegion } from "@/lib/librelink/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, region, patientId } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const validRegions = [
      "EU", "EU2", "US", "DE", "FR", "CA", "AU", "AP", "AE", "JP", "LA", "RU", "CN"
    ];

    if (region && !validRegions.includes(region)) {
      return NextResponse.json(
        { error: "Invalid region" },
        { status: 400 }
      );
    }

    const result = await testLibreLinkUpConnection(
      email,
      password,
      (region || "EU") as LibreLinkUpRegion,
      patientId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, connections: result.connections },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      readingsCount: result.readingsCount,
      connections: result.connections,
    });
  } catch (error) {
    console.error("LibreLinkUp test error:", error);
    return NextResponse.json(
      { error: "Failed to test connection" },
      { status: 500 }
    );
  }
}

