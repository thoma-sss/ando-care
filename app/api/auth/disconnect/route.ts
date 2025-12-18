import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear the user_id cookie
    cookieStore.delete("user_id");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}

