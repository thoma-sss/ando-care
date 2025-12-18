import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { validateWebhookChallenge, verifyStravaSignature } from "@/lib/strava/webhook";
import { activityQueue, type ActivityJobData } from "@/lib/job-queue";
import { processActivity } from "@/lib/process-activity";
import type { StravaWebhookEvent } from "@/lib/strava/types";

// Initialize the job processor
activityQueue.setProcessor(processActivity);

/**
 * GET - Webhook validation (Strava subscription verification)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const verifyToken = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (!mode || !verifyToken || !challenge) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const result = validateWebhookChallenge(mode, verifyToken, challenge);

    if (result.valid && result.challenge) {
      return NextResponse.json({ "hub.challenge": result.challenge });
    }

    return NextResponse.json(
      { error: "Invalid verification token" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Webhook validation error:", error);
    return NextResponse.json(
      { error: "Validation failed" },
      { status: 500 }
    );
  }
}

/**
 * POST - Webhook event handler
 */
export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();

    // Verify signature in production
    const signature = request.headers.get("strava-signature");
    if (signature && process.env.DEBUG_STRAVA_SIGNATURE !== "1") {
      const isValid = verifyStravaSignature(bodyText, signature);
      if (!isValid) {
        console.error("Invalid Strava webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const event: StravaWebhookEvent = JSON.parse(bodyText);

    console.log("Received Strava webhook event:", {
      object_type: event.object_type,
      aspect_type: event.aspect_type,
      object_id: event.object_id,
      owner_id: event.owner_id,
    });

    // Only process activity create events
    if (event.object_type !== "activity") {
      return NextResponse.json({ status: "ignored", reason: "not_activity" });
    }

    if (event.aspect_type !== "create") {
      return NextResponse.json({ status: "ignored", reason: "not_create" });
    }

    // Queue the activity for processing
    const jobData: ActivityJobData = {
      activityId: event.object_id,
      athleteId: event.owner_id,
      eventTime: event.event_time,
    };

    const jobId = `${event.owner_id}-${event.object_id}`;
    activityQueue.add(jobId, jobData);

    console.log(`Queued activity ${event.object_id} for processing`);

    return NextResponse.json({ status: "queued", jobId });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}

