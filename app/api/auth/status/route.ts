import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        athleteId: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        cgmProvider: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        athleteId: user.athleteId.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        cgmProvider: user.cgmProvider,
      },
    });
  } catch (error) {
    console.error("Error checking auth status:", error);
    return NextResponse.json({ user: null });
  }
}

