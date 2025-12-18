import type { DexcomGlucoseReading, DexcomServer, GlucoseReading } from "./types";

// Dexcom Share app ID (universal)
const DEXCOM_APP_ID = "d89443d2-327c-4a6f-89e5-496bbb0317db";

// Server configurations
const SERVER_CONFIGS: Record<DexcomServer, { baseUrl: string }> = {
  "share2.dexcom.com": {
    baseUrl: "https://share2.dexcom.com/ShareWebServices/Services",
  },
  "shareous1.dexcom.com": {
    baseUrl: "https://shareous1.dexcom.com/ShareWebServices/Services",
  },
};

/**
 * Parse Dexcom timestamp format "Date(1234567890000)" to ISO string
 */
function parseDexcomTimestamp(dtString: string): string {
  const match = dtString.match(/Date\((\d+)\)/);
  if (!match) {
    throw new Error(`Invalid Dexcom timestamp format: ${dtString}`);
  }
  return new Date(parseInt(match[1])).toISOString();
}

export class DexcomShareClient {
  private server: DexcomServer;
  private baseUrl: string;
  private sessionId: string | null = null;

  constructor(server: DexcomServer = "shareous1.dexcom.com") {
    this.server = server;
    this.baseUrl = SERVER_CONFIGS[server].baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Dexcom Share/3.0.2.11",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dexcom API error: ${response.status} - ${errorText}`);
    }

    // Some endpoints return empty response
    const text = await response.text();
    if (!text) return "" as T;

    try {
      return JSON.parse(text);
    } catch {
      return text as T;
    }
  }

  /**
   * CRITICAL: 2-step authentication process
   * Step 1: Get account ID
   * Step 2: Get session ID using account ID
   * 
   * NEVER use accountId directly as sessionId!
   */
  async login(username: string, password: string): Promise<void> {
    // Step 1: Authenticate publisher account to get accountId
    const accountId = await this.request<string>(
      "/General/AuthenticatePublisherAccount",
      {
        method: "POST",
        body: JSON.stringify({
          applicationId: DEXCOM_APP_ID,
          accountName: username,
          password: password,
        }),
      }
    );

    if (!accountId || accountId === "00000000-0000-0000-0000-000000000000") {
      throw new Error("Invalid credentials");
    }

    // Step 2: Login with account ID to get sessionId
    const sessionId = await this.request<string>(
      "/General/LoginPublisherAccountById",
      {
        method: "POST",
        body: JSON.stringify({
          applicationId: DEXCOM_APP_ID,
          accountId: accountId,
          password: password,
        }),
      }
    );

    if (!sessionId || sessionId === "00000000-0000-0000-0000-000000000000") {
      throw new Error("Failed to obtain session");
    }

    this.sessionId = sessionId;
  }

  /**
   * Get latest glucose readings
   * @param minutes - Number of minutes of data to retrieve (max 1440 = 24 hours)
   * @param maxCount - Maximum number of readings (max 288)
   */
  async getGlucoseReadings(
    minutes: number = 1440,
    maxCount: number = 288
  ): Promise<GlucoseReading[]> {
    if (!this.sessionId) {
      throw new Error("Not authenticated. Call login() first.");
    }

    const params = new URLSearchParams({
      sessionId: this.sessionId,
      minutes: Math.min(minutes, 1440).toString(),
      maxCount: Math.min(maxCount, 288).toString(),
    });

    const readings = await this.request<DexcomGlucoseReading[]>(
      `/Publisher/ReadPublisherLatestGlucoseValues?${params.toString()}`
    );

    if (!Array.isArray(readings)) {
      return [];
    }

    return readings.map((reading) => ({
      timestamp: parseDexcomTimestamp(reading.WT || reading.DT),
      value: reading.Value,
      trend: reading.Trend,
    }));
  }

  /**
   * Get glucose readings for a specific time range
   */
  async getGlucoseReadingsInRange(
    startTime: Date,
    endTime: Date
  ): Promise<GlucoseReading[]> {
    // Calculate minutes from now to the start time
    const now = new Date();
    const minutesFromNow = Math.ceil(
      (now.getTime() - startTime.getTime()) / (1000 * 60)
    );

    // Get all readings for the period
    const allReadings = await this.getGlucoseReadings(
      Math.min(minutesFromNow, 1440),
      288
    );

    // Filter to the exact time range
    return allReadings.filter((reading) => {
      const readingTime = new Date(reading.timestamp);
      return readingTime >= startTime && readingTime <= endTime;
    });
  }

  /**
   * Get the current server
   */
  getServer(): DexcomServer {
    return this.server;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.sessionId !== null;
  }
}

/**
 * Test Dexcom Share connection with provided credentials
 */
export async function testDexcomConnection(
  username: string,
  password: string,
  server: DexcomServer = "shareous1.dexcom.com"
): Promise<{
  success: boolean;
  message: string;
  readingsCount?: number;
}> {
  try {
    const client = new DexcomShareClient(server);
    await client.login(username, password);

    // Try to get recent readings to verify the connection works
    const readings = await client.getGlucoseReadings(60, 12); // Last hour, up to 12 readings

    return {
      success: true,
      message: `Connection successful - Found ${readings.length} glucose readings`,
      readingsCount: readings.length,
    };
  } catch (error) {
    let message = "Connection failed";
    
    if (error instanceof Error) {
      if (error.message.includes("Invalid credentials")) {
        message = "Invalid username or password";
      } else if (error.message.includes("Failed to obtain session")) {
        message = "Failed to authenticate. Please check your credentials.";
      } else {
        message = error.message;
      }
    }

    return {
      success: false,
      message,
    };
  }
}

