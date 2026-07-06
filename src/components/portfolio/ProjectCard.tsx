import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import type { Project } from "./projectData";
import ProjectStatus from "./ProjectStatus";
import TechnologyBadge from "./TechnologyBadge";

interface ProjectCardProps {
  project: Project;
  onViewDetails: () => void;
}

export default function ProjectCard({ project, onViewDetails }: ProjectCardProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.article
      className="bg-white border border-brand-slate-200 rounded-3xl overflow-hidden flex flex-col h-full group"
      whileHover={shouldReduce ? {} : { y: -6, boxShadow: "0 20px 60px -15px rgba(9,13,26,0.15)" }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
    >
      {/* Preview gradient area */}
      <motion.div
        className={`h-48 bg-gradient-to-br ${project.gradient} border-b border-brand-slate-200/60 p-6 flex flex-col justify-between relative overflow-hidden`}
        whileHover={shouldReduce ? {} : { scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <ProjectStatus status={project.status} />
        
        <div>
          <h3 className="text-2xl font-extrabold text-brand-navy tracking-tight group-hover:text-brand-blue transition-colors">
            {project.name}
          </h3>
          <p className="text-xs font-mono text-brand-slate-500 mt-1">{project.category}</p>
        </div>

        {/* Decorative floating element */}
        <motion.div
          className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm"
          animate={shouldReduce ? {} : { scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
      </motion.div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 space-y-5">
        <p className="text-sm text-brand-slate-600 leading-relaxed line-clamp-2">
          {project.tagline}
        </p>

        {/* Features */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold block">
            Features
          </span>
          <div className="space-y-1.5">
            {project.features.slice(0, 3).map((feat) => (
              <div key={feat.label} className="flex items-center gap-2">
                <Check className="w-3 h-3 text-brand-blue flex-shrink-0" aria-hidden="true" />
                <span className="text-xs text-brand-slate-600 font-medium">{feat.label}</span>
              </div>
            ))}
            {project.features.length > 3 && (
              <span className="text-[10px] text-brand-slate-400 italic">
                +{project.features.length - 3} more...
              </span>
            )}
          </div>
        </div>

        {/* Technology stack */}
        <div className="space-y-2 pt-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold block">
            Stack
          </span>
          <div className="flex flex-wrap gap-1.5">
            {project.technology.slice(0, 4).map((tech) => (
              <TechnologyBadge key={tech} name={tech} animate={false} />
            ))}
            {project.technology.length > 4 && (
              <span className="text-[9px] text-brand-slate-400 self-center font-mono">
                +{project.technology.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-4 mt-auto border-t border-brand-slate-100">
          <button
            onClick={onViewDetails}
            className="text-xs font-bold text-brand-blue hover:text-brand-indigo transition-colors flex items-center gap-1 group/cta focus-visible:outline-2 focus-visible:outline-brand-blue rounded"
            aria-label={`View ${project.name} case study`}
          >
            {project.status === "placeholder" ? "Discuss Your Project" : "View Case Study"}
            <ArrowRight className="w-3.5 h-3.5 group-hover/cta:translate-x-0.5 transition-transform" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
