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

// App icons component with animated connections
function ConnectedAppsIllustration() {
  const apps = [
    { name: "Strava", icon: "S", color: "#FC4C02", angle: -90 },
    { name: "Garmin", icon: "G", color: "#007CC3", angle: -30 },
    { name: "Apple Health", icon: "🍎", color: "#000000", angle: 30 },
    { name: "CGM", icon: "🩸", color: "#FF6B35", angle: 90 },
    { name: "Fitbit", icon: "F", color: "#00B0B9", angle: 150 },
    { name: "Whoop", icon: "W", color: "#000000", angle: -150 },
  ];

  const centerX = 200;
  const centerY = 200;
  const radius = 140;

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        {/* Connection rings */}
        <motion.circle
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
        <motion.circle
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.15 }}
          transition={{ duration: 1.5, delay: 0.7 }}
          cx={centerX}
          cy={centerY}
          r={radius + 30}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />

        {/* Connection lines */}
        {apps.map((app, index) => {
          const x = centerX + radius * Math.cos((app.angle * Math.PI) / 180);
          const y = centerY + radius * Math.sin((app.angle * Math.PI) / 180);

          return (
            <motion.line
              key={`line-${app.name}`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 0.8, delay: 1 + index * 0.1 }}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="rgba(255,107,53,0.3)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          );
        })}
      </svg>

      {/* Central hub */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[rgba(255,107,53,0.1)] border-2 border-[#FF6B35] flex items-center justify-center z-10"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="text-2xl font-bold text-[#FF6B35]"
        >
          A
        </motion.div>
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
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
            className="absolute z-20"
            style={{
              left: `${percentX}%`,
              top: `${percentY}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.div
              whileHover={{ scale: 1.15 }}
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white/10"
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
      <section className="pt-32 pb-20 px-6 min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="text-center md:text-left"
            >
              {/* Pause Badge */}
              <motion.div variants={fadeInUp} className="mb-8 flex justify-center md:justify-start">
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
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#FAFAFA] leading-tight tracking-tight mb-6"
              >
                Get the most
                <br />
                <span className="text-[#FF6B35]">of your CGM data</span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                variants={fadeInUp}
                className="text-xl md:text-2xl text-[#A1A1AA] max-w-2xl mb-8 leading-relaxed"
              >
                We&apos;re taking a moment to rebuild something extraordinary.
                <br className="hidden md:block" />
                <span className="text-[#FAFAFA] whitespace-nowrap">
                  Coming back early 2026
                </span>{" "}
                with a fresh design and powerful new features.
              </motion.p>

              {/* Waitlist CTA */}
              <motion.div variants={fadeInUp} className="mb-12">
                <p className="text-[#A1A1AA] text-sm mb-4">
                  Be the first to know when we&apos;re back
                </p>
                <WaitlistForm />
              </motion.div>

              {/* Teasing Features */}
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-3 gap-4 max-w-md"
              >
                <motion.div
                  variants={scaleIn}
                  className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl p-4 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,107,53,0.1)] flex items-center justify-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-[#FF6B35]"
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
                  <h3 className="text-sm font-semibold text-[#FAFAFA] mb-1">
                    New Design
                  </h3>
                </motion.div>

                <motion.div
                  variants={scaleIn}
                  className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl p-4 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,107,53,0.1)] flex items-center justify-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-[#FF6B35]"
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
                  <h3 className="text-sm font-semibold text-[#FAFAFA] mb-1">
                    More Features
                  </h3>
                </motion.div>

                <motion.div
                  variants={scaleIn}
                  className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl p-4 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,107,53,0.1)] flex items-center justify-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-[#FF6B35]"
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
                  <h3 className="text-sm font-semibold text-[#FAFAFA] mb-1">
                    Better Performance
                  </h3>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right: Connected Apps Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12 md:mt-0"
            >
              <ConnectedAppsIllustration />
            </motion.div>
          </div>
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
