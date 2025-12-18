export interface LibreLinkUpLoginRequest {
  email: string;
  password: string;
}

export interface LibreLinkUpLoginResponse {
  status: number;
  data: {
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    authTicket?: {
      token: string;
      expires: number;
      duration: number;
    };
    // Region redirect fields
    redirect?: boolean;
    region?: string;
  };
}

export interface LibreLinkUpConnection {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  glucoseMeasurement?: {
    FactoryTimestamp: string;
    Timestamp: string;
    type: number;
    ValueInMgPerDl: number;
    TrendArrow: number;
    TrendMessage: string | null;
    MeasurementColor: number;
    GlucoseUnits: number;
    Value: number;
    isHigh: boolean;
    isLow: boolean;
  };
}

export interface LibreLinkUpConnectionsResponse {
  status: number;
  data: LibreLinkUpConnection[];
}

export interface LibreLinkUpGraphData {
  connection: LibreLinkUpConnection;
  activeSensors: unknown[];
  graphData: GlucoseGraphDataPoint[];
}

export interface GlucoseGraphDataPoint {
  FactoryTimestamp: string;
  Timestamp: string;
  type: number;
  ValueInMgPerDl: number;
  MeasurementColor: number;
  GlucoseUnits: number;
  Value: number;
  isHigh: boolean;
  isLow: boolean;
}

export interface LibreLinkUpGraphResponse {
  status: number;
  data: LibreLinkUpGraphData;
}

export type LibreLinkUpRegion =
  | "EU"
  | "EU2"
  | "US"
  | "DE"
  | "FR"
  | "CA"
  | "AU"
  | "AP"
  | "AE"
  | "JP"
  | "LA"
  | "RU"
  | "CN";

export interface GlucoseReading {
  timestamp: string;
  value: number;
  isHigh: boolean;
  isLow: boolean;
}

