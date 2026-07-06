import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Terminal } from "lucide-react";
import { useLeadFlow } from "./LeadFlowContext";
import { eventBus } from "../../lib/leadflow/eventBus";
import type { LeadFlowEvent } from "../../lib/leadflow/types";

const DeveloperOverlay = memo(function DeveloperOverlay() {
  const { session, config, analyticsSnapshot, isOpen } = useLeadFlow();
  const [visible, setVisible] = useState(false);
  const [events, setEvents] = useState<Array<LeadFlowEvent<unknown>>>([]);

  // Toggle with Ctrl+Shift+D
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Mirror event bus to local state
  useEffect(() => {
    const unsub = eventBus.on("*" as any, (ev) => {
      setEvents((prev) => [ev, ...prev].slice(0, 15));
    });
    return unsub;
  }, []);

  const rows: Array<{ label: string; value: string; color?: string }> = [
    { label: "SDK Version",       value: config.version },
    { label: "Mode",              value: config.mode,          color: config.mode === "production" ? "text-emerald-400" : "text-amber-400" },
    { label: "Business ID",       value: config.businessId },
    { label: "Widget",            value: isOpen ? "Open" : "Closed", color: isOpen ? "text-emerald-400" : "text-brand-slate-400" },
    { label: "Session Phase",     value: session.phase,        color: "text-brand-blue" },
    { label: "Lead Score",        value: `${session.qualification.score}%` },
    { label: "Messages",          value: String(session.messages.length) },
    { label: "Appt Requested",    value: session.appointmentRequested ? "Yes" : "No" },
    { label: "Widget Opens",      value: String(analyticsSnapshot.widgetOpenCount) },
    { label: "Completion Rate",   value: `${analyticsSnapshot.completionRate}%` },
    { label: "Demo Requests",     value: String(analyticsSnapshot.demoRequests) },
    { label: "Booking Requests",  value: String(analyticsSnapshot.bookingRequests) },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-28 left-4 z-[200] w-72 bg-brand-navy/95 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs text-white"
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 360, damping: 28 }}
          role="complementary"
          aria-label="LeadFlow developer overlay"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-brand-violet" aria-hidden="true" />
              <span className="font-bold text-[11px] uppercase tracking-wider text-white/80">LeadFlow DevTools</span>
            </div>
            <button
              onClick={() => setVisible(false)}
              className="text-white/50 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-white rounded"
              aria-label="Close developer overlay"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Runtime info */}
          <div className="px-4 py-3 space-y-1.5 border-b border-white/10">
            {rows.map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-baseline gap-2">
                <span className="text-white/40 text-[10px] truncate">{label}</span>
                <span className={`${color ?? "text-white/80"} text-[10px] font-bold text-right`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Qualification chips */}
          {Object.keys(session.qualification.chips).length > 0 && (
            <div className="px-4 py-2.5 border-b border-white/10 space-y-1.5">
              <span className="text-[10px] text-white/40 uppercase tracking-wider block">Qualification</span>
              <div className="flex flex-wrap gap-1">
                {Object.entries(session.qualification.chips).map(([k, v]) => (
                  <span key={k} className="text-[9px] bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800">
                    {k}: {v as string}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent events */}
          <div className="px-4 py-2.5 space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
            <span className="text-[10px] text-white/40 uppercase tracking-wider block">Recent Events</span>
            {events.length === 0 && (
              <span className="text-[10px] text-white/30 italic">No events yet</span>
            )}
            {events.map((ev, i) => (
              <div key={i} className="flex items-baseline gap-2">
                <span className="text-[9px] text-brand-violet font-bold truncate">{ev.name}</span>
                <span className="text-[9px] text-white/30 ml-auto whitespace-nowrap">
                  {ev.timestamp.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>
            ))}
          </div>

          <div className="px-4 py-2 bg-white/5 border-t border-white/10">
            <span className="text-[9px] text-white/30">Press Ctrl+Shift+D to toggle</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default DeveloperOverlay;
