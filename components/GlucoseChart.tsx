"use client";

import { useMemo } from "react";

interface GlucoseReading {
  timestamp: string;
  value: number;
}

interface GlucoseChartProps {
  readings: GlucoseReading[];
  lowThreshold?: number;
  highThreshold?: number;
  width?: number;
  height?: number;
}

export function GlucoseChart({
  readings,
  lowThreshold = 70,
  highThreshold = 180,
  width = 800,
  height = 300,
}: GlucoseChartProps) {
  const { path, area, points, xLabels, yLabels, rangeArea } = useMemo(() => {
    if (readings.length === 0) {
      return {
        path: "",
        area: "",
        points: [],
        xLabels: [],
        yLabels: [],
        rangeArea: "",
      };
    }

    const sortedReadings = [...readings].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Get min/max values with some padding
    const values = sortedReadings.map((r) => r.value);
    const minValue = Math.min(Math.min(...values) - 10, lowThreshold - 10);
    const maxValue = Math.max(Math.max(...values) + 10, highThreshold + 10);

    // Get time range
    const times = sortedReadings.map((r) => new Date(r.timestamp).getTime());
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const timeRange = maxTime - minTime || 1;

    // Scale functions
    const scaleX = (time: number) =>
      padding.left + ((time - minTime) / timeRange) * chartWidth;
    const scaleY = (value: number) =>
      padding.top + ((maxValue - value) / (maxValue - minValue)) * chartHeight;

    // Generate path
    const pathPoints = sortedReadings.map((r) => {
      const x = scaleX(new Date(r.timestamp).getTime());
      const y = scaleY(r.value);
      return { x, y, value: r.value, timestamp: r.timestamp };
    });

    const linePath = pathPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");

    // Generate area under curve
    const areaPath = `${linePath} L ${pathPoints[pathPoints.length - 1].x} ${padding.top + chartHeight} L ${pathPoints[0].x} ${padding.top + chartHeight} Z`;

    // Generate target range area
    const rangeTop = scaleY(highThreshold);
    const rangeBottom = scaleY(lowThreshold);
    const rangeAreaPath = `M ${padding.left} ${rangeTop} L ${padding.left + chartWidth} ${rangeTop} L ${padding.left + chartWidth} ${rangeBottom} L ${padding.left} ${rangeBottom} Z`;

    // Generate Y axis labels
    const yLabelValues = [minValue, lowThreshold, (lowThreshold + highThreshold) / 2, highThreshold, maxValue];
    const yLabelsData = yLabelValues.map((v) => ({
      value: Math.round(v),
      y: scaleY(v),
    }));

    // Generate X axis labels (time)
    const timeStep = timeRange / 4;
    const xLabelsData = Array.from({ length: 5 }, (_, i) => {
      const time = minTime + i * timeStep;
      return {
        label: new Date(time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        x: scaleX(time),
      };
    });

    return {
      path: linePath,
      area: areaPath,
      points: pathPoints,
      xLabels: xLabelsData,
      yLabels: yLabelsData,
      rangeArea: rangeAreaPath,
    };
  }, [readings, lowThreshold, highThreshold, width, height]);

  if (readings.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-[rgba(255,255,255,0.03)] rounded-lg border border-[rgba(255,255,255,0.08)]"
        style={{ width, height }}
      >
        <p className="text-[#71717A]">No glucose data available</p>
      </div>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      className="bg-[rgba(255,255,255,0.03)] rounded-lg border border-[rgba(255,255,255,0.08)]"
    >
      {/* Target range area */}
      <path
        d={rangeArea}
        fill="rgba(34, 197, 94, 0.1)"
        stroke="none"
      />

      {/* Target range lines */}
      <line
        x1={50}
        y1={yLabels.find((l) => l.value === lowThreshold)?.y || 0}
        x2={width - 20}
        y2={yLabels.find((l) => l.value === lowThreshold)?.y || 0}
        stroke="rgba(239, 68, 68, 0.3)"
        strokeDasharray="4 4"
      />
      <line
        x1={50}
        y1={yLabels.find((l) => l.value === highThreshold)?.y || 0}
        x2={width - 20}
        y2={yLabels.find((l) => l.value === highThreshold)?.y || 0}
        stroke="rgba(245, 158, 11, 0.3)"
        strokeDasharray="4 4"
      />

      {/* Area under curve */}
      <path
        d={area}
        fill="url(#glucoseGradient)"
        opacity={0.3}
      />

      {/* Main line */}
      <path
        d={path}
        fill="none"
        stroke="#FF6B35"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {points.map((point, i) => (
        <g key={i}>
          <circle
            cx={point.x}
            cy={point.y}
            r={4}
            fill={
              point.value < lowThreshold
                ? "#EF4444"
                : point.value > highThreshold
                ? "#F59E0B"
                : "#22C55E"
            }
            stroke="#0A0A0B"
            strokeWidth={2}
          />
        </g>
      ))}

      {/* Y axis labels */}
      {yLabels.map((label, i) => (
        <text
          key={i}
          x={45}
          y={label.y + 4}
          textAnchor="end"
          className="fill-[#71717A] text-xs"
        >
          {label.value}
        </text>
      ))}

      {/* X axis labels */}
      {xLabels.map((label, i) => (
        <text
          key={i}
          x={label.x}
          y={height - 10}
          textAnchor="middle"
          className="fill-[#71717A] text-xs"
        >
          {label.label}
        </text>
      ))}

      {/* Gradient definition */}
      <defs>
        <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6B35" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#FF6B35" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

