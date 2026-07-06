import React, { memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { technologyGroups } from "./solutionsData";

const categoryColors: Record<string, { bg: string; text: string; border: string; headBg: string; headText: string }> = {
  Frontend:          { bg: "bg-cyan-50",    text: "text-cyan-800",    border: "border-cyan-200/70",    headBg: "bg-cyan-100",    headText: "text-cyan-900"    },
  Backend:           { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200/70", headBg: "bg-emerald-100", headText: "text-emerald-900" },
  "AI & ML":         { bg: "bg-violet-50",  text: "text-violet-800",  border: "border-violet-200/70",  headBg: "bg-violet-100",  headText: "text-violet-900"  },
  Databases:         { bg: "bg-orange-50",  text: "text-orange-800",  border: "border-orange-200/70",  headBg: "bg-orange-100",  headText: "text-orange-900"  },
  "Cloud & DevOps":  { bg: "bg-sky-50",     text: "text-sky-800",     border: "border-sky-200/70",     headBg: "bg-sky-100",     headText: "text-sky-900"     },
  Integrations:      { bg: "bg-rose-50",    text: "text-rose-800",    border: "border-rose-200/70",    headBg: "bg-rose-100",    headText: "text-rose-900"    },
};

const TechnologyEcosystem = memo(function TechnologyEcosystem() {
  const shouldReduce = useReducedMotion();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {technologyGroups.map((group, groupIdx) => {
        const colors = categoryColors[group.category] ?? categoryColors.Backend;
        return (
          <motion.div
            key={group.category}
            className={`border ${colors.border} rounded-2xl overflow-hidden`}
            initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduce ? 0.1 : 0.4, delay: shouldReduce ? 0 : groupIdx * 0.08 }}
          >
            <div className={`px-5 py-3 ${colors.headBg}`}>
              <h4 className={`text-[11px] font-mono uppercase font-bold tracking-wider ${colors.headText}`}>
                {group.category}
              </h4>
            </div>
            <div className={`p-4 ${colors.bg} flex flex-wrap gap-2`}>
              {group.technologies.map((tech, techIdx) => (
                <motion.span
                  key={tech}
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border bg-white/70 ${colors.text} ${colors.border} backdrop-blur-sm`}
                  initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.88 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: shouldReduce ? 0.1 : 0.3,
                    delay: shouldReduce ? 0 : groupIdx * 0.08 + techIdx * 0.04,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  whileHover={shouldReduce ? {} : { scale: 1.06, y: -1 }}
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
});

export default TechnologyEcosystem;
