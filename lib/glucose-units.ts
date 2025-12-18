/**
 * Glucose Unit Conversion Utilities
 * 
 * Conversion factor: 1 mmol/L = 18.0182 mg/dL
 */

export type GlucoseUnit = "mg/dL" | "mmol/L";

// Conversion factor
const MGDL_TO_MMOL = 18.0182;

/**
 * Convert mg/dL to mmol/L
 */
export function mgdlToMmol(mgdl: number): number {
  return Math.round((mgdl / MGDL_TO_MMOL) * 10) / 10;
}

/**
 * Convert mmol/L to mg/dL
 */
export function mmolToMgdl(mmol: number): number {
  return Math.round(mmol * MGDL_TO_MMOL);
}

/**
 * Format glucose value with unit
 */
export function formatGlucose(value: number, unit: GlucoseUnit): string {
  if (unit === "mmol/L") {
    return `${mgdlToMmol(value)} mmol/L`;
  }
  return `${Math.round(value)} mg/dL`;
}

/**
 * Format glucose value without unit (just the number)
 */
export function formatGlucoseValue(value: number, unit: GlucoseUnit): string {
  if (unit === "mmol/L") {
    return mgdlToMmol(value).toFixed(1);
  }
  return Math.round(value).toString();
}

/**
 * Get target ranges in the specified unit
 */
export function getTargetRanges(unit: GlucoseUnit): { low: number; high: number; min: number; max: number } {
  if (unit === "mmol/L") {
    return {
      low: mgdlToMmol(70),
      high: mgdlToMmol(180),
      min: 0,
      max: mgdlToMmol(350),
    };
  }
  return {
    low: 70,
    high: 180,
    min: 0,
    max: 350,
  };
}

/**
 * Convert value to display unit
 */
export function convertToUnit(valueMgdl: number, unit: GlucoseUnit): number {
  if (unit === "mmol/L") {
    return mgdlToMmol(valueMgdl);
  }
  return valueMgdl;
}

/**
 * Get unit label
 */
export function getUnitLabel(unit: GlucoseUnit): string {
  return unit;
}

/**
 * Get Y-axis ticks for the glucose chart
 */
export function getChartTicks(unit: GlucoseUnit): number[] {
  if (unit === "mmol/L") {
    return [0, 5, 10, 15, 20];
  }
  return [0, 70, 140, 210, 280, 350];
}

