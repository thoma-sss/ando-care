import crypto from "crypto";

/**
 * Verifies the signature of a Strava webhook request
 * Uses timing-safe comparison to prevent timing attacks
 */
export function verifyStravaSignature(
  body: string,
  signature: string,
  secret?: string
): boolean {
  const webhookSecret = secret || process.env.STRAVA_CLIENT_SECRET;
  
  if (!webhookSecret) {
    throw new Error("STRAVA_CLIENT_SECRET is required for signature verification");
  }

  // Allow bypassing signature verification in development
  if (process.env.ALLOW_UNSIGNED_STRAVA === "1") {
    console.warn("WARNING: Strava signature verification is disabled");
    return true;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    // If buffers have different lengths, timingSafeEqual throws
    return false;
  }
}

/**
 * Validates the webhook subscription verification request from Strava
 */
export function validateWebhookChallenge(
  mode: string,
  verifyToken: string,
  challenge: string
): { valid: boolean; challenge?: string } {
  const expectedToken = process.env.STRAVA_VERIFY_TOKEN;
  
  if (!expectedToken) {
    throw new Error("STRAVA_VERIFY_TOKEN is required");
  }

  if (mode === "subscribe" && verifyToken === expectedToken) {
    return { valid: true, challenge };
  }

  return { valid: false };
}

