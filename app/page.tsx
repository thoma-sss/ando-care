"use client";

import { WaitlistForm } from "@/components/WaitlistForm";
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

// Sensor pulse animation centered on a CGM sensor
function SensorPulse() {
  return (
    <div className="relative mx-auto mb-10 h-40 w-40 md:h-52 md:w-52">
      {/* Soft glow background */}
      <div className="absolute inset-0 rounded-full bg-[#020617]" />
      {/* Outer slow pulse (filled ring) */}
      <motion.div
        className="absolute inset-[-35%] rounded-full bg-white/5 blur-3xl"
        animate={{ scale: [1, 1.25, 1.35], opacity: [0.45, 0.25, 0] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeOut",
        }}
      />
      <motion.div
        className="absolute inset-[-18%] rounded-full bg-white/8 blur-2xl"
        animate={{ scale: [1, 1.18, 1.25], opacity: [0.6, 0.32, 0] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeOut",
          delay: 1.5,
        }}
      />
      {/* Sensor disc */}
      <div className="absolute inset-5 rounded-full bg-[#111827] border border-white/20 shadow-[0_0_60px_rgba(15,23,42,1)] overflow-hidden">
        <div className="absolute inset-[14%] rounded-full bg-gradient-to-br from-slate-700 via-slate-900 to-black" />
        <div className="absolute inset-[42%] rounded-full bg-slate-500/40" />
        {/* Small center dot */}
        <div className="absolute inset-[47%] rounded-full bg-slate-200/80" />
      </div>
    </div>
  );
}

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
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center w-full">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Pause Badge */}
            <motion.div variants={fadeInUp} className="mb-8">
              <motion.span
                className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(255,107,53,0.1)] border border-[rgba(255,107,53,0.2)] text-[#FF6B35] text-sm font-medium rounded-full"
                animate={{ y: [0, -3, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                }}
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-[#FF6B35]"
                />
                Service Paused
              </motion.span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold text-[#FAFAFA] leading-tight tracking-tight mb-6"
            >
              Get the most
              <br />
              <span className="text-[#FF6B35]">of your CGM data</span>
            </motion.h1>

            {/* Sensor pulse animation */}
            <motion.div variants={fadeInUp} className="flex justify-center">
              <SensorPulse />
            </motion.div>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-[#A1A1AA] max-w-2xl mx-auto mb-8 leading-relaxed"
            >
              We&apos;re taking a moment to rebuild something extraordinary.{" "}
              <span className="text-[#FF6B35] whitespace-nowrap">Coming back early 2026</span> with a
              fresh design and powerful new features.
            </motion.p>

            {/* Waitlist CTA */}
            <motion.div variants={fadeInUp} className="max-w-md mx-auto">
              <p className="text-[#A1A1AA] text-sm mb-4">
                Be the first to know when we&apos;re back
              </p>
              <WaitlistForm />
            </motion.div>
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
              <p className="text-[#FAFAFA] font-semibold">ando</p>
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
