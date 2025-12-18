export interface DexcomGlucoseReading {
  DT: string; // Date string in format "Date(timestamp)"
  ST: string; // System time
  WT: string; // Wall time
  Value: number;
  Trend: string;
}

export interface GlucoseReading {
  timestamp: string;
  value: number;
  trend: string;
}

export type DexcomServer = "share2.dexcom.com" | "shareous1.dexcom.com";

export interface DexcomServerConfig {
  server: DexcomServer;
  appId: string;
}

