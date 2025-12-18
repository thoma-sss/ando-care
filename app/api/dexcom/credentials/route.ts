import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import type { DexcomServer } from "@/lib/dexcom/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, username, password, server } = body;

    if (!userId || !username || !password) {
      return NextResponse.json(
        { error: "userId, username, and password are required" },
        { status: 400 }
      );
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Encrypt credentials
    const encryptedUsername = encrypt(username);
    const encryptedPassword = encrypt(password);

    // Upsert Dexcom credentials
    await prisma.dexcomCreds.upsert({
      where: { userId },
      update: {
        encryptedUsername,
        encryptedPassword,
        server: (server || "shareous1.dexcom.com") as DexcomServer,
      },
      create: {
        userId,
        encryptedUsername,
        encryptedPassword,
        server: (server || "shareous1.dexcom.com") as DexcomServer,
      },
    });

    // Update user's CGM provider
    await prisma.user.update({
      where: { id: userId },
      data: { cgmProvider: "dexcom" },
    });

    // Delete any existing LibreLinkUp credentials (user can only have one CGM provider)
    await prisma.libreLinkUpCreds.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      message: "Dexcom credentials saved successfully",
    });
  } catch (error) {
    console.error("Dexcom credentials error:", error);
    return NextResponse.json(
      { error: "Failed to save credentials" },
      { status: 500 }
    );
  }
}

