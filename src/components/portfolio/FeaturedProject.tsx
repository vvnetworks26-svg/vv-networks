import React, { memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Sparkles, Bot, Calendar, BarChart3, Layers, Globe } from "lucide-react";
import type { Project } from "./projectData";
import ProjectStatus from "./ProjectStatus";
import TechnologyBadge from "./TechnologyBadge";

interface FeaturedProjectProps {
  project: Project;
  onViewDetails: () => void;
  onBookDemo: () => void;
}

const FeaturedProject = memo(function FeaturedProject({ project, onViewDetails, onBookDemo }: FeaturedProjectProps) {
  const shouldReduce = useReducedMotion();

  const featureIcons = [Sparkles, Bot, Calendar, BarChart3, Layers, Globe];

  return (
    <motion.article
      className="relative bg-white border border-brand-slate-200 rounded-3xl overflow-hidden shadow-xl"
      initial={{ opacity: 0, y: shouldReduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: shouldReduce ? 0.15 : 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Story */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <ProjectStatus status={project.status} />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-slate-400 bg-brand-slate-100 px-2.5 py-1 rounded-md">
                Flagship Product
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-navy leading-tight">
                {project.name}
              </h3>
              <p className="text-sm text-brand-slate-500 leading-relaxed max-w-lg">
                {project.tagline}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold block">
                  The Problem
                </span>
                <p className="text-xs text-brand-slate-600 leading-relaxed">{project.challenge}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold block">
                  Our Solution
                </span>
                <p className="text-xs text-brand-slate-600 leading-relaxed">{project.solution}</p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {/* Technology */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold block">
                Engineering Stack
              </span>
              <div className="flex flex-wrap gap-2">
                {project.technology.map((tech, i) => (
                  <TechnologyBadge key={tech} name={tech} index={i} />
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <motion.button
                onClick={onBookDemo}
                className="relative overflow-hidden px-5 py-3 rounded-xl bg-brand-navy text-white text-xs font-bold flex items-center gap-1.5 hover:bg-brand-blue transition-colors focus-visible:outline-2 focus-visible:outline-brand-blue"
                whileHover={shouldReduce ? {} : { y: -2 }}
                whileTap={shouldReduce ? {} : { scale: 0.97 }}
                aria-label="Book a LeadFlow demo"
              >
                Book a Live Demo
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </motion.button>
              <button
                onClick={onViewDetails}
                className="px-5 py-3 rounded-xl border border-brand-slate-200 hover:border-brand-blue/30 text-brand-slate-700 hover:text-brand-navy text-xs font-bold transition-all flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-brand-blue"
                aria-label="Read the full LeadFlow case study"
              >
                Full Case Study
                <ArrowRight className="w-3.5 h-3.5 text-brand-slate-400" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Product preview */}
        <div className={`lg:col-span-5 bg-gradient-to-br ${project.gradient} border-t lg:border-t-0 lg:border-l border-brand-slate-200/60 p-8 sm:p-10 flex flex-col justify-between`}>
          {project.metric && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduce ? 0.1 : 0.45, delay: shouldReduce ? 0 : 0.2 }}
            >
              <span className="text-5xl font-black font-mono text-brand-navy tracking-tight block">
                {project.metric}
              </span>
              <span className="text-xs font-semibold text-brand-slate-500 mt-1 block">{project.metricLabel}</span>
            </motion.div>
          )}

          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-500 font-bold block">
              Platform Capabilities
            </span>
            <div className="space-y-2.5">
              {project.features.map((feat, i) => {
                const Icon = featureIcons[i % featureIcons.length];
                return (
                  <motion.div
                    key={feat.label}
                    className="flex items-center gap-3 bg-white/60 backdrop-blur-sm border border-white/80 rounded-xl px-4 py-2.5"
                    initial={{ opacity: 0, x: shouldReduce ? 0 : 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: shouldReduce ? 0.1 : 0.35, delay: shouldReduce ? 0 : 0.2 + i * 0.07 }}
                  >
                    <Icon className="w-3.5 h-3.5 text-brand-blue flex-shrink-0" aria-hidden="true" />
                    <span className="text-xs font-semibold text-brand-navy">{feat.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
});

export default FeaturedProject;
