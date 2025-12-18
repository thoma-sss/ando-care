import { NextRequest, NextResponse } from "next/server";
import { testDexcomConnection } from "@/lib/dexcom/client";
import type { DexcomServer } from "@/lib/dexcom/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, server } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const validServers = ["share2.dexcom.com", "shareous1.dexcom.com"];

    if (server && !validServers.includes(server)) {
      return NextResponse.json(
        { error: "Invalid server" },
        { status: 400 }
      );
    }

    const result = await testDexcomConnection(
      username,
      password,
      (server || "shareous1.dexcom.com") as DexcomServer
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      readingsCount: result.readingsCount,
    });
  } catch (error) {
    console.error("Dexcom test error:", error);
    return NextResponse.json(
      { error: "Failed to test connection" },
      { status: 500 }
    );
  }
}

