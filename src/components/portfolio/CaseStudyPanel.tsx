import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, Layers, AlertCircle, Lightbulb, TrendingUp } from "lucide-react";
import type { Project } from "./projectData";
import TechnologyBadge from "./TechnologyBadge";
import ProjectStatus from "./ProjectStatus";

interface CaseStudyPanelProps {
  project: Project;
  onClose: () => void;
}

export default function CaseStudyPanel({ project, onClose }: CaseStudyPanelProps) {
  const shouldReduce = useReducedMotion();

  const sections = [
    { id: "overview",  icon: Layers,       label: "Overview",       content: project.caseStudy.overview },
    { id: "challenge", icon: AlertCircle,  label: "The Challenge",  content: project.caseStudy.challenge },
    { id: "approach",  icon: Lightbulb,    label: "Our Approach",   content: project.caseStudy.approach },
    { id: "value",     icon: TrendingUp,   label: "Business Value", content: project.caseStudy.businessValue },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-brand-navy/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <motion.div
        className="relative z-10 bg-white w-full sm:max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        initial={{ y: shouldReduce ? 0 : 40, opacity: 0, scale: shouldReduce ? 1 : 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: shouldReduce ? 0 : 30, opacity: 0, scale: shouldReduce ? 1 : 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Case study: ${project.name}`}
      >
        {/* Header */}
        <div className={`p-6 bg-gradient-to-br ${project.gradient} border-b border-brand-slate-200/60 flex-shrink-0`}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <ProjectStatus status={project.status} />
              <h3 className="text-xl font-extrabold text-brand-navy tracking-tight">{project.name}</h3>
              <p className="text-xs font-mono text-brand-slate-500">{project.category}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-brand-slate-200/50 transition-colors text-brand-slate-500 hover:text-brand-navy focus-visible:outline-2 focus-visible:outline-brand-blue flex-shrink-0"
              aria-label="Close case study"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {project.metric && (
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-brand-navy">{project.metric}</span>
              <span className="text-xs font-semibold text-brand-slate-500">{project.metricLabel}</span>
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {sections.map((sec, i) => {
            const Icon = sec.icon;
            return (
              <motion.div
                key={sec.id}
                className="space-y-2"
                initial={{ opacity: 0, y: shouldReduce ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduce ? 0.1 : 0.35, delay: shouldReduce ? 0 : 0.1 + i * 0.07 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-brand-blue/8 text-brand-blue flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider font-mono">{sec.label}</h4>
                </div>
                <p className="text-sm text-brand-slate-600 leading-relaxed pl-8">{sec.content}</p>
              </motion.div>
            );
          })}

          {/* Technology */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: shouldReduce ? 0 : 0.45 }}
          >
            <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider font-mono">Technology Stack</h4>
            <div className="flex flex-wrap gap-2">
              {project.technology.map((tech, i) => (
                <TechnologyBadge key={tech} name={tech} index={i} />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
