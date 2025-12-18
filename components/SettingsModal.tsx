"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlucoseUnit } from "@/lib/glucose-units";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: Settings) => void;
  initialSettings?: Settings;
}

interface Settings {
  glucoseUnit: GlucoseUnit;
  targetLow: number;
  targetHigh: number;
  enableAutoUpdate: boolean;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onSave,
  initialSettings,
}: SettingsModalProps) {
  const [glucoseUnit, setGlucoseUnit] = useState<GlucoseUnit>(
    initialSettings?.glucoseUnit || "mg/dL"
  );
  const [enableAutoUpdate, setEnableAutoUpdate] = useState(
    initialSettings?.enableAutoUpdate ?? true
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setGlucoseUnit(initialSettings.glucoseUnit);
      setEnableAutoUpdate(initialSettings.enableAutoUpdate);
    }
  }, [initialSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          glucoseUnit,
          enableAutoUpdate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = await response.json();
      onSave(data.settings);
      onClose();
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Settings</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Glucose Unit */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Glucose Unit
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGlucoseUnit("mg/dL")}
                    className={`px-4 py-3 rounded-xl border-2 transition-all ${
                      glucoseUnit === "mg/dL"
                        ? "border-[#fc5201] bg-[#fc5201]/5 text-[#fc5201]"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <div className="font-semibold">mg/dL</div>
                    <div className="text-xs text-gray-500 mt-1">US, Japan</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGlucoseUnit("mmol/L")}
                    className={`px-4 py-3 rounded-xl border-2 transition-all ${
                      glucoseUnit === "mmol/L"
                        ? "border-[#fc5201] bg-[#fc5201]/5 text-[#fc5201]"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <div className="font-semibold">mmol/L</div>
                    <div className="text-xs text-gray-500 mt-1">UK, EU, AU, CA</div>
                  </button>
                </div>
              </div>

              {/* Auto Update */}
              <div className="mb-6">
                <label className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      Auto-update activities
                    </div>
                    <div className="text-sm text-gray-500">
                      Automatically add CGM data to new Strava activities
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnableAutoUpdate(!enableAutoUpdate)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      enableAutoUpdate ? "bg-[#fc5201]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        enableAutoUpdate ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Note:</span> Changing your glucose
                  unit will update how values are displayed in activity
                  descriptions and the detail pages.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#fc5201] text-white font-medium hover:bg-[#e04a00] transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

