import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Calendar, MapPin, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";
import type { AppointmentData } from "./types";

interface AppointmentCardProps {
  data: AppointmentData;
}

export default function AppointmentCard({ data }: AppointmentCardProps) {
  const shouldReduce = useReducedMotion();

  const priorityConfig = {
    high: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", icon: AlertCircle },
    medium: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: AlertCircle },
    low: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: CheckCircle2 },
  };

  const config = priorityConfig[data.priority];
  const Icon = config.icon;

  return (
    <motion.div
      className="bg-white border-2 border-brand-blue rounded-2xl p-5 space-y-4 shadow-lg shadow-brand-blue/10"
      initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.9, y: shouldReduce ? 0 : 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <motion.div
            className="flex items-center gap-2 mb-1"
            initial={{ opacity: 0, x: shouldReduce ? 0 : -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: shouldReduce ? 0 : 0.15 }}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
            <h4 className="text-sm font-bold text-brand-navy">Appointment Confirmed</h4>
          </motion.div>
          <motion.p
            className="text-xs text-brand-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: shouldReduce ? 0 : 0.25 }}
          >
            Customer: <strong className="text-brand-navy">{data.customerName}</strong>
          </motion.p>
        </div>
        <motion.div
          className={`px-2.5 py-1 rounded-full border ${config.bg} ${config.border} flex items-center gap-1`}
          initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: shouldReduce ? 0 : 0.2, type: "spring", stiffness: 400 }}
        >
          <Icon className={`w-3 h-3 ${config.text}`} aria-hidden="true" />
          <span className={`text-[10px] font-bold uppercase ${config.text}`}>{data.priority}</span>
        </motion.div>
      </div>

      <motion.div
        className="space-y-2.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: shouldReduce ? 0 : 0.3 }}
      >
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-4 h-4 text-brand-blue" aria-hidden="true" />
          <span className="font-semibold text-brand-navy">{data.date}</span>
          <span className="text-brand-slate-400">at</span>
          <span className="font-bold text-brand-indigo">{data.time}</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <MapPin className="w-4 h-4 text-brand-violet" aria-hidden="true" />
          <span className="text-brand-slate-600">{data.location}</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <DollarSign className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          <span className="text-brand-slate-500">Estimated value:</span>
          <span className="font-bold text-emerald-700">{data.estimatedValue}</span>
        </div>
      </motion.div>

      <motion.div
        className="pt-3 border-t border-brand-slate-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: shouldReduce ? 0 : 0.45 }}
      >
        <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl px-3 py-2">
          <p className="text-[10px] text-brand-slate-600 leading-relaxed">
            <span className="font-bold text-brand-navy">Service:</span> {data.service}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
