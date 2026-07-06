import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { TrendingUp, DollarSign, Clock, AlertCircle } from "lucide-react";

interface DashboardPreviewProps {
  leadCount: number;
  leadScore: number;
  revenue: string;
  showAppointment: boolean;
}

export default function DashboardPreview({ leadCount, leadScore, revenue, showAppointment }: DashboardPreviewProps) {
  const shouldReduce = useReducedMotion();

  const metrics = [
    { label: "Active Leads", value: leadCount, icon: TrendingUp, color: "text-brand-blue", bg: "bg-brand-blue/5" },
    { label: "Lead Score", value: leadScore, icon: AlertCircle, color: "text-brand-violet", bg: "bg-brand-violet/5" },
    { label: "Est. Revenue", value: revenue, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <motion.div
      className="bg-white border border-brand-slate-200 rounded-2xl p-5 space-y-4"
      initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduce ? 0.15 : 0.45, delay: shouldReduce ? 0 : 0.15 }}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-brand-navy">Business Dashboard</h4>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span className="text-[10px] font-mono text-emerald-600">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              className="p-3 border border-brand-slate-100 rounded-xl bg-brand-slate-50/50"
              initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: shouldReduce ? 0.1 : 0.3, delay: shouldReduce ? 0 : 0.25 + index * 0.1 }}
            >
              <div className={`w-6 h-6 rounded-lg ${metric.bg} ${metric.color} flex items-center justify-center mb-2`}>
                <Icon className="w-3 h-3" aria-hidden="true" />
              </div>
              <motion.div
                className="text-base font-black font-mono text-brand-navy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: shouldReduce ? 0 : 0.35 + index * 0.1 }}
              >
                {metric.value}
              </motion.div>
              <div className="text-[9px] text-brand-slate-400 font-medium mt-0.5">{metric.label}</div>
            </motion.div>
          );
        })}
      </div>

      {showAppointment && (
        <motion.div
          className="pt-3 border-t border-brand-slate-100"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: shouldReduce ? 0.1 : 0.35 }}
        >
          <div className="flex items-center gap-2 text-[10px]">
            <Clock className="w-3 h-3 text-brand-indigo" aria-hidden="true" />
            <span className="font-bold text-brand-navy">Next Appointment:</span>
            <span className="text-brand-slate-500">Today, 2:30 PM</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
