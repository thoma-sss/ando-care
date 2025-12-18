import { WaitlistForm } from "@/components/WaitlistForm";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] bg-gradient-radial">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#FAFAFA] tracking-tight">
            ando
          </Link>
          <Link
            href="/strava"
            className="btn-secondary text-sm px-4 py-2 rounded-lg"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="animate-in text-5xl md:text-7xl font-bold text-[#FAFAFA] leading-tight tracking-tight mb-6">
            Your glucose,
            <br />
            <span className="text-[#FF6B35]">on every ride.</span>
          </h1>
          <p className="animate-in delay-100 text-xl md:text-2xl text-[#A1A1AA] max-w-2xl mx-auto mb-10 leading-relaxed">
            Automatically add CGM data to your Strava activities.
            <br className="hidden md:block" />
            See your performance through a new lens.
          </p>
          <div className="animate-in delay-200 flex justify-center">
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="animate-in text-3xl md:text-4xl font-bold text-[#FAFAFA] text-center mb-4">
            How it works
          </h2>
          <p className="animate-in delay-100 text-[#A1A1AA] text-center mb-12 max-w-xl mx-auto">
            Three simple steps to unlock glucose insights on every activity.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="interactive" className="animate-in delay-200">
              <div className="w-12 h-12 rounded-lg bg-[rgba(255,107,53,0.1)] flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-[#FF6B35]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#FAFAFA] mb-2">
                Connect once
              </h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                Link your Strava account and CGM sensor (Freestyle Libre or
                Dexcom). Takes less than 2 minutes.
              </p>
            </Card>

            <Card variant="interactive" className="animate-in delay-300">
              <div className="w-12 h-12 rounded-lg bg-[rgba(255,107,53,0.1)] flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-[#FF6B35]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#FAFAFA] mb-2">
                Automatic sync
              </h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                Every activity you upload to Strava automatically gets enriched
                with your glucose data.
              </p>
            </Card>

            <Card variant="interactive" className="animate-in delay-400">
              <div className="w-12 h-12 rounded-lg bg-[rgba(255,107,53,0.1)] flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-[#FF6B35]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#FAFAFA] mb-2">
                Deep insights
              </h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                Time in range, trends, patterns. Understand how exercise affects
                your glucose levels.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card variant="glass" padding="lg" className="animate-in">
            <div className="text-center mb-8">
              <span className="inline-block px-3 py-1 bg-[rgba(255,107,53,0.1)] text-[#FF6B35] text-sm font-medium rounded-full mb-4">
                Preview
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#FAFAFA] mb-2">
                Your Strava activities, supercharged
              </h2>
              <p className="text-[#A1A1AA]">
                See what a glucose-enriched activity looks like
              </p>
            </div>

            {/* Mock Activity Card */}
            <div className="bg-[#0A0A0B] rounded-xl p-6 border border-[rgba(255,255,255,0.05)]">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FC4C02] flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div className="flex-1">
                  <h4 className="text-[#FAFAFA] font-semibold">Morning Run</h4>
                  <p className="text-[#71717A] text-sm">Today at 7:32 AM</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <p className="text-[#FAFAFA] font-semibold">5.2 km</p>
                  <p className="text-[#71717A] text-xs">Distance</p>
                </div>
                <div>
                  <p className="text-[#FAFAFA] font-semibold">28:45</p>
                  <p className="text-[#71717A] text-xs">Time</p>
                </div>
                <div>
                  <p className="text-[#FAFAFA] font-semibold">5:32/km</p>
                  <p className="text-[#71717A] text-xs">Pace</p>
                </div>
              </div>

              {/* CGM Stats */}
              <div className="bg-[rgba(255,107,53,0.05)] border border-[rgba(255,107,53,0.1)] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-[#FF6B35]" />
                  <span className="text-[#FF6B35] text-sm font-medium">
                    CGM Data
                  </span>
                </div>
                <p className="font-mono text-sm text-[#FAFAFA] leading-relaxed">
                  <span className="text-[#22C55E]">In-range: 78%</span>
                  {" | "}
                  <span className="text-[#EF4444]">&lt;70: 4%</span>
                  {" | "}
                  <span className="text-[#F59E0B]">&gt;180: 18%</span>
                  <br />
                  Avg: 121 mg/dL | Min: 68 | Max: 192
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Card variant="glass" padding="lg" className="animate-in">
            <h2 className="text-2xl md:text-3xl font-bold text-[#FAFAFA] mb-4">
              Already have access?
            </h2>
            <p className="text-[#A1A1AA] mb-6">
              Connect your Strava account and start enriching your activities
              with glucose data.
            </p>
            <Link
              href="/strava"
              className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#FF8555] transition-all"
            >
              Connect your Strava
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[rgba(255,255,255,0.05)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-[#FAFAFA] font-semibold mb-1">ando</p>
              <p className="text-[#71717A] text-sm">
                Made for athletes with diabetes
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#71717A]">
              <Link href="#" className="hover:text-[#FAFAFA] transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-[#FAFAFA] transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-[#FAFAFA] transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
