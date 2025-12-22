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

// Connected Apps Illustration Component
function ConnectedAppsIllustration() {
  const apps = [
    {
      name: "Apple Health",
      color: "#1C1C1E",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
          <defs>
            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF6B81" />
              <stop offset="100%" stopColor="#FF2D55" />
            </linearGradient>
          </defs>
          <path
            fill="url(#heartGradient)"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
      ),
      angle: -90,
    },
    {
      name: "Oura",
      color: "#4A5D73",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
          <circle cx="12" cy="12" r="6" fill="none" stroke="white" strokeWidth="2" />
          <line x1="12" y1="4" x2="12" y2="6" stroke="white" strokeWidth="2" />
        </svg>
      ),
      angle: -30,
    },
    {
      name: "MyFitnessPal",
      color: "#0073E6",
      icon: (
        <svg viewBox="0 0 24 24" className="w-7 h-7">
          <path
            fill="white"
            d="M12 4c-1.5 0-2.5 1-3 2l-1 3-2 1c-1 .5-2 1.5-2 3s1 2.5 2 3l2 1 1 3c.5 1 1.5 2 3 2s2.5-1 3-2l1-3 2-1c1-.5 2-1.5 2-3s-1-2.5-2-3l-2-1-1-3c-.5-1-1.5-2-3-2z"
          />
        </svg>
      ),
      angle: 30,
    },
    {
      name: "Google Fit",
      color: "#1C1C1E",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
          <path fill="#EA4335" d="M12 21.35l-1.45-1.32c-2.55-2.32-4.55-4.32-5.55-5.82-.5-.75-.5-1.5 0-2.25 1-1.5 3-3.5 5.55-5.82L12 4.82" />
          <path fill="#4285F4" d="M12 4.82l1.45 1.32c2.55 2.32 4.55 4.32 5.55 5.82.5.75.5 1.5 0 2.25-1 1.5-3 3.5-5.55 5.82L12 21.35" />
          <path fill="#FBBC05" d="M12 21.35V4.82" />
          <path fill="#34A853" d="M6.45 14.21c-.5-.75-.5-1.5 0-2.25L12 4.82v16.53l-5.55-5.14z" opacity="0.5" />
        </svg>
      ),
      angle: 90,
    },
    {
      name: "Whoop",
      color: "#000000",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
          <circle cx="8" cy="12" r="6" fill="#E31937" />
          <rect x="10" y="8" width="10" height="8" rx="1" fill="#E31937" />
          <line x1="14" y1="10" x2="18" y2="10" stroke="black" strokeWidth="1.5" />
          <line x1="14" y1="12" x2="18" y2="12" stroke="black" strokeWidth="1.5" />
          <line x1="14" y1="14" x2="18" y2="14" stroke="black" strokeWidth="1.5" />
        </svg>
      ),
      angle: 150,
    },
    {
      name: "Strava",
      color: "#1C1C1E",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path fill="#FC4C02" d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
      ),
      angle: -150,
    },
  ];

  const centerX = 200;
  const centerY = 200;
  const radius = 130;

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        {/* Connection rings */}
        <motion.circle
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.15 }}
          viewport={{ once: true }}
          transition={{ duration: 2, delay: 0.3 }}
          cx={centerX}
          cy={centerY}
          r={radius - 30}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
        <motion.circle
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, delay: 0.5 }}
          cx={centerX}
          cy={centerY}
          r={radius + 20}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
        />
      </svg>

      {/* Central CGM hub */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-[#1C1C1E] border border-[rgba(255,255,255,0.1)] flex items-center justify-center z-10 shadow-2xl"
      >
        {/* Freestyle Libre style icon - chevron/arrow */}
        <svg viewBox="0 0 40 40" className="w-12 h-12">
          <path
            fill="white"
            d="M20 8L8 20h8v12h8V20h8L20 8z"
          />
        </svg>
      </motion.div>

      {/* App icons */}
      {apps.map((app, index) => {
        const x = centerX + radius * Math.cos((app.angle * Math.PI) / 180);
        const y = centerY + radius * Math.sin((app.angle * Math.PI) / 180);
        const percentX = (x / 400) * 100;
        const percentY = (y / 400) * 100;

        return (
          <motion.div
            key={app.name}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: 0.6 + index * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute z-20"
            style={{
              left: `${percentX}%`,
              top: `${percentY}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg border border-[rgba(255,255,255,0.1)]"
              style={{ backgroundColor: app.color }}
            >
              {app.icon}
            </motion.div>
          </motion.div>
        );
      })}
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
              Get the most
              <br />
              <span className="text-[#FF6B35]">of your CGM data</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-[#A1A1AA] max-w-2xl mx-auto mb-8 leading-relaxed"
            >
              We&apos;re taking a moment to rebuild something extraordinary.{" "}
              <span className="text-[#FAFAFA] whitespace-nowrap">Coming back early 2026</span> with a
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

      {/* Connected Apps Illustration Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <ConnectedAppsIllustration />
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
