import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import ConversationBubble from "./ConversationBubble";
import TypingIndicator from "./TypingIndicator";
import QualificationPanel from "./QualificationPanel";
import DashboardPreview from "./DashboardPreview";
import AppointmentCard from "./AppointmentCard";
import NotificationToast from "./NotificationToast";
import OutcomeMetrics from "./OutcomeMetrics";
import DemoController from "./DemoController";
import TimelineProgress from "./TimelineProgress";
import { conversationScript, qualificationChips, appointmentData } from "./demoScript";

const TYPING_DURATION = 800;

export default function LeadFlowExperience() {
  const shouldReduce = useReducedMotion();

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const maxTime = conversationScript[conversationScript.length - 1].timestamp + 2000;

  // Derived state
  const visibleMessages = useMemo(
    () => conversationScript.filter((msg) => currentTime >= msg.timestamp),
    [currentTime]
  );

  const leadScore = useMemo(() => {
    const qualifiedCount = qualificationChips.filter((chip) => currentTime >= chip.order).length;
    return Math.round((qualifiedCount / qualificationChips.length) * 100);
  }, [currentTime]);

  const leadCount = useMemo(() => {
    return Math.min(Math.floor(currentTime / 2000) + 1, 8);
  }, [currentTime]);

  const revenue = useMemo(() => {
    const base = Math.min(Math.floor(currentTime / 1500) * 120, 650);
    return `$${base}`;
  }, [currentTime]);

  const showAppointment = currentTime >= 12000;
  const showNotification = currentTime >= 14100 && currentTime < 16500;
  const showOutcomes = currentTime >= 16200;

  // Timeline step calculation
  const currentStep = useMemo(() => {
    if (currentTime < 2400) return 0;
    if (currentTime < 6600) return 1;
    if (currentTime < 10200) return 2;
    if (currentTime < 14100) return 3;
    if (currentTime < 16200) return 4;
    return 5;
  }, [currentTime]);

  const stepLabels = ["Visitor Arrives", "Conversation", "Qualification", "Booking", "Notification", "Complete"];

  // Check for typing indicators
  useEffect(() => {
    const nextMessage = conversationScript.find((msg) => msg.timestamp > currentTime);
    if (nextMessage && nextMessage.role === "leadflow") {
      const timeUntilNext = nextMessage.timestamp - currentTime;
      if (timeUntilNext <= TYPING_DURATION && timeUntilNext > 0) {
        setShowTyping(true);
      } else {
        setShowTyping(false);
      }
    } else {
      setShowTyping(false);
    }
  }, [currentTime]);

  // Playback loop
  useEffect(() => {
    if (isPlaying && currentTime < maxTime) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 100;
          if (next >= maxTime) {
            setIsPlaying(false);
            setIsComplete(true);
            return maxTime;
          }
          return next;
        });
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentTime, maxTime]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages.length, showTyping]);

  const handlePlay = () => {
    if (isComplete) {
      handleRestart();
    }
    setIsPlaying(true);
  };

  const handlePause = () => setIsPlaying(false);

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    setShowTyping(false);
    setIsComplete(false);
  };

  const handleSkip = () => {
    setCurrentTime(maxTime);
    setIsPlaying(false);
    setIsComplete(true);
  };

  const progress = Math.min((currentTime / maxTime) * 100, 100);

  return (
    <div className="w-full space-y-8">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-brand-slate-200">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-brand-navy">Interactive Demo</h3>
          <p className="text-xs text-brand-slate-500">
            Watch LeadFlow convert a website visitor into a booked appointment — in under 20 seconds.
          </p>
        </div>
        <DemoController
          isPlaying={isPlaying}
          isComplete={isComplete}
          onPlay={handlePlay}
          onPause={handlePause}
          onRestart={handleRestart}
          onSkip={handleSkip}
        />
      </div>

      {/* Timeline */}
      <TimelineProgress progress={progress} totalSteps={stepLabels.length} currentStep={currentStep} stepLabels={stepLabels} />

      {/* Main experience grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Chat conversation */}
        <div className="lg:col-span-7 bg-white border border-brand-slate-200 rounded-2xl p-5 flex flex-col" style={{ minHeight: "500px", maxHeight: "600px" }}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="text-xs font-bold text-brand-navy">LeadFlow Conversation</span>
            </div>
            <span className="text-[10px] font-mono text-brand-slate-400">{Math.floor(currentTime / 1000)}s</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar" role="log" aria-live="polite" aria-atomic="false">
            {visibleMessages.map((msg) => (
              <ConversationBubble key={msg.id} role={msg.role} content={msg.content} />
            ))}

            <AnimatePresence>
              {showTyping && <TypingIndicator />}
            </AnimatePresence>

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Right: Qualification & Dashboard */}
        <div className="lg:col-span-5 space-y-4">
          <QualificationPanel chips={qualificationChips} currentTime={currentTime} />
          <DashboardPreview
            leadCount={leadCount}
            leadScore={leadScore}
            revenue={revenue}
            showAppointment={showAppointment}
          />
        </div>
      </div>

      {/* Appointment card */}
      <AnimatePresence>
        {showAppointment && (
          <motion.div
            initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: shouldReduce ? 1 : 0.95 }}
            transition={{ duration: shouldReduce ? 0.1 : 0.35 }}
          >
            <AppointmentCard data={appointmentData} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification toast (appears in top right) */}
      <AnimatePresence>
        {showNotification && (
          <div className="fixed top-24 right-6 z-50">
            <NotificationToast
              customerName={appointmentData.customerName}
              time={`${appointmentData.date}, ${appointmentData.time}`}
              location={appointmentData.location}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Outcomes section */}
      <AnimatePresence>
        {showOutcomes && (
          <motion.div
            className="pt-8 border-t border-brand-slate-200 space-y-6"
            initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduce ? 0.1 : 0.45 }}
          >
            <div className="text-center space-y-2">
              <motion.h4
                className="text-2xl font-extrabold text-brand-navy"
                initial={{ opacity: 0, y: shouldReduce ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: shouldReduce ? 0 : 0.15 }}
              >
                Measurable business impact.
              </motion.h4>
              <motion.p
                className="text-sm text-brand-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: shouldReduce ? 0 : 0.25 }}
              >
                Real outcomes from businesses that deployed LeadFlow.
              </motion.p>
            </div>
            <OutcomeMetrics />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
