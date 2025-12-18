import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import type { LibreLinkUpRegion } from "@/lib/librelink/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, password, region, patientId } = body;

    if (!userId || !email || !password) {
      return NextResponse.json(
        { error: "userId, email, and password are required" },
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
    const encryptedEmail = encrypt(email);
    const encryptedPassword = encrypt(password);

    // Upsert LibreLinkUp credentials
    await prisma.libreLinkUpCreds.upsert({
      where: { userId },
      update: {
        encryptedEmail,
        encryptedPassword,
        region: (region || "EU") as LibreLinkUpRegion,
        patientId: patientId || null,
      },
      create: {
        userId,
        encryptedEmail,
        encryptedPassword,
        region: (region || "EU") as LibreLinkUpRegion,
        patientId: patientId || null,
      },
    });

    // Update user's CGM provider
    await prisma.user.update({
      where: { id: userId },
      data: { cgmProvider: "librelink" },
    });

    // Delete any existing Dexcom credentials (user can only have one CGM provider)
    await prisma.dexcomCreds.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      message: "LibreLinkUp credentials saved successfully",
    });
  } catch (error) {
    console.error("LibreLinkUp credentials error:", error);
    return NextResponse.json(
      { error: "Failed to save credentials" },
      { status: 500 }
    );
  }
}

