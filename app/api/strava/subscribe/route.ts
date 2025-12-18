import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import {
  createStravaWebhookSubscription,
  getStravaWebhookSubscriptions,
  deleteStravaWebhookSubscription,
} from "@/lib/strava/client";

/**
 * GET - List current webhook subscriptions
 */
export async function GET() {
  try {
    const subscriptions = await getStravaWebhookSubscriptions();
    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error("Failed to get subscriptions:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get subscriptions" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new webhook subscription
 */
export async function POST() {
  try {
    // Check for existing subscriptions first
    const existing = await getStravaWebhookSubscriptions();
    
    if (existing.length > 0) {
      return NextResponse.json({
        message: "Subscription already exists",
        subscription: existing[0],
      });
    }

    const subscription = await createStravaWebhookSubscription();
    
    return NextResponse.json({
      message: "Subscription created successfully",
      subscription,
    });
  } catch (error) {
    console.error("Failed to create subscription:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create subscription" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a webhook subscription
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get("id");

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    await deleteStravaWebhookSubscription(parseInt(subscriptionId));
    
    return NextResponse.json({
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete subscription:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete subscription" },
      { status: 500 }
    );
  }
}

