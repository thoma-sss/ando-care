// Plausible Analytics helper functions

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

/**
 * Track a custom event with Plausible Analytics
 * @param event - Event name (e.g., "Strava Connected", "CGM Connected")
 * @param props - Optional properties to attach to the event
 */
export function trackEvent(event: string, props?: Record<string, string | number | boolean>) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(event, props ? { props } : undefined);
  }
}

// Pre-defined events for consistency
export const AnalyticsEvents = {
  // Strava events
  STRAVA_CONNECT_CLICK: "Strava Connect Click",
  STRAVA_CONNECTED: "Strava Connected",
  STRAVA_DISCONNECTED: "Strava Disconnected",
  
  // CGM events
  CGM_SENSOR_SELECTED: "CGM Sensor Selected",
  CGM_CONNECTED: "CGM Connected",
  CGM_CONNECTION_FAILED: "CGM Connection Failed",
  
  // Page events
  GET_STARTED_CLICK: "Get Started Click",
  SETUP_PAGE_VIEW: "Setup Page View",
  
  // Engagement events
  NEWSLETTER_SUBSCRIBED: "Newsletter Subscribed",
  SUGGESTION_SUBMITTED: "Suggestion Submitted",
  
  // Activity events
  ACTIVITY_DETAIL_VIEW: "Activity Detail View",
} as const;

