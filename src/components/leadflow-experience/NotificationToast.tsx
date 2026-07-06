import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Bell, Calendar, MapPin, User } from "lucide-react";

interface NotificationToastProps {
  customerName: string;
  time: string;
  location: string;
}

export default function NotificationToast({ customerName, time, location }: NotificationToastProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className="bg-white border border-brand-slate-200 rounded-2xl shadow-2xl overflow-hidden max-w-xs"
      initial={{ opacity: 0, y: shouldReduce ? 0 : -20, scale: shouldReduce ? 1 : 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: shouldReduce ? 0 : -10, scale: shouldReduce ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
    >
      <div className="bg-brand-blue px-4 py-2 flex items-center gap-2">
        <motion.div
          animate={shouldReduce ? {} : { rotate: [0, -15, 15, -10, 10, 0] }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Bell className="w-4 h-4 text-white" aria-hidden="true" />
        </motion.div>
        <span className="text-xs font-bold text-white">New Appointment</span>
      </div>

      <div className="p-4 space-y-3">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: shouldReduce ? 0 : -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: shouldReduce ? 0 : 0.15 }}
        >
          <User className="w-4 h-4 text-brand-slate-400" aria-hidden="true" />
          <span className="text-sm font-bold text-brand-navy">{customerName}</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-2 text-xs text-brand-slate-600"
          initial={{ opacity: 0, x: shouldReduce ? 0 : -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: shouldReduce ? 0 : 0.25 }}
        >
          <Calendar className="w-3.5 h-3.5 text-brand-indigo" aria-hidden="true" />
          <span>{time}</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-2 text-xs text-brand-slate-600"
          initial={{ opacity: 0, x: shouldReduce ? 0 : -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: shouldReduce ? 0 : 0.35 }}
        >
          <MapPin className="w-3.5 h-3.5 text-brand-violet" aria-hidden="true" />
          <span>{location}</span>
        </motion.div>

        <motion.button
          className="w-full bg-brand-navy hover:bg-brand-slate-800 text-white text-xs font-bold py-2 rounded-lg transition-colors mt-2"
          initial={{ opacity: 0, y: shouldReduce ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: shouldReduce ? 0 : 0.45 }}
          whileHover={shouldReduce ? {} : { scale: 1.02 }}
          whileTap={shouldReduce ? {} : { scale: 0.98 }}
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
}
