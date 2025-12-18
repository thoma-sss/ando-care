import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { GlucoseChart } from "@/components/GlucoseChart";
import { calculateGlucoseStats } from "@/lib/cgm-stats";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface GlucoseReading {
  timestamp: string;
  value: number;
}

interface ActivityPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { id } = await params;
  const activityId = BigInt(id);

  // Fetch activity CGM data
  const activityData = await prisma.activityCgmData.findFirst({
    where: { activityId },
    include: {
      user: {
        include: {
          settings: true,
        },
      },
    },
  });

  if (!activityData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#FFF8F0" }}>
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-xl font-bold text-gray-900">Activity Not Found</h1>
          <p className="text-gray-600">This activity hasn&apos;t been processed yet or doesn&apos;t exist.</p>
          <Link 
            href="/"
            className="inline-block mt-4 text-[#fc5201] hover:underline font-medium"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const readings = activityData.dataPoints as unknown as GlucoseReading[];
  const settings = activityData.user.settings;

  const stats = calculateGlucoseStats(readings, {
    low: settings?.lowThreshold ?? 70,
    high: settings?.highThreshold ?? 180,
  });

  const unit = (settings?.unit ?? "mg/dL") as "mg/dL" | "mmol/L";
  
  // Calculate activity duration
  const durationSeconds = Math.round(
    (new Date(activityData.endTime).getTime() - new Date(activityData.startTime).getTime()) / 1000
  );
  const durationLabel = formatDuration(durationSeconds);

  // Format start time
  const startDate = new Date(activityData.startTime);
  const startLabel = startDate.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }) + " at " + startDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate window times for chart (3h before, 1h after)
  const windowStartTime = new Date(activityData.startTime.getTime() - 3 * 60 * 60 * 1000).toISOString();
  const windowEndTime = new Date(activityData.endTime.getTime() + 1 * 60 * 60 * 1000).toISOString();

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#FFF8F0" }}>
      <div className="mx-auto max-w-5xl px-4 py-8 lg:py-12 flex flex-col gap-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            {/* Badge + Date */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[#fc5201]/10 px-2.5 py-0.5 text-xs font-bold text-[#fc5201] uppercase tracking-wide">
                Activity
              </span>
              <span className="text-sm text-gray-500 font-medium">{startLabel}</span>
            </div>
            {/* Activity Name */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
              Activity #{id}
            </h1>
          </div>

          {/* Key Metrics Card */}
          {stats && (
            <div className="flex items-center gap-8 md:gap-12 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              {/* In Range */}
              <div className="flex flex-col items-center md:items-end">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#4baf51] tracking-tighter">
                    {Math.round(stats.timeInRange)}
                  </span>
                  <span className="text-lg font-bold text-[#4baf51]">%</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  In Range
                </div>
              </div>

              <div className="w-px h-10 bg-gray-100"></div>

              {/* Duration */}
              <div className="flex flex-col items-center md:items-end">
                <div className="text-3xl font-black text-[#1A1A1A] tracking-tighter">
                  {durationLabel}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Duration
                </div>
              </div>

              <div className="w-px h-10 bg-gray-100"></div>

              {/* Readings */}
              <div className="flex flex-col items-center md:items-end">
                <div className="text-3xl font-black text-[#1A1A1A] tracking-tighter">
                  {stats.count}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Readings
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Main Chart Card */}
        <section className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Glucose Response</h2>
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>
                <span className="text-gray-600">Low</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#4baf51]"></div>
                <span className="text-gray-600">In Range</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#ffa726]"></div>
                <span className="text-gray-600">High</span>
              </div>
            </div>
          </div>

          <div className="w-full">
            <GlucoseChart
              data={readings}
              activityStartTime={activityData.startTime.toISOString()}
              activityEndTime={activityData.endTime.toISOString()}
              windowStartTime={windowStartTime}
              windowEndTime={windowEndTime}
              glucoseUnit={unit}
              lowThreshold={settings?.lowThreshold ?? 70}
              highThreshold={settings?.highThreshold ?? 180}
            />
          </div>
        </section>

        {/* Stats Cards */}
        {stats && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Average */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Average
              </div>
              <div className="text-2xl font-black text-[#1A1A1A] tracking-tighter">
                {stats.average} <span className="text-sm font-medium text-gray-400">{unit}</span>
              </div>
            </div>

            {/* Min */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Minimum
              </div>
              <div className={`text-2xl font-black tracking-tighter ${stats.min < 70 ? "text-[#ef4444]" : "text-[#1A1A1A]"}`}>
                {stats.min} <span className="text-sm font-medium text-gray-400">{unit}</span>
              </div>
            </div>

            {/* Max */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Maximum
              </div>
              <div className={`text-2xl font-black tracking-tighter ${stats.max > 180 ? "text-[#ffa726]" : "text-[#1A1A1A]"}`}>
                {stats.max} <span className="text-sm font-medium text-gray-400">{unit}</span>
              </div>
            </div>

            {/* CV */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Variability
              </div>
              <div className="text-2xl font-black text-[#1A1A1A] tracking-tighter">
                {stats.coefficientOfVariation}%
              </div>
            </div>
          </section>
        )}

        {/* Time in Range Breakdown */}
        {stats && (
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Time in Range</h2>
            <div className="space-y-4">
              {/* Low */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Below {settings?.lowThreshold ?? 70} {unit}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#ef4444]">
                    {stats.timeBelowRange}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ef4444] rounded-full transition-all"
                    style={{ width: `${stats.timeBelowRange}%` }}
                  />
                </div>
              </div>

              {/* In Range */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#4baf51]"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {settings?.lowThreshold ?? 70} - {settings?.highThreshold ?? 180} {unit}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#4baf51]">
                    {stats.timeInRange}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4baf51] rounded-full transition-all"
                    style={{ width: `${stats.timeInRange}%` }}
                  />
                </div>
              </div>

              {/* High */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ffa726]"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Above {settings?.highThreshold ?? 180} {unit}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#ffa726]">
                    {stats.timeAboveRange}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ffa726] rounded-full transition-all"
                    style={{ width: `${stats.timeAboveRange}%` }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center py-4">
          <Link
            href="https://ando.care"
            className="text-sm font-medium text-gray-400 hover:text-[#fc5201] transition-colors"
          >
            Powered by Ando Care
          </Link>
        </footer>
      </div>
    </div>
  );
}
