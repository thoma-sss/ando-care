import type {
  StravaTokenResponse,
  StravaRefreshResponse,
  StravaActivity,
  StravaDetailedActivity,
  StravaSubscription,
} from "./types";

const STRAVA_API_BASE = "https://www.strava.com/api/v3";
const STRAVA_OAUTH_BASE = "https://www.strava.com/oauth";

export class StravaClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${STRAVA_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Strava API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Get the authenticated athlete
   */
  async getAthlete() {
    return this.request<{
      id: number;
      firstname: string;
      lastname: string;
      profile_medium: string;
      profile: string;
    }>("/athlete");
  }

  /**
   * Get a specific activity
   */
  async getActivity(activityId: number): Promise<StravaDetailedActivity> {
    return this.request<StravaDetailedActivity>(`/activities/${activityId}`);
  }

  /**
   * Get recent activities
   */
  async getActivities(options?: {
    before?: number;
    after?: number;
    page?: number;
    per_page?: number;
  }): Promise<StravaActivity[]> {
    const params = new URLSearchParams();
    if (options?.before) params.set("before", options.before.toString());
    if (options?.after) params.set("after", options.after.toString());
    if (options?.page) params.set("page", options.page.toString());
    if (options?.per_page) params.set("per_page", options.per_page.toString());
    
    const query = params.toString();
    return this.request<StravaActivity[]>(`/athlete/activities${query ? `?${query}` : ""}`);
  }

  /**
   * Update an activity's description
   */
  async updateActivityDescription(
    activityId: number,
    description: string
  ): Promise<StravaActivity> {
    return this.request<StravaActivity>(`/activities/${activityId}`, {
      method: "PUT",
      body: JSON.stringify({ description }),
    });
  }

  /**
   * Update an activity
   */
  async updateActivity(
    activityId: number,
    data: Partial<{
      name: string;
      description: string;
      type: string;
      sport_type: string;
      gear_id: string;
      trainer: boolean;
      commute: boolean;
      hide_from_home: boolean;
    }>
  ): Promise<StravaActivity> {
    return this.request<StravaActivity>(`/activities/${activityId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}

/**
 * Generate the Strava OAuth authorization URL
 */
export function getStravaAuthUrl(state?: string): string {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = `${process.env.APP_BASE_URL}/api/auth/strava/callback`;
  
  if (!clientId) {
    throw new Error("STRAVA_CLIENT_ID environment variable is required");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "read,activity:read_all,activity:write",
    approval_prompt: "auto",
  });

  if (state) {
    params.set("state", state);
  }

  return `${STRAVA_OAUTH_BASE}/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeStravaCode(
  code: string
): Promise<StravaTokenResponse> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET are required");
  }

  const response = await fetch(`${STRAVA_OAUTH_BASE}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Refresh an expired access token
 */
export async function refreshStravaToken(
  refreshToken: string
): Promise<StravaRefreshResponse> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET are required");
  }

  const response = await fetch(`${STRAVA_OAUTH_BASE}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Create a webhook subscription
 */
export async function createStravaWebhookSubscription(): Promise<{ id: number }> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const verifyToken = process.env.STRAVA_VERIFY_TOKEN;
  const callbackUrl = `${process.env.APP_BASE_URL}/api/strava/webhook`;

  if (!clientId || !clientSecret || !verifyToken) {
    throw new Error("Strava credentials and verify token are required");
  }

  const response = await fetch(
    "https://www.strava.com/api/v3/push_subscriptions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        callback_url: callbackUrl,
        verify_token: verifyToken,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create subscription: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Get existing webhook subscriptions
 */
export async function getStravaWebhookSubscriptions(): Promise<StravaSubscription[]> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET are required");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(
    `https://www.strava.com/api/v3/push_subscriptions?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get subscriptions: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Delete a webhook subscription
 */
export async function deleteStravaWebhookSubscription(
  subscriptionId: number
): Promise<void> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET are required");
  }

  const response = await fetch(
    `https://www.strava.com/api/v3/push_subscriptions/${subscriptionId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete subscription: ${response.status} - ${error}`);
  }
}

