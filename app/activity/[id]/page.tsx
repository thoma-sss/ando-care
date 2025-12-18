import { notFound } from "next/navigation";

// Force dynamic rendering
export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { GlucoseChart } from "@/components/GlucoseChart";
import { calculateGlucoseStats } from "@/lib/cgm-stats";

interface GlucoseReading {
  timestamp: string;
  value: number;
}

interface ActivityPageProps {
  params: Promise<{
    id: string;
  }>;
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
    notFound();
  }

  const readings = activityData.dataPoints as unknown as GlucoseReading[];
  const settings = activityData.user.settings;

  const stats = calculateGlucoseStats(readings, {
    low: settings?.lowThreshold ?? 70,
    high: settings?.highThreshold ?? 180,
  });

  const unit = settings?.unit ?? "mg/dL";

  return (
    <div className="min-h-screen bg-[#0A0A0B] bg-gradient-radial">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold text-[#FAFAFA] tracking-tight"
          >
            ando
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>

          {/* Activity header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#FAFAFA] mb-2">
              Activity #{id}
            </h1>
            <p className="text-[#A1A1AA]">
              {new Date(activityData.startTime).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {" at "}
              {new Date(activityData.startTime).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Stats cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card variant="default" padding="md">
                <p className="text-[#71717A] text-sm mb-1">Average</p>
                <p className="text-2xl font-bold text-[#FAFAFA]">
                  {stats.average}{" "}
                  <span className="text-sm font-normal text-[#A1A1AA]">
                    {unit}
                  </span>
                </p>
              </Card>

              <Card variant="default" padding="md">
                <p className="text-[#71717A] text-sm mb-1">In Range</p>
                <p className="text-2xl font-bold text-[#22C55E]">
                  {stats.timeInRange}%
                </p>
              </Card>

              <Card variant="default" padding="md">
                <p className="text-[#71717A] text-sm mb-1">Min / Max</p>
                <p className="text-2xl font-bold text-[#FAFAFA]">
                  <span className={stats.min < 70 ? "text-[#EF4444]" : ""}>
                    {stats.min}
                  </span>
                  {" / "}
                  <span className={stats.max > 180 ? "text-[#F59E0B]" : ""}>
                    {stats.max}
                  </span>
                </p>
              </Card>

              <Card variant="default" padding="md">
                <p className="text-[#71717A] text-sm mb-1">Readings</p>
                <p className="text-2xl font-bold text-[#FAFAFA]">
                  {stats.count}
                </p>
              </Card>
            </div>
          )}

          {/* Time in range breakdown */}
          {stats && (
            <Card variant="default" padding="lg" className="mb-8">
              <h3 className="text-lg font-semibold text-[#FAFAFA] mb-4">
                Time in Range
              </h3>
              <div className="space-y-4">
                {/* Low */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#A1A1AA]">
                      Below {settings?.lowThreshold ?? 70} {unit}
                    </span>
                    <span className="text-sm font-medium text-[#EF4444]">
                      {stats.timeBelowRange}%
                    </span>
                  </div>
                  <div className="h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#EF4444] rounded-full transition-all"
                      style={{ width: `${stats.timeBelowRange}%` }}
                    />
                  </div>
                </div>

                {/* In range */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#A1A1AA]">
                      {settings?.lowThreshold ?? 70} - {settings?.highThreshold ?? 180}{" "}
                      {unit}
                    </span>
                    <span className="text-sm font-medium text-[#22C55E]">
                      {stats.timeInRange}%
                    </span>
                  </div>
                  <div className="h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#22C55E] rounded-full transition-all"
                      style={{ width: `${stats.timeInRange}%` }}
                    />
                  </div>
                </div>

                {/* High */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#A1A1AA]">
                      Above {settings?.highThreshold ?? 180} {unit}
                    </span>
                    <span className="text-sm font-medium text-[#F59E0B]">
                      {stats.timeAboveRange}%
                    </span>
                  </div>
                  <div className="h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F59E0B] rounded-full transition-all"
                      style={{ width: `${stats.timeAboveRange}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Glucose chart */}
          <Card variant="default" padding="lg">
            <h3 className="text-lg font-semibold text-[#FAFAFA] mb-4">
              Glucose Timeline
            </h3>
            <div className="overflow-x-auto">
              <GlucoseChart
                readings={readings}
                lowThreshold={settings?.lowThreshold ?? 70}
                highThreshold={settings?.highThreshold ?? 180}
                width={700}
                height={300}
              />
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="text-[#A1A1AA]">Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                <span className="text-[#A1A1AA]">In Range</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <span className="text-[#A1A1AA]">High</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

