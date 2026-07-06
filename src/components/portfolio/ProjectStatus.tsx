import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Rocket, Wrench, Clock, Package } from "lucide-react";
import type { ProjectStatus as StatusType } from "./projectData";

interface ProjectStatusProps {
  status: StatusType;
  className?: string;
}

export default function ProjectStatus({ status, className = "" }: ProjectStatusProps) {
  const shouldReduce = useReducedMotion();

  const statusConfig: Record<
    StatusType,
    { label: string; icon: React.ElementType; bg: string; text: string; border: string }
  > = {
    live: {
      label: "Live in Production",
      icon: Rocket,
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    "in-development": {
      label: "Active Development",
      icon: Wrench,
      bg: "bg-brand-blue/5",
      text: "text-brand-blue",
      border: "border-brand-blue/20",
    },
    "coming-soon": {
      label: "Coming Soon",
      icon: Clock,
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    placeholder: {
      label: "Your Project Here",
      icon: Package,
      bg: "bg-brand-slate-100",
      text: "text-brand-slate-600",
      border: "border-brand-slate-200",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${config.bg} ${config.text} ${config.border} ${className}`}
      initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: shouldReduce ? 0.1 : 0.25, delay: shouldReduce ? 0 : 0.1 }}
    >
      <Icon className="w-3 h-3" aria-hidden="true" />
      <span className="text-[10px] font-bold uppercase tracking-wide">{config.label}</span>
    </motion.div>
  );
}
