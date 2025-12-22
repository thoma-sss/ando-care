"use client";

import { WaitlistForm } from "@/components/WaitlistForm";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] bg-gradient-radial">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl font-bold text-[#FAFAFA] tracking-tight"
          >
            ando
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 min-h-screen flex items-center">
        <div className="max-w-4xl mx-auto text-center w-full">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Pause Badge */}
            <motion.div variants={fadeInUp} className="mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(255,107,53,0.1)] border border-[rgba(255,107,53,0.2)] text-[#FF6B35] text-sm font-medium rounded-full">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-[#FF6B35]"
                />
                Service Paused
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold text-[#FAFAFA] leading-tight tracking-tight mb-6"
            >
              Your glucose,
              <br />
              <span className="text-[#FF6B35]">on every ride.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-[#A1A1AA] max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              We&apos;re taking a moment to rebuild something extraordinary.
              <br className="hidden md:block" />
              <span className="text-[#FAFAFA]">Coming back early 2026</span> with a
              fresh design and powerful new features.
            </motion.p>

            {/* Teasing Features */}
            <motion.div
              variants={fadeInUp}
              className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto"
            >
              <motion.div
                variants={scaleIn}
                className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl p-6 backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-lg bg-[rgba(255,107,53,0.1)] flex items-center justify-center mb-4 mx-auto">
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
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#FAFAFA] mb-2">
                  New Design
                </h3>
                <p className="text-[#A1A1AA] text-sm">
                  A completely reimagined interface built for clarity and speed.
                </p>
              </motion.div>

              <motion.div
                variants={scaleIn}
                className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl p-6 backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-lg bg-[rgba(255,107,53,0.1)] flex items-center justify-center mb-4 mx-auto">
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
                  More Features
                </h3>
                <p className="text-[#A1A1AA] text-sm">
                  Advanced analytics, trends, and insights to help you perform
                  better.
                </p>
              </motion.div>

              <motion.div
                variants={scaleIn}
                className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl p-6 backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-lg bg-[rgba(255,107,53,0.1)] flex items-center justify-center mb-4 mx-auto">
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
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#FAFAFA] mb-2">
                  Better Performance
                </h3>
                <p className="text-[#A1A1AA] text-sm">
                  Faster sync, more reliable connections, and smoother
                  experience.
                </p>
              </motion.div>
            </motion.div>

            {/* Waitlist CTA */}
            <motion.div variants={fadeInUp} className="max-w-md mx-auto">
              <div className="mb-4">
                <p className="text-[#A1A1AA] text-sm mb-2">
                  Be the first to know when we&apos;re back
                </p>
              </div>
              <WaitlistForm />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card variant="glass" padding="lg">
              <div className="text-center mb-8">
                <span className="inline-block px-3 py-1 bg-[rgba(255,107,53,0.1)] text-[#FF6B35] text-sm font-medium rounded-full mb-4">
                  Preview
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-[#FAFAFA] mb-2">
                  What to expect
                </h2>
                <p className="text-[#A1A1AA]">
                  A glimpse of what&apos;s coming in early 2026
                </p>
              </div>

              {/* Mock Activity Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-[#0A0A0B] rounded-xl p-6 border border-[rgba(255,255,255,0.05)]"
              >
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
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-[rgba(255,107,53,0.05)] border border-[rgba(255,107,53,0.1)] rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-[#FF6B35]"
                    />
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
                    Avg: 6.7 mmol/L | Min: 3.8 | Max: 10.7
                  </p>
                </motion.div>
              </motion.div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-12 px-6 border-t border-[rgba(255,255,255,0.05)]"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-[#FAFAFA] font-semibold mb-1">ando</p>
              <p className="text-[#71717A] text-sm">
                Made for athletes with diabetes
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#71717A]">
              <a href="#" className="hover:text-[#FAFAFA] transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-[#FAFAFA] transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-[#FAFAFA] transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
