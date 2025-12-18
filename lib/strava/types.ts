export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile_medium: string;
  profile: string;
}

export interface StravaTokenResponse {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: StravaAthlete;
}

export interface StravaRefreshResponse {
  token_type: string;
  access_token: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset: number;
  description: string | null;
  athlete: {
    id: number;
  };
}

export interface StravaDetailedActivity extends StravaActivity {
  calories: number;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  average_watts?: number;
  device_watts?: boolean;
  has_heartrate: boolean;
  pr_count: number;
  photos: {
    primary: {
      id: number;
      unique_id: string;
      urls: {
        "100": string;
        "600": string;
      };
    } | null;
    count: number;
  };
}

export interface StravaWebhookEvent {
  object_type: "activity" | "athlete";
  object_id: number;
  aspect_type: "create" | "update" | "delete";
  updates?: Record<string, unknown>;
  owner_id: number;
  subscription_id: number;
  event_time: number;
}

export interface StravaWebhookValidation {
  "hub.mode": string;
  "hub.challenge": string;
  "hub.verify_token": string;
}

export interface StravaSubscription {
  id: number;
  resource_state: number;
  application_id: number;
  callback_url: string;
  created_at: string;
  updated_at: string;
}

