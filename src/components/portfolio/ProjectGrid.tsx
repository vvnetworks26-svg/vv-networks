import React from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Project } from "./projectData";
import ProjectCard from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  onViewDetails: (project: Project) => void;
}

export default function ProjectGrid({ projects, onViewDetails }: ProjectGridProps) {
  const shouldReduce = useReducedMotion();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: shouldReduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: shouldReduce ? 0.1 : 0.45, delay: shouldReduce ? 0 : index * 0.09 }}
        >
          <ProjectCard project={project} onViewDetails={() => onViewDetails(project)} />
        </motion.div>
      ))}
    </div>
  );
}
