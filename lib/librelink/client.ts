import type {
  LibreLinkUpLoginResponse,
  LibreLinkUpConnectionsResponse,
  LibreLinkUpGraphResponse,
  LibreLinkUpRegion,
  GlucoseReading,
} from "./types";

// Region to API URL mapping
const REGION_URLS: Record<LibreLinkUpRegion, string> = {
  EU: "https://api-eu.libreview.io",
  EU2: "https://api-eu2.libreview.io",
  US: "https://api-us.libreview.io",
  DE: "https://api-de.libreview.io",
  FR: "https://api-fr.libreview.io",
  CA: "https://api-ca.libreview.io",
  AU: "https://api-au.libreview.io",
  AP: "https://api-ap.libreview.io",
  AE: "https://api-ae.libreview.io",
  JP: "https://api-jp.libreview.io",
  LA: "https://api-la.libreview.io",
  RU: "https://api-ru.libreview.io",
  CN: "https://api-cn.libreview.io",
};

// Required headers to bypass Cloudflare protection
const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  Accept: "application/json",
  "Content-Type": "application/json",
  version: "4.16.0",
  product: "llu.ios",
};

export class LibreLinkUpClient {
  private baseUrl: string;
  private token: string | null = null;
  private region: LibreLinkUpRegion;

  constructor(region: LibreLinkUpRegion = "EU") {
    this.region = region;
    this.baseUrl = REGION_URLS[region];
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      ...DEFAULT_HEADERS,
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `LibreLinkUp API error: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();

    // Check for API-level errors
    if (data.status !== 0) {
      throw new Error(`LibreLinkUp error: ${data.error?.message || "Unknown error"}`);
    }

    return data;
  }

  /**
   * Login to LibreLinkUp and get authentication token
   */
  async login(email: string, password: string): Promise<void> {
    const response = await this.request<LibreLinkUpLoginResponse>(
      "/llu/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );

    this.token = response.data.authTicket.token;
  }

  /**
   * Get list of connected patients
   */
  async getConnections(): Promise<LibreLinkUpConnectionsResponse["data"]> {
    if (!this.token) {
      throw new Error("Not authenticated. Call login() first.");
    }

    const response = await this.request<LibreLinkUpConnectionsResponse>(
      "/llu/connections"
    );

    return response.data;
  }

  /**
   * Get glucose graph data for a specific patient
   */
  async getGlucoseData(
    patientId: string
  ): Promise<LibreLinkUpGraphResponse["data"]> {
    if (!this.token) {
      throw new Error("Not authenticated. Call login() first.");
    }

    const response = await this.request<LibreLinkUpGraphResponse>(
      `/llu/connections/${patientId}/graph`
    );

    return response.data;
  }

  /**
   * Get glucose readings for a specific time range
   */
  async getGlucoseReadings(
    patientId: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<GlucoseReading[]> {
    const data = await this.getGlucoseData(patientId);

    let readings: GlucoseReading[] = data.graphData.map((point) => ({
      timestamp: point.Timestamp,
      value: point.ValueInMgPerDl,
      isHigh: point.isHigh,
      isLow: point.isLow,
    }));

    // Filter by time range if specified
    if (startTime || endTime) {
      readings = readings.filter((reading) => {
        const readingTime = new Date(reading.timestamp);
        if (startTime && readingTime < startTime) return false;
        if (endTime && readingTime > endTime) return false;
        return true;
      });
    }

    return readings;
  }

  /**
   * Get the current region
   */
  getRegion(): LibreLinkUpRegion {
    return this.region;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.token !== null;
  }
}

/**
 * Test LibreLinkUp connection with provided credentials
 */
export async function testLibreLinkUpConnection(
  email: string,
  password: string,
  region: LibreLinkUpRegion = "EU",
  patientId?: string
): Promise<{
  success: boolean;
  message: string;
  readingsCount?: number;
  connections?: Array<{ id: string; name: string }>;
}> {
  try {
    const client = new LibreLinkUpClient(region);
    await client.login(email, password);

    const connections = await client.getConnections();

    if (connections.length === 0) {
      return {
        success: false,
        message: "No connected patients found. Please add a connection in LibreLinkUp.",
      };
    }

    // If multiple connections and no patientId specified
    if (connections.length > 1 && !patientId) {
      return {
        success: true,
        message: `Found ${connections.length} connections. Please select a patient.`,
        connections: connections.map((c) => ({
          id: c.patientId,
          name: `${c.firstName} ${c.lastName}`,
        })),
      };
    }

    // Get glucose data for the specified or first patient
    const targetPatientId = patientId || connections[0].patientId;
    const glucoseData = await client.getGlucoseData(targetPatientId);

    return {
      success: true,
      message: `Connection successful - Found ${glucoseData.graphData.length} glucose readings`,
      readingsCount: glucoseData.graphData.length,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

