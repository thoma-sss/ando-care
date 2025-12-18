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

// Required headers to bypass Cloudflare protection and satisfy API requirements
const DEFAULT_HEADERS: Record<string, string> = {
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Connection": "keep-alive",
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Pragma": "no-cache",
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1",
  "product": "llu.ios",
  "version": "4.16.0",
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
    const headers: Record<string, string> = {
      ...DEFAULT_HEADERS,
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      throw new Error(
        `LibreLinkUp API error: ${response.status} - ${responseText}`
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(`Invalid JSON response from LibreLinkUp: ${responseText}`);
    }

    // Check for API-level errors (status !== 0 means error)
    if (data.status !== undefined && data.status !== 0) {
      throw new Error(`LibreLinkUp error: ${data.error?.message || JSON.stringify(data)}`);
    }

    return data;
  }

  /**
   * Login to LibreLinkUp and get authentication token
   * Handles region redirects automatically
   */
  async login(email: string, password: string): Promise<void> {
    const response = await this.request<LibreLinkUpLoginResponse>(
      "/llu/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );

    // Handle region redirect if needed
    if (response.data.redirect && response.data.region) {
      const newRegion = response.data.region.toUpperCase() as LibreLinkUpRegion;
      if (REGION_URLS[newRegion]) {
        this.region = newRegion;
        this.baseUrl = REGION_URLS[newRegion];
        // Retry login with the new region
        return this.login(email, password);
      }
    }

    if (!response.data.authTicket?.token) {
      throw new Error("No authentication token received from LibreLinkUp");
    }

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
  actualRegion?: string;
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
        actualRegion: client.getRegion(),
      };
    }

    // Get glucose data for the specified or first patient
    const targetPatientId = patientId || connections[0].patientId;
    const glucoseData = await client.getGlucoseData(targetPatientId);

    return {
      success: true,
      message: `Connection successful - Found ${glucoseData.graphData.length} glucose readings`,
      readingsCount: glucoseData.graphData.length,
      actualRegion: client.getRegion(),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}
