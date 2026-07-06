import React, { useState, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import ScrollReveal from "../ScrollReveal";
import FeaturedProject from "./FeaturedProject";
import ProjectGrid from "./ProjectGrid";
import EngineeringPrinciples from "./EngineeringPrinciples";
import CaseStudyPanel from "./CaseStudyPanel";
import { projects } from "./projectData";
import type { Project } from "./projectData";
import { ArrowRight } from "lucide-react";

interface PortfolioSectionProps {
  onBookDemo: () => void;
}

export default function PortfolioSection({ onBookDemo }: PortfolioSectionProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const featuredProject = projects.find((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);

  const handleViewDetails = useCallback((project: Project) => {
    if (project.status === "placeholder") {
      onBookDemo();
    } else {
      setSelectedProject(project);
    }
  }, [onBookDemo]);

  const handleClosePanel = useCallback(() => {
    setSelectedProject(null);
  }, []);

  return (
    <section id="portfolio" className="py-20 sm:py-32 bg-brand-slate-50/40 border-y border-brand-slate-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
        {/* Header */}
        <ScrollReveal>
          <div className="max-w-3xl space-y-4">
            <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
              Portfolio & Case Studies
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-navy">
              Software that businesses<br />
              <span className="text-brand-slate-400">actually use.</span>
            </h2>
            <p className="text-sm text-brand-slate-500 leading-relaxed max-w-lg">
              Every project below solved a real operational bottleneck. Each represents an engineering challenge we eliminated through first-principles problem-solving.
            </p>
          </div>
        </ScrollReveal>

        {/* Featured Project (LeadFlow) */}
        {featuredProject && (
          <ScrollReveal delay={0.12}>
            <FeaturedProject
              project={featuredProject}
              onViewDetails={() => handleViewDetails(featuredProject)}
              onBookDemo={onBookDemo}
            />
          </ScrollReveal>
        )}

        {/* Other Projects Grid */}
        <ScrollReveal delay={0.18}>
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-brand-navy">Additional Projects</h3>
            <ProjectGrid projects={otherProjects} onViewDetails={handleViewDetails} />
          </div>
        </ScrollReveal>

        {/* Engineering Principles */}
        <ScrollReveal delay={0.24}>
          <div className="space-y-8 pt-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                How We Build
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                Engineering principles<br />
                <span className="text-brand-slate-400">that define every project.</span>
              </h3>
              <p className="text-sm text-brand-slate-500 leading-relaxed">
                These are non-negotiable standards we apply to every line of code we ship.
              </p>
            </div>
            <EngineeringPrinciples />
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={0.3}>
          <div className="pt-8 border-t border-brand-slate-200">
            <div className="bg-white border border-brand-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl font-extrabold text-brand-navy tracking-tight">
                  Ready to build your project?
                </h3>
                <p className="text-sm text-brand-slate-500 max-w-lg mx-auto leading-relaxed">
                  Let's discuss your operational bottleneck and scope a software solution built specifically for your workflow.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={onBookDemo}
                  className="px-6 py-3 rounded-xl bg-brand-navy hover:bg-brand-blue text-white text-xs font-bold transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-brand-blue"
                  aria-label="Book a consultation demo"
                >
                  Book Team Consultation
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <a
                  href="#services"
                  className="px-6 py-3 rounded-xl border border-brand-slate-200 hover:border-brand-blue/30 text-brand-slate-700 hover:text-brand-navy text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-brand-blue"
                >
                  Explore Services
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Case Study Modal */}
      <AnimatePresence>
        {selectedProject && <CaseStudyPanel project={selectedProject} onClose={handleClosePanel} />}
      </AnimatePresence>
    </section>
  );
}
