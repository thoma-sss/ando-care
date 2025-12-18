import { prisma } from "./prisma";
import { decrypt } from "./encryption";
import { StravaClient, refreshStravaToken } from "./strava/client";
import { LibreLinkUpClient } from "./librelink/client";
import { DexcomShareClient } from "./dexcom/client";
import { calculateGlucoseStats, generateGlucoseSummary } from "./cgm-stats";
import type { LibreLinkUpRegion } from "./librelink/types";
import type { DexcomServer } from "./dexcom/types";
import type { ActivityJobData } from "./job-queue";

/**
 * Process a Strava activity and add CGM data
 */
export async function processActivity(data: ActivityJobData): Promise<void> {
  const { activityId, athleteId } = data;

  console.log(`Processing activity ${activityId} for athlete ${athleteId}`);

  // Find user by athlete ID
  const user = await prisma.user.findUnique({
    where: { athleteId: BigInt(athleteId) },
    include: {
      stravaToken: true,
      libreLinkUpCreds: true,
      dexcomCreds: true,
      settings: true,
    },
  });

  if (!user) {
    console.log(`No user found for athlete ${athleteId}`);
    await logActivityUpdate(null, activityId, "skipped", "User not found");
    return;
  }

  if (!user.stravaToken) {
    console.log(`No Strava token for user ${user.id}`);
    await logActivityUpdate(user.id, activityId, "skipped", "No Strava token");
    return;
  }

  if (!user.cgmProvider) {
    console.log(`No CGM provider configured for user ${user.id}`);
    await logActivityUpdate(user.id, activityId, "skipped", "No CGM configured");
    return;
  }

  try {
    // Refresh Strava token if needed
    let accessToken = user.stravaToken.accessToken;
    if (new Date() >= user.stravaToken.expiresAt) {
      console.log(`Refreshing Strava token for user ${user.id}`);
      const refreshed = await refreshStravaToken(user.stravaToken.refreshToken);
      
      await prisma.stravaToken.update({
        where: { userId: user.id },
        data: {
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token,
          expiresAt: new Date(refreshed.expires_at * 1000),
        },
      });
      
      accessToken = refreshed.access_token;
    }

    // Get activity details
    const stravaClient = new StravaClient(accessToken);
    const activity = await stravaClient.getActivity(activityId);

    // Calculate time range for glucose data
    const startTime = new Date(activity.start_date);
    const endTime = new Date(startTime.getTime() + activity.elapsed_time * 1000);

    // Extend time range by 15 minutes on each side for context
    const extendedStart = new Date(startTime.getTime() - 15 * 60 * 1000);
    const extendedEnd = new Date(endTime.getTime() + 15 * 60 * 1000);

    // Get CGM data based on provider
    let glucoseReadings: Array<{ timestamp: string; value: number }> = [];

    if (user.cgmProvider === "librelink" && user.libreLinkUpCreds) {
      glucoseReadings = await getLibreLinkUpData(
        user.libreLinkUpCreds,
        extendedStart,
        extendedEnd
      );
    } else if (user.cgmProvider === "dexcom" && user.dexcomCreds) {
      glucoseReadings = await getDexcomData(
        user.dexcomCreds,
        extendedStart,
        extendedEnd
      );
    }

    if (glucoseReadings.length === 0) {
      console.log(`No glucose data found for activity ${activityId}`);
      await logActivityUpdate(
        user.id,
        activityId,
        "skipped",
        "No glucose data available"
      );
      return;
    }

    // Calculate stats
    const thresholds = {
      low: user.settings?.lowThreshold ?? 70,
      high: user.settings?.highThreshold ?? 180,
    };

    const stats = calculateGlucoseStats(glucoseReadings, thresholds);

    if (!stats) {
      await logActivityUpdate(
        user.id,
        activityId,
        "skipped",
        "Could not calculate stats"
      );
      return;
    }

    // Generate CGM summary with emojis and link
    const unit = user.settings?.unit ?? "mmol/L";
    const cgmSummary = generateGlucoseSummary(stats, unit, activityId);

    // Update activity description - CGM first, then original description
    const existingDescription = activity.description || "";
    const separator = existingDescription ? "\n\n" : "";
    const newDescription = `${cgmSummary}${separator}${existingDescription}`;

    await stravaClient.updateActivityDescription(activityId, newDescription);

    // Store CGM data
    await prisma.activityCgmData.upsert({
      where: {
        userId_activityId: {
          userId: user.id,
          activityId: BigInt(activityId),
        },
      },
      update: {
        dataPoints: glucoseReadings,
        startTime,
        endTime,
      },
      create: {
        userId: user.id,
        activityId: BigInt(activityId),
        dataPoints: glucoseReadings,
        startTime,
        endTime,
      },
    });

    // Log success
    await logActivityUpdate(
      user.id,
      activityId,
      "success",
      `Added ${glucoseReadings.length} glucose points`,
      glucoseReadings.length
    );

    console.log(
      `Successfully processed activity ${activityId} with ${glucoseReadings.length} glucose readings`
    );
  } catch (error) {
    console.error(`Error processing activity ${activityId}:`, error);
    await logActivityUpdate(
      user.id,
      activityId,
      "error",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
}

/**
 * Get glucose data from LibreLinkUp
 */
async function getLibreLinkUpData(
  creds: {
    encryptedEmail: string;
    encryptedPassword: string;
    region: string;
    patientId: string | null;
  },
  startTime: Date,
  endTime: Date
): Promise<Array<{ timestamp: string; value: number }>> {
  const email = decrypt(creds.encryptedEmail);
  const password = decrypt(creds.encryptedPassword);

  const client = new LibreLinkUpClient(creds.region as LibreLinkUpRegion);
  await client.login(email, password);

  const connections = await client.getConnections();
  if (connections.length === 0) {
    throw new Error("No LibreLinkUp connections found");
  }

  const patientId = creds.patientId || connections[0].patientId;
  const readings = await client.getGlucoseReadings(patientId, startTime, endTime);

  return readings.map((r) => ({
    timestamp: r.timestamp,
    value: r.value,
  }));
}

/**
 * Get glucose data from Dexcom
 */
async function getDexcomData(
  creds: {
    encryptedUsername: string;
    encryptedPassword: string;
    server: string;
  },
  startTime: Date,
  endTime: Date
): Promise<Array<{ timestamp: string; value: number }>> {
  const username = decrypt(creds.encryptedUsername);
  const password = decrypt(creds.encryptedPassword);

  const client = new DexcomShareClient(creds.server as DexcomServer);
  await client.login(username, password);

  const readings = await client.getGlucoseReadingsInRange(startTime, endTime);

  return readings.map((r) => ({
    timestamp: r.timestamp,
    value: r.value,
  }));
}

/**
 * Log activity update result
 */
async function logActivityUpdate(
  userId: string | null,
  activityId: number,
  status: "success" | "error" | "skipped",
  message: string,
  cgmPoints?: number
): Promise<void> {
  if (!userId) return;

  await prisma.activityUpdateLog.create({
    data: {
      userId,
      activityId: BigInt(activityId),
      status,
      message,
      cgmPoints,
    },
  });
}

