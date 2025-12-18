export interface GlucoseReading {
  timestamp: string | Date;
  value: number;
}

export interface GlucoseStats {
  count: number;
  average: number;
  min: number;
  max: number;
  stdDev: number;
  timeInRange: number;
  timeBelowRange: number;
  timeAboveRange: number;
  coefficientOfVariation: number;
}

export interface GlucoseThresholds {
  low: number;
  high: number;
}

const DEFAULT_THRESHOLDS: GlucoseThresholds = {
  low: 70,
  high: 180,
};

/**
 * Calculate comprehensive glucose statistics from a set of readings
 */
export function calculateGlucoseStats(
  readings: GlucoseReading[],
  thresholds: GlucoseThresholds = DEFAULT_THRESHOLDS
): GlucoseStats | null {
  if (!readings || readings.length === 0) {
    return null;
  }

  const values = readings.map((r) => r.value);
  const count = values.length;

  // Basic statistics
  const sum = values.reduce((a, b) => a + b, 0);
  const average = sum / count;
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Standard deviation
  const squaredDiffs = values.map((v) => Math.pow(v - average, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / count;
  const stdDev = Math.sqrt(avgSquaredDiff);

  // Coefficient of variation (%)
  const coefficientOfVariation = (stdDev / average) * 100;

  // Time in range calculations
  const belowRange = values.filter((v) => v < thresholds.low).length;
  const aboveRange = values.filter((v) => v > thresholds.high).length;
  const inRange = count - belowRange - aboveRange;

  const timeInRange = (inRange / count) * 100;
  const timeBelowRange = (belowRange / count) * 100;
  const timeAboveRange = (aboveRange / count) * 100;

  return {
    count,
    average: Math.round(average),
    min,
    max,
    stdDev: Math.round(stdDev * 10) / 10,
    timeInRange: Math.round(timeInRange),
    timeBelowRange: Math.round(timeBelowRange),
    timeAboveRange: Math.round(timeAboveRange),
    coefficientOfVariation: Math.round(coefficientOfVariation * 10) / 10,
  };
}

/**
 * Filter glucose readings to a specific time range
 */
export function filterReadingsByTimeRange(
  readings: GlucoseReading[],
  startTime: Date,
  endTime: Date
): GlucoseReading[] {
  return readings.filter((reading) => {
    const timestamp = new Date(reading.timestamp);
    return timestamp >= startTime && timestamp <= endTime;
  });
}

/**
 * Format glucose stats as a string for Strava description
 */
export function formatGlucoseStatsForStrava(
  stats: GlucoseStats,
  unit: string = "mmol/L"
): string {
  const lines = [
    `[CGM] In-range: ${stats.timeInRange}% | <70: ${stats.timeBelowRange}% | >180: ${stats.timeAboveRange}%`,
    `Avg: ${stats.average} ${unit} | Min: ${stats.min} | Max: ${stats.max}`,
  ];

  return lines.join(" | ");
}

/**
 * Generate progress bar for glucose zones
 */
function generateProgressBar(
  timeLowPct: number,
  timeInRangePct: number,
  timeHighPct: number
): string {
  const blocks = 10;
  const lowBlocks = Math.round((timeLowPct / 100) * blocks);
  const highBlocks = Math.round((timeHighPct / 100) * blocks);
  const inRangeBlocks = Math.max(0, blocks - lowBlocks - highBlocks);

  return "🟥".repeat(Math.max(0, lowBlocks)) + 
         "🟩".repeat(inRangeBlocks) + 
         "🟨".repeat(Math.max(0, highBlocks));
}

/**
 * Format glucose value with conversion if needed
 */
function formatValue(value: number, unit: string): string {
  if (unit === "mmol/L") {
    return `${mgdlToMmol(value)} mmol/L`;
  }
  return `${value} mg/dL`;
}

/**
 * Generate a compact glucose summary for Strava with emojis
 */
export function generateGlucoseSummary(
  stats: GlucoseStats,
  unit: string = "mmol/L",
  activityId?: number | bigint
): string {
  const roundedInRange = Math.round(stats.timeInRange);
  const progressBar = generateProgressBar(
    stats.timeBelowRange,
    stats.timeInRange,
    stats.timeAboveRange
  );

  const avgFormatted = formatValue(stats.average, unit);
  const minFormatted = formatValue(stats.min, unit);
  const maxFormatted = formatValue(stats.max, unit);

  let description = `🎯 ${roundedInRange}% in Range  ${progressBar}
🩸 Avg : ${avgFormatted} - Min : ${minFormatted} - Max : ${maxFormatted}
⚡ Powered by Ando Care ⚡`;

  // Add link to detailed report if activityId is provided
  if (activityId) {
    const baseUrl = process.env.APP_BASE_URL || "https://ando.care";
    description += `\n📈 Detailed CGM report: ${baseUrl}/activity/${activityId}`;
  }

  return description;
}

/**
 * Convert mg/dL to mmol/L
 */
export function mgdlToMmol(mgdl: number): number {
  return Math.round((mgdl / 18.0182) * 10) / 10;
}

/**
 * Convert mmol/L to mg/dL
 */
export function mmolToMgdl(mmol: number): number {
  return Math.round(mmol * 18.0182);
}

