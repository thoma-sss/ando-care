"use client";

import { useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";

// Types
interface StravaUser {
  athleteId: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  city?: string;
  country?: string;
}

interface CGMConnection {
  provider: "librelink" | "dexcom";
  connected: boolean;
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [0.3, 0.5, 0.3],
};

// Pulsing circles component
function PulsingCircles() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-[#fc5201]/20"
          style={{
            width: `${200 + i * 100}px`,
            height: `${200 + i * 100}px`,
          }}
          animate={pulseAnimation}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Progress bar component (animated blocks)
function ProgressBar({ inRange = 70, low = 10, high = 20 }: { inRange?: number; low?: number; high?: number }) {
  const blocks = 10;
  const lowBlocks = Math.round((low / 100) * blocks);
  const highBlocks = Math.round((high / 100) * blocks);
  const inRangeBlocks = blocks - lowBlocks - highBlocks;

  const allBlocks = [
    ...Array(lowBlocks).fill("🟥"),
    ...Array(inRangeBlocks).fill("🟩"),
    ...Array(highBlocks).fill("🟨"),
  ];

  return (
    <motion.div 
      className="flex gap-0.5"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {allBlocks.map((block, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { scale: 0, opacity: 0 },
            visible: { scale: 1, opacity: 1 },
          }}
          transition={{ delay: i * 0.05 }}
          className="text-lg"
        >
          {block}
        </motion.span>
      ))}
    </motion.div>
  );
}

// Animated glucose chart
function AnimatedGlucoseChart() {
  const chartRef = useRef<SVGSVGElement>(null);
  
  // Generate smooth curve points
  const points = [
    { x: 0, y: 120 },
    { x: 50, y: 95 },
    { x: 100, y: 140 },
    { x: 150, y: 165 },
    { x: 200, y: 180 },
    { x: 250, y: 155 },
    { x: 300, y: 130 },
    { x: 350, y: 145 },
    { x: 400, y: 125 },
    { x: 450, y: 110 },
    { x: 500, y: 135 },
  ];

  const createPath = () => {
    let path = `M ${points[0].x} ${200 - points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx1 = prev.x + (curr.x - prev.x) / 3;
      const cpx2 = curr.x - (curr.x - prev.x) / 3;
      path += ` C ${cpx1} ${200 - prev.y}, ${cpx2} ${200 - curr.y}, ${curr.x} ${200 - curr.y}`;
    }
    return path;
  };

  return (
    <div className="relative w-full h-48 bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl overflow-hidden p-4">
      {/* Activity emoji */}
      <motion.div
        className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🏃
      </motion.div>

      <svg
        ref={chartRef}
        viewBox="0 0 500 200"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffa726" />
            <stop offset="30%" stopColor="#4baf51" />
            <stop offset="70%" stopColor="#4baf51" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4baf51" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4baf51" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Target zone */}
        <rect
          x="0"
          y={200 - 180}
          width="500"
          height={180 - 70}
          fill="rgba(75, 175, 81, 0.1)"
        />

        {/* Threshold lines */}
        <line
          x1="0"
          y1={200 - 180}
          x2="500"
          y2={200 - 180}
          stroke="#ffa726"
          strokeDasharray="4 4"
          strokeOpacity="0.5"
        />
        <line
          x1="0"
          y1={200 - 70}
          x2="500"
          y2={200 - 70}
          stroke="#ef4444"
          strokeDasharray="4 4"
          strokeOpacity="0.5"
        />

        {/* Activity zone highlight */}
        <rect
          x="100"
          y="0"
          width="250"
          height="200"
          fill="rgba(252, 82, 1, 0.1)"
        />
        <line
          x1="100"
          y1="0"
          x2="100"
          y2="200"
          stroke="#fc5201"
          strokeDasharray="4 4"
          strokeOpacity="0.5"
        />
        <line
          x1="350"
          y1="0"
          x2="350"
          y2="200"
          stroke="#fc5201"
          strokeDasharray="4 4"
          strokeOpacity="0.5"
        />

        {/* Curve */}
        <motion.path
          d={createPath()}
          fill="none"
          stroke="url(#chartGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>

      {/* Time labels */}
      <div className="absolute bottom-2 left-4 right-4 flex justify-between text-xs text-gray-400">
        <span>07:00</span>
        <span>08:00</span>
        <span>09:00</span>
        <span>10:00</span>
      </div>
    </div>
  );
}

// Section wrapper with scroll animation
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function StravaSetupPage() {
  const [stravaUser, setStravaUser] = useState<StravaUser | null>(null);
  const [cgmConnection, setCgmConnection] = useState<CGMConnection | null>(null);
  const [selectedCGM, setSelectedCGM] = useState<"librelink" | "dexcom" | null>(null);
  const [loading, setLoading] = useState(true);

  // CGM form states
  const [cgmEmail, setCgmEmail] = useState("");
  const [cgmPassword, setCgmPassword] = useState("");
  const [cgmRegion, setCgmRegion] = useState("FR");
  const [dexcomServer, setDexcomServer] = useState("shareous1.dexcom.com");
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
    trackEvent(AnalyticsEvents.SETUP_PAGE_VIEW);
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch("/api/auth/status", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setStravaUser({
            athleteId: data.user.athleteId,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            profilePicture: data.user.profilePicture,
          });
          if (data.user.cgmProvider) {
            setCgmConnection({
              provider: data.user.cgmProvider,
              connected: true,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error checking status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStravaConnect = () => {
    trackEvent(AnalyticsEvents.STRAVA_CONNECT_CLICK);
    window.location.href = "/api/auth/strava";
  };

  const handleStravaDisconnect = async () => {
    try {
      await fetch("/api/auth/disconnect", { method: "POST", credentials: "include" });
      setStravaUser(null);
      setCgmConnection(null);
      trackEvent(AnalyticsEvents.STRAVA_DISCONNECTED);
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  };

  const handleTestConnection = async () => {
    if (!selectedCGM) return;

    setTestingConnection(true);
    setConnectionStatus(null);

    try {
      const endpoint = selectedCGM === "librelink" ? "/api/librelink/test" : "/api/dexcom/test";
      const body =
        selectedCGM === "librelink"
          ? { email: cgmEmail, password: cgmPassword, region: cgmRegion }
          : { username: cgmEmail, password: cgmPassword, server: dexcomServer };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setConnectionStatus({ success: data.success, message: data.message });

      if (data.success) {
        trackEvent(AnalyticsEvents.CGM_CONNECTED, { provider: selectedCGM });
      } else {
        trackEvent(AnalyticsEvents.CGM_CONNECTION_FAILED, { provider: selectedCGM });
      }
    } catch (error) {
      setConnectionStatus({ success: false, message: "Connection failed. Please try again." });
      trackEvent(AnalyticsEvents.CGM_CONNECTION_FAILED, { provider: selectedCGM });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!selectedCGM || !connectionStatus?.success) return;

    try {
      const endpoint = selectedCGM === "librelink" ? "/api/librelink/credentials" : "/api/dexcom/credentials";
      const body =
        selectedCGM === "librelink"
          ? { email: cgmEmail, password: cgmPassword, region: cgmRegion }
          : { username: cgmEmail, password: cgmPassword, server: dexcomServer };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setCgmConnection({ provider: selectedCGM, connected: true });
        setConnectionStatus({ success: true, message: "Credentials saved successfully!" });
      }
    } catch (error) {
      setConnectionStatus({ success: false, message: "Failed to save credentials." });
    }
  };

  const isFullyConnected = stravaUser && cgmConnection?.connected;

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#FFF8F0" }}>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
        <PulsingCircles />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Creator avatar */}
          <motion.a
            href="https://twitter.com/thomasmarsal"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fc5201] to-[#ffa726] flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            <span className="text-sm font-medium text-gray-700">by @thomasmarsal</span>
          </motion.a>

          {/* Title */}
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Add your{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#fc5201]">CGM data</span>
              <motion.span
                className="absolute inset-0 bg-[#fc5201]/10 -skew-x-3 rounded"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              />
            </span>
            <br />
            to your Strava activities
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Automatically sync your glucose data with every ride, run, or workout.
            See your performance through a new lens.
          </motion.p>

          {/* CTA Button */}
          <motion.a
            href="#setup"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#fc5201] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => trackEvent(AnalyticsEvents.GET_STARTED_CLICK)}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            Get instant access
          </motion.a>
        </div>
      </section>

      {/* Preview Cards Section */}
      <AnimatedSection className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Athlete Card */}
            <motion.div
              className="bg-white rounded-3xl shadow-lg p-6"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                  <Image
                    src="/cyclist.jpg"
                    alt="Athlete"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23e5e7eb' width='64' height='64'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Sarah Johnson</h3>
                  <p className="text-sm text-gray-500">Paris, France</p>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-bold text-gray-900">1,234</span>
                  <span className="text-gray-500 ml-1">followers</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900">567</span>
                  <span className="text-gray-500 ml-1">activities</span>
                </div>
              </div>
            </motion.div>

            {/* CGM Stats Card */}
            <motion.div
              className="bg-gray-900 rounded-3xl shadow-lg p-6 text-white"
              whileHover={{ y: -5 }}
            >
              <ProgressBar inRange={70} low={10} high={20} />
              <div className="mt-4 space-y-2">
                <p className="text-lg font-bold">🎯 70% in Range</p>
                <p className="text-gray-300">
                  🩸 Avg : 142 - Min : 65 - Max : 189 (mg/dL)
                </p>
                <p className="text-[#fc5201] font-medium mt-4">
                  ⚡ Powered by Ando Care ⚡
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Chart Preview Section */}
      <AnimatedSection className="px-4 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
            See your glucose response in real-time
          </h2>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold">Glucose Response</h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  Low
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#4baf51]" />
                  In Range
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#ffa726]" />
                  High
                </span>
              </div>
            </div>
            <AnimatedGlucoseChart />
          </div>
        </div>
      </AnimatedSection>

      {/* Setup Section */}
      <section id="setup" className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
              Get started in 2 steps
            </h2>
            <p className="text-gray-600 text-center mb-12">
              Connect your accounts and start enriching your activities
            </p>
          </AnimatedSection>

          <div className="space-y-8">
            {/* Step 1: Strava */}
            <AnimatedSection>
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#fc5201] text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Connect Strava</h3>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#fc5201] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : stravaUser ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {stravaUser.profilePicture && (
                        <Image
                          src={stravaUser.profilePicture}
                          alt={stravaUser.firstName}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-bold text-gray-900">
                          {stravaUser.firstName} {stravaUser.lastName}
                        </p>
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Connected
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleStravaDisconnect}
                      className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Disconnect
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    onClick={handleStravaConnect}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#fc5201] text-white font-bold rounded-xl hover:bg-[#e04a00] transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                    </svg>
                    Connect with Strava
                  </motion.button>
                )}
              </div>
            </AnimatedSection>

            {/* Step 2: CGM */}
            <AnimatedSection>
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${stravaUser ? "bg-[#fc5201] text-white" : "bg-gray-200 text-gray-400"}`}>
                    2
                  </div>
                  <h3 className={`text-xl font-bold ${stravaUser ? "text-gray-900" : "text-gray-400"}`}>
                    Connect your CGM sensor
                  </h3>
                </div>

                {!stravaUser ? (
                  <p className="text-gray-400 text-center py-4">
                    Connect Strava first to continue
                  </p>
                ) : cgmConnection?.connected ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        cgmConnection.provider === "librelink" ? "bg-[#ffe102]" : "bg-[#4CAF50]"
                      }`}>
                        {cgmConnection.provider === "librelink" ? "🔗" : "📱"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {cgmConnection.provider === "librelink" ? "Freestyle Libre" : "Dexcom"}
                        </p>
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Connected
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* CGM Provider Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <motion.button
                        onClick={() => {
                          setSelectedCGM("librelink");
                          setConnectionStatus(null);
                          trackEvent(AnalyticsEvents.CGM_SENSOR_SELECTED, { provider: "librelink" });
                        }}
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          selectedCGM === "librelink"
                            ? "border-[#ffe102] bg-[#ffe102]/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#ffe102] flex items-center justify-center mb-3 mx-auto">
                          🔗
                        </div>
                        <p className="font-bold text-gray-900">Freestyle Libre</p>
                        <p className="text-xs text-gray-500 mt-1">via LibreLinkUp</p>
                      </motion.button>

                      <motion.button
                        onClick={() => {
                          setSelectedCGM("dexcom");
                          setConnectionStatus(null);
                          trackEvent(AnalyticsEvents.CGM_SENSOR_SELECTED, { provider: "dexcom" });
                        }}
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          selectedCGM === "dexcom"
                            ? "border-[#4CAF50] bg-[#4CAF50]/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#4CAF50] flex items-center justify-center mb-3 mx-auto">
                          📱
                        </div>
                        <p className="font-bold text-gray-900">Dexcom</p>
                        <p className="text-xs text-gray-500 mt-1">via Dexcom Share</p>
                      </motion.button>
                    </div>

                    {/* CGM Form */}
                    {selectedCGM && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {selectedCGM === "librelink" ? "Email" : "Username"}
                          </label>
                          <input
                            type={selectedCGM === "librelink" ? "email" : "text"}
                            value={cgmEmail}
                            onChange={(e) => setCgmEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#fc5201] focus:ring-2 focus:ring-[#fc5201]/20 outline-none transition-all"
                            placeholder={selectedCGM === "librelink" ? "your@email.com" : "username"}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                          </label>
                          <input
                            type="password"
                            value={cgmPassword}
                            onChange={(e) => setCgmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#fc5201] focus:ring-2 focus:ring-[#fc5201]/20 outline-none transition-all"
                            placeholder="••••••••"
                          />
                        </div>

                        {selectedCGM === "librelink" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Region
                            </label>
                            <select
                              value={cgmRegion}
                              onChange={(e) => setCgmRegion(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#fc5201] focus:ring-2 focus:ring-[#fc5201]/20 outline-none transition-all"
                            >
                              <option value="EU">Europe (EU)</option>
                              <option value="EU2">Europe 2 (EU2)</option>
                              <option value="US">United States (US)</option>
                              <option value="FR">France (FR)</option>
                              <option value="DE">Germany (DE)</option>
                              <option value="CA">Canada (CA)</option>
                              <option value="AU">Australia (AU)</option>
                              <option value="JP">Japan (JP)</option>
                            </select>
                          </div>
                        )}

                        {selectedCGM === "dexcom" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Server
                            </label>
                            <select
                              value={dexcomServer}
                              onChange={(e) => setDexcomServer(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#fc5201] focus:ring-2 focus:ring-[#fc5201]/20 outline-none transition-all"
                            >
                              <option value="shareous1.dexcom.com">Outside US (shareous1.dexcom.com)</option>
                              <option value="share2.dexcom.com">United States (share2.dexcom.com)</option>
                            </select>
                          </div>
                        )}

                        {/* Connection Status */}
                        {connectionStatus && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`p-4 rounded-xl ${
                              connectionStatus.success
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {connectionStatus.message}
                          </motion.div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3">
                          <motion.button
                            onClick={handleTestConnection}
                            disabled={!cgmEmail || !cgmPassword || testingConnection}
                            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {testingConnection ? "Testing..." : "Test Connection"}
                          </motion.button>

                          {connectionStatus?.success && (
                            <motion.button
                              onClick={handleSaveCredentials}
                              className="flex-1 px-6 py-3 bg-[#fc5201] text-white font-bold rounded-xl hover:bg-[#e04a00] transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                            >
                              Save & Activate
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </AnimatedSection>

            {/* Success State */}
            {isFullyConnected && (
              <AnimatedSection>
                <motion.div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl shadow-lg p-8 text-white text-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring" }}
                >
                  <motion.div
                    className="text-6xl mb-4"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    🎉
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2">You&apos;re Ready!</h3>
                  <p className="text-white/80 mb-6">
                    Your next Strava activity will automatically include CGM data.
                  </p>
                  <motion.a
                    href="https://www.strava.com/activities/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 font-bold rounded-xl hover:bg-white/90 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                    </svg>
                    Record Your First Activity
                  </motion.a>
                </motion.div>
              </AnimatedSection>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 tracking-tight"
          >
            ando
          </Link>
          <p className="text-gray-500 mt-2">
            Made for athletes with diabetes
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-gray-600">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-600">
              Terms
            </Link>
            <a
              href="mailto:hello@ando.care"
              className="hover:text-gray-600"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
