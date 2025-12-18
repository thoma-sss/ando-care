"use client";

import { useMemo, useState, useRef, useCallback } from "react";

interface ActivityDetailPoint {
  timestamp: string;
  value: number;
}

interface GlucoseChartProps {
  data: ActivityDetailPoint[];
  activityStartTime?: string;
  activityEndTime?: string;
  windowStartTime?: string;
  windowEndTime?: string;
  glucoseUnit?: "mg/dL" | "mmol/L";
  lowThreshold?: number;
  highThreshold?: number;
}

// Colors
const COLORS = {
  low: "#ef4444",
  range: "#4baf51",
  high: "#ffa726",
  inactive: "#9ca3af",
  strava: "#fc5201",
};

// Convert mg/dL to mmol/L
function mgdlToMmol(value: number): number {
  return Math.round((value / 18.0182) * 10) / 10;
}

// Format glucose value with unit
function formatValue(value: number, unit: "mg/dL" | "mmol/L"): string {
  if (unit === "mmol/L") {
    return `${mgdlToMmol(value)}`;
  }
  return `${Math.round(value)}`;
}

// Interpolate value at a specific time
function interpolateValueAtTime(
  data: ActivityDetailPoint[],
  targetTime: number
): number {
  if (data.length === 0) return 0;

  const timestamps = data.map((p) => new Date(p.timestamp).getTime());

  if (targetTime <= timestamps[0]) return data[0].value;
  if (targetTime >= timestamps[timestamps.length - 1])
    return data[data.length - 1].value;

  for (let i = 0; i < timestamps.length - 1; i++) {
    if (targetTime >= timestamps[i] && targetTime <= timestamps[i + 1]) {
      const t =
        (targetTime - timestamps[i]) / (timestamps[i + 1] - timestamps[i]);
      return data[i].value + t * (data[i + 1].value - data[i].value);
    }
  }

  return data[0].value;
}

// Create smooth cubic bezier path
function createSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return "";

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const prev = i > 0 ? points[i - 1] : current;

    const cp1x = current.x + (next.x - prev.x) / 6;
    const cp1y = current.y + (next.y - prev.y) / 6;
    const cp2x = next.x - (next.x - current.x) / 3;
    const cp2y = next.y - (next.y - current.y) / 3;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }
  return path;
}

export function GlucoseChart({
  data,
  activityStartTime,
  activityEndTime,
  glucoseUnit = "mg/dL",
  lowThreshold = 70,
  highThreshold = 180,
}: GlucoseChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverData, setHoverData] = useState<{
    x: number;
    y: number;
    value: number;
    time: string;
  } | null>(null);

  const chartConfig = useMemo(() => {
    if (data.length === 0) {
      return null;
    }

    const sortedData = [...data].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const padding = { top: 40, right: 20, bottom: 50, left: 50 };
    const width = 800;
    const height = 400;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Time range
    const times = sortedData.map((r) => new Date(r.timestamp).getTime());
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const timeRange = maxTime - minTime || 1;

    // Value range
    const values = sortedData.map((r) => r.value);
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    const minValue = Math.min(dataMin - 10, lowThreshold - 20);
    const maxValue = Math.max(dataMax + 10, highThreshold + 20);
    const valueRange = maxValue - minValue;

    // Scale functions
    const scaleX = (time: number) =>
      padding.left + ((time - minTime) / timeRange) * chartWidth;
    const scaleY = (value: number) =>
      padding.top + ((maxValue - value) / valueRange) * chartHeight;

    // Activity time boundaries
    const actStart = activityStartTime
      ? new Date(activityStartTime).getTime()
      : null;
    const actEnd = activityEndTime
      ? new Date(activityEndTime).getTime()
      : null;

    // Generate all points
    const allPoints = sortedData.map((r) => {
      const time = new Date(r.timestamp).getTime();
      return {
        x: scaleX(time),
        y: scaleY(r.value),
        value: r.value,
        time,
        timestamp: r.timestamp,
      };
    });

    // Split points into segments: before, during, after activity
    const beforePoints: typeof allPoints = [];
    const duringPoints: typeof allPoints = [];
    const afterPoints: typeof allPoints = [];

    allPoints.forEach((point) => {
      if (actStart && actEnd) {
        if (point.time < actStart) {
          beforePoints.push(point);
        } else if (point.time > actEnd) {
          afterPoints.push(point);
        } else {
          duringPoints.push(point);
        }
      } else {
        duringPoints.push(point);
      }
    });

    // Generate time labels (5 labels)
    const timeStep = timeRange / 4;
    const timeLabels = Array.from({ length: 5 }, (_, i) => {
      const time = minTime + i * timeStep;
      return {
        label: new Date(time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        x: scaleX(time),
      };
    });

    // Gradient stops for during-activity path
    const lowY = scaleY(lowThreshold);
    const highY = scaleY(highThreshold);
    const gradientStops = [
      { offset: "0%", color: COLORS.high },
      { offset: `${((padding.top + chartHeight - highY) / chartHeight) * 100}%`, color: COLORS.high },
      { offset: `${((padding.top + chartHeight - highY) / chartHeight) * 100}%`, color: COLORS.range },
      { offset: `${((padding.top + chartHeight - lowY) / chartHeight) * 100}%`, color: COLORS.range },
      { offset: `${((padding.top + chartHeight - lowY) / chartHeight) * 100}%`, color: COLORS.low },
      { offset: "100%", color: COLORS.low },
    ];

    return {
      sortedData,
      padding,
      width,
      height,
      chartWidth,
      chartHeight,
      minTime,
      maxTime,
      minValue,
      maxValue,
      scaleX,
      scaleY,
      actStart,
      actEnd,
      beforePoints,
      duringPoints,
      afterPoints,
      timeLabels,
      lowY,
      highY,
      gradientStops,
    };
  }, [data, activityStartTime, activityEndTime, lowThreshold, highThreshold]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!chartConfig || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;

      // Check if within chart area
      if (
        x < chartConfig.padding.left ||
        x > chartConfig.width - chartConfig.padding.right
      ) {
        setHoverData(null);
        return;
      }

      // Calculate time at cursor position
      const time =
        chartConfig.minTime +
        ((x - chartConfig.padding.left) / chartConfig.chartWidth) *
          (chartConfig.maxTime - chartConfig.minTime);

      // Interpolate value
      const value = interpolateValueAtTime(chartConfig.sortedData, time);
      const y = chartConfig.scaleY(value);

      setHoverData({
        x,
        y,
        value,
        time: new Date(time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    },
    [chartConfig]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverData(null);
  }, []);

  if (!chartConfig || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-2xl border border-gray-200">
        <p className="text-gray-500">No glucose data available</p>
      </div>
    );
  }

  const {
    padding,
    width,
    height,
    actStart,
    actEnd,
    beforePoints,
    duringPoints,
    afterPoints,
    timeLabels,
    lowY,
    highY,
    scaleX,
    gradientStops,
  } = chartConfig;

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {/* Gradient for during-activity line */}
          <linearGradient
            id="glucoseGradient"
            x1="0"
            y1="1"
            x2="0"
            y2="0"
            gradientUnits="objectBoundingBox"
          >
            {gradientStops.map((stop, i) => (
              <stop key={i} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width={width} height={height} fill="white" rx="16" />

        {/* High threshold line (180 mg/dL) */}
        <line
          x1={padding.left}
          y1={highY}
          x2={width - padding.right}
          y2={highY}
          stroke={COLORS.high}
          strokeWidth={1}
          strokeDasharray="6 4"
          opacity={0.5}
        />
        <text
          x={width - padding.right + 5}
          y={highY + 4}
          className="text-[10px] font-medium"
          fill={COLORS.high}
        >
          {highThreshold}
        </text>

        {/* Low threshold line (70 mg/dL) */}
        <line
          x1={padding.left}
          y1={lowY}
          x2={width - padding.right}
          y2={lowY}
          stroke={COLORS.low}
          strokeWidth={1}
          strokeDasharray="6 4"
          opacity={0.5}
        />
        <text
          x={width - padding.right + 5}
          y={lowY + 4}
          className="text-[10px] font-medium"
          fill={COLORS.low}
        >
          {lowThreshold}
        </text>

        {/* Activity start vertical line */}
        {actStart && (
          <>
            <line
              x1={scaleX(actStart)}
              y1={padding.top}
              x2={scaleX(actStart)}
              y2={height - padding.bottom}
              stroke={COLORS.strava}
              strokeWidth={2}
              strokeDasharray="6 4"
              opacity={0.5}
            />
            <text
              x={scaleX(actStart)}
              y={padding.top - 8}
              textAnchor="middle"
              className="text-[10px] font-bold uppercase"
              fill={COLORS.strava}
            >
              Start
            </text>
          </>
        )}

        {/* Activity end vertical line */}
        {actEnd && (
          <>
            <line
              x1={scaleX(actEnd)}
              y1={padding.top}
              x2={scaleX(actEnd)}
              y2={height - padding.bottom}
              stroke={COLORS.strava}
              strokeWidth={2}
              strokeDasharray="6 4"
              opacity={0.5}
            />
            <text
              x={scaleX(actEnd)}
              y={padding.top - 8}
              textAnchor="middle"
              className="text-[10px] font-bold uppercase"
              fill={COLORS.strava}
            >
              End
            </text>
          </>
        )}

        {/* Activity emoji */}
        {actStart && actEnd && (
          <text
            x={(scaleX(actStart) + scaleX(actEnd)) / 2}
            y={padding.top + 20}
            textAnchor="middle"
            className="text-2xl"
          >
            🏃
          </text>
        )}

        {/* Before activity path (gray) */}
        {beforePoints.length > 1 && (
          <path
            d={createSmoothPath(beforePoints)}
            fill="none"
            stroke={COLORS.inactive}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.6}
          />
        )}

        {/* During activity path (gradient) */}
        {duringPoints.length > 1 && (
          <path
            d={createSmoothPath(duringPoints)}
            fill="none"
            stroke="url(#glucoseGradient)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* After activity path (gray) */}
        {afterPoints.length > 1 && (
          <path
            d={createSmoothPath(afterPoints)}
            fill="none"
            stroke={COLORS.inactive}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.6}
          />
        )}

        {/* Time labels */}
        {timeLabels.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={height - 15}
            textAnchor="middle"
            className="text-xs font-medium"
            fill="#9CA3AF"
          >
            {label.label}
          </text>
        ))}

        {/* Hover cursor */}
        {hoverData && (
          <>
            {/* Vertical line */}
            <line
              x1={hoverData.x}
              y1={padding.top}
              x2={hoverData.x}
              y2={height - padding.bottom}
              stroke="#9CA3AF"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            {/* Cursor circle */}
            <circle
              cx={hoverData.x}
              cy={hoverData.y}
              r={8}
              fill="white"
              stroke={COLORS.strava}
              strokeWidth={3}
            />
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hoverData && (
        <div
          className="absolute pointer-events-none bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg z-10"
          style={{
            left: `${(hoverData.x / width) * 100}%`,
            top: `${(hoverData.y / height) * 100 - 15}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="text-sm font-bold text-center">
            {formatValue(hoverData.value, glucoseUnit)}
          </div>
          <div className="text-[10px] text-gray-400 text-center">
            {glucoseUnit}
          </div>
          <div className="text-[10px] font-medium border-t border-gray-700 mt-1 pt-1 text-center">
            {hoverData.time}
          </div>
        </div>
      )}
    </div>
  );
}
