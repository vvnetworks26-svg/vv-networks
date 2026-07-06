import React, { useState } from "react";
import { X, Calendar, Clock, Sparkles, Check, ArrowRight, Loader } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../lib/apiClient";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingModal({ isOpen, onClose, onSuccess }: BookingModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setLoading(true);
    try {
      await api.createBooking({ name, email, company, date, time, notes });
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setName("");
        setEmail("");
        setCompany("");
        setDate("");
        setTime("");
        setNotes("");
        setSubmitted(false);
      }, 2200);
    } catch {
      alert("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const dates = [
    { label: "Tomorrow", val: "2026-07-06" },
    { label: "Tuesday, July 7", val: "2026-07-07" },
    { label: "Wednesday, July 8", val: "2026-07-08" },
    { label: "Thursday, July 9", val: "2026-07-09" },
    { label: "Friday, July 10", val: "2026-07-10" },
  ];

  const times = ["9:00 AM", "11:00 AM", "1:30 PM", "3:00 PM", "4:30 PM"];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-navy"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white border border-brand-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="px-6 py-5 bg-brand-slate-50 border-b border-brand-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-indigo" />
                <h3 className="font-extrabold text-base tracking-tight text-brand-navy">
                  Book a Founding Team Demo
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-brand-slate-400 hover:text-brand-navy hover:bg-brand-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content / Form */}
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm mb-4">
                    <Check className="w-8 h-8 animate-bounce" />
                  </div>
                  <h4 className="text-xl font-bold tracking-tight text-brand-navy">
                    Demo Request Confirmed!
                  </h4>
                  <p className="text-sm text-brand-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
                    We've registered your booking for <strong>{date || "selected slot"}</strong> at <strong>{time || "selected time"}</strong>.
                  </p>
                  <p className="text-xs text-brand-indigo font-semibold mt-4 bg-brand-indigo/5 px-2.5 py-1 rounded-full">
                    Demo simulated live in LeadFlow Dashboard!
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <p className="text-xs text-brand-slate-500 leading-relaxed">
                    Schedule a 15-minute introductory screen-share with the VV Networks founders. We'll explore how custom software and LeadFlow AI can resolve operations bottlenecks and drive immediate lead conversion.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-brand-slate-500 block mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Sarah Jenkins"
                        className="w-full text-xs border border-brand-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-brand-slate-500 block mb-1.5">
                        Business Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sarah@peakgrowth.co"
                        className="w-full text-xs border border-brand-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-brand-slate-500 block mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Peak Growth Services"
                      className="w-full text-xs border border-brand-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
                    />
                  </div>

                  {/* Dates Picker */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-brand-slate-500 block mb-1.5">
                      Select Date *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {dates.map((d) => (
                        <button
                          key={d.val}
                          type="button"
                          onClick={() => setDate(d.val)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            date === d.val
                              ? "bg-brand-navy border-brand-navy text-white shadow-sm"
                              : "border-brand-slate-200 text-brand-slate-600 hover:bg-brand-slate-50"
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Times Picker */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-brand-slate-500 block mb-1.5">
                      Select Slot *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {times.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTime(t)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            time === t
                              ? "bg-brand-blue border-brand-blue text-white shadow-sm"
                              : "border-brand-slate-200 text-brand-slate-600 hover:bg-brand-slate-50"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-brand-slate-500 block mb-1.5">
                      Tell us about your operational bottlenecks
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. We schedule 40 custom estimates weekly by hand. Looking to automate."
                      className="w-full text-xs border border-brand-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={loading || !name || !email || !date || !time}
                      className="w-full py-2.5 px-4 bg-gradient-to-tr from-brand-blue to-brand-indigo hover:from-brand-indigo hover:to-brand-violet text-white font-semibold text-xs rounded-xl shadow-lg shadow-brand-blue/15 hover:shadow-brand-blue/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Scheduling Slot...
                        </>
                      ) : (
                        <>
                          Confirm Demo Reservation
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
