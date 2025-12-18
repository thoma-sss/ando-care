import axios, { AxiosInstance } from "axios";
import { CookieJar } from "tough-cookie";
import { HttpCookieAgent, HttpsCookieAgent } from "http-cookie-agent/http";
import crypto from "crypto";
import type {
  LibreLinkUpLoginResponse,
  LibreLinkUpConnectionsResponse,
  LibreLinkUpGraphResponse,
  LibreLinkUpRegion,
  GlucoseReading,
} from "./types";

// Region to API endpoint mapping
const LLU_API_ENDPOINTS: Record<LibreLinkUpRegion, string> = {
  AE: "api-ae.libreview.io",
  AP: "api-ap.libreview.io",
  AU: "api-au.libreview.io",
  CA: "api-ca.libreview.io",
  CN: "api.libreview.cn",
  DE: "api-de.libreview.io",
  EU: "api-eu.libreview.io",
  EU2: "api-eu2.libreview.io",
  FR: "api-fr.libreview.io",
  JP: "api-jp.libreview.io",
  LA: "api-la.libreview.io",
  RU: "api-ru.libreview.io",
  US: "api-us.libreview.io",
};

// Stealth User-Agent (iPhone Safari)
const USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU OS 17_4.1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/17.4.1 Mobile/10A5355d Safari/8536.25";

const LIBRE_LINK_UP_VERSION = "4.16.0";
const LIBRE_LINK_UP_PRODUCT = "llu.ios";

// Stealth TLS cipher configuration (avoid Cloudflare fingerprinting)
const defaultCiphers = crypto.constants.defaultCipherList.split(":");
const stealthCiphers = [
  defaultCiphers[0],
  defaultCiphers[2],
  defaultCiphers[1],
  ...defaultCiphers.slice(3),
].join(":");

export class LibreLinkUpClient {
  private axiosInstance: AxiosInstance;
  private region: LibreLinkUpRegion;
  private baseUrl: string;
  private authToken: string | null = null;
  private accountId: string | null = null;
  private cookieJar: CookieJar;

  constructor(region: LibreLinkUpRegion = "EU") {
    this.region = region;
    this.baseUrl = `https://${LLU_API_ENDPOINTS[region] || LLU_API_ENDPOINTS["EU"]}`;
    this.cookieJar = new CookieJar();

    // Create stealth HTTPS agent with cookie support
    const httpsAgent = new HttpsCookieAgent({
      cookies: { jar: this.cookieJar },
      ciphers: stealthCiphers,
      keepAlive: true,
    });

    const httpAgent = new HttpCookieAgent({
      cookies: { jar: this.cookieJar },
      keepAlive: true,
    });

    this.axiosInstance = axios.create({
      httpsAgent,
      httpAgent,
      withCredentials: true,
      headers: {
        "User-Agent": USER_AGENT,
        "Content-Type": "application/json;charset=UTF-8",
        "version": LIBRE_LINK_UP_VERSION,
        "product": LIBRE_LINK_UP_PRODUCT,
      },
    });
  }

  /**
   * Get authenticated headers with account-id hash
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "User-Agent": USER_AGENT,
      "Content-Type": "application/json;charset=UTF-8",
      "version": LIBRE_LINK_UP_VERSION,
      "product": LIBRE_LINK_UP_PRODUCT,
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    if (this.accountId) {
      // account-id is the SHA256 hash of the user ID
      headers["account-id"] = crypto
        .createHash("sha256")
        .update(this.accountId)
        .digest("hex");
    }

    return headers;
  }

  /**
   * Login to LibreLinkUp and get authentication token
   * Handles region redirects automatically
   */
  async login(email: string, password: string): Promise<void> {
    const response = await this.axiosInstance.post<LibreLinkUpLoginResponse>(
      `${this.baseUrl}/llu/auth/login`,
      { email, password }
    );

    if (response.data.status !== 0) {
      throw new Error(`LibreLinkUp login failed: ${JSON.stringify(response.data)}`);
    }

    // Handle region redirect
    if (response.data.data.redirect && response.data.data.region) {
      const newRegion = response.data.data.region.toUpperCase() as LibreLinkUpRegion;
      if (LLU_API_ENDPOINTS[newRegion]) {
        this.region = newRegion;
        this.baseUrl = `https://${LLU_API_ENDPOINTS[newRegion]}`;
        // Retry login with the correct region
        return this.login(email, password);
      }
      throw new Error(`Unknown region redirect: ${response.data.data.region}`);
    }

    if (!response.data.data.authTicket?.token) {
      throw new Error("No authentication token received from LibreLinkUp");
    }

    this.authToken = response.data.data.authTicket.token;
    this.accountId = response.data.data.user?.id || null;
  }

  /**
   * Get list of connected patients
   */
  async getConnections(): Promise<LibreLinkUpConnectionsResponse["data"]> {
    if (!this.authToken) {
      throw new Error("Not authenticated. Call login() first.");
    }

    const response = await this.axiosInstance.get<LibreLinkUpConnectionsResponse>(
      `${this.baseUrl}/llu/connections`,
      { headers: this.getAuthHeaders() }
    );

    if (response.data.status !== 0) {
      throw new Error(`Failed to get connections: ${JSON.stringify(response.data)}`);
    }

    return response.data.data;
  }

  /**
   * Get glucose graph data for a specific patient
   */
  async getGlucoseData(
    patientId: string
  ): Promise<LibreLinkUpGraphResponse["data"]> {
    if (!this.authToken) {
      throw new Error("Not authenticated. Call login() first.");
    }

    const response = await this.axiosInstance.get<LibreLinkUpGraphResponse>(
      `${this.baseUrl}/llu/connections/${patientId}/graph`,
      { headers: this.getAuthHeaders() }
    );

    if (response.data.status !== 0) {
      throw new Error(`Failed to get glucose data: ${JSON.stringify(response.data)}`);
    }

    return response.data.data;
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
      timestamp: parseLibreLinkTimestamp(point.Timestamp),
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
    return this.authToken !== null;
  }
}

/**
 * Parse LibreLinkUp timestamp format
 * Format: "1/15/2025 10:30:00 AM" (MM/DD/YYYY hh:mm:ss AM/PM)
 */
function parseLibreLinkTimestamp(timestamp: string): string {
  try {
    const [datePart, timePart, meridiem] = timestamp.split(" ");
    const [month, day, year] = datePart.split("/").map(Number);
    let [hours, minutes, seconds] = timePart.split(":").map(Number);

    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;

    const date = new Date(year, month - 1, day, hours, minutes, seconds);
    return date.toISOString();
  } catch {
    // If parsing fails, return the original timestamp
    return timestamp;
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
        message: "No connected patients found. Please add a connection in LibreLinkUp app.",
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
