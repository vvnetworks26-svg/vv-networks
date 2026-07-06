import React, { useState, memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, Minus, CircleDot } from "lucide-react";
import { matrixRows } from "./pricingData";

const columnHeaders = ["LeadFlow", "Growth Website", "Custom Software", "Tech Partner"];
const columnKeys: Array<"leadflow" | "growthWeb" | "customSoft" | "techPartner"> = [
  "leadflow", "growthWeb", "customSoft", "techPartner",
];
const categories = ["Process", "Support", "Capabilities"];

function MatrixCell({ value }: { value: boolean | "partial" }) {
  if (value === true) {
    return (
      <div className="flex justify-center" aria-label="Included">
        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
        </div>
      </div>
    );
  }
  if (value === "partial") {
    return (
      <div className="flex justify-center" aria-label="Partially included">
        <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center">
          <CircleDot className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-center" aria-label="Not included">
      <Minus className="w-4 h-4 text-brand-slate-300" aria-hidden="true" />
    </div>
  );
}

const ComparisonMatrix = memo(function ComparisonMatrix() {
  const shouldReduce = useReducedMotion();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <motion.div
      className="bg-white border border-brand-slate-200 rounded-2xl overflow-hidden shadow-sm"
      initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: shouldReduce ? 0.1 : 0.45 }}
    >
      <div className="overflow-x-auto">
        <table
          className="w-full min-w-[640px]"
          role="table"
          aria-label="Engagement model feature comparison"
        >
          <thead>
            <tr className="border-b border-brand-slate-200 bg-brand-slate-50/50">
              <th
                scope="col"
                className="text-left px-6 py-4 text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold w-[36%]"
              >
                Feature / Deliverable
              </th>
              {columnHeaders.map((col, i) => (
                <th
                  key={col}
                  scope="col"
                  className={`px-4 py-4 text-center text-xs font-bold w-[16%] ${
                    i === 2 ? "text-brand-indigo" : "text-brand-navy"
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => {
              const rows = matrixRows.filter((r) => r.category === category);
              return (
                <React.Fragment key={category}>
                  <tr className="bg-brand-slate-50/70 border-t border-brand-slate-100">
                    <td colSpan={5} className="px-6 py-2.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-brand-slate-400">
                        {category}
                      </span>
                    </td>
                  </tr>
                  {rows.map((row, rowIdx) => {
                    const globalIdx = matrixRows.indexOf(row);
                    const isHovered = hoveredRow === globalIdx;
                    return (
                      <motion.tr
                        key={row.label}
                        className={`border-t border-brand-slate-100/80 transition-colors ${
                          isHovered ? "bg-brand-blue/3" : "hover:bg-brand-slate-50/60"
                        }`}
                        onHoverStart={() => setHoveredRow(globalIdx)}
                        onHoverEnd={() => setHoveredRow(null)}
                        initial={{ opacity: 0, x: shouldReduce ? 0 : -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: shouldReduce ? 0.1 : 0.28,
                          delay: shouldReduce ? 0 : rowIdx * 0.035,
                        }}
                      >
                        <td className="px-6 py-3.5">
                          <span className="text-xs font-medium text-brand-slate-700">{row.label}</span>
                        </td>
                        {columnKeys.map((key) => (
                          <td key={key} className="px-4 py-3.5 text-center">
                            <MatrixCell value={row[key] as boolean | "partial"} />
                          </td>
                        ))}
                      </motion.tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 bg-brand-slate-50 border-t border-brand-slate-200 flex flex-wrap gap-5">
        {[
          { node: <Check className="w-3 h-3 text-emerald-600" />, bg: "bg-emerald-50", label: "Included" },
          { node: <CircleDot className="w-3 h-3 text-amber-500" />, bg: "bg-amber-50", label: "Partial" },
          { node: <Minus className="w-3.5 h-3.5 text-brand-slate-300" />, bg: "bg-white", label: "Not included" },
        ].map(({ node, bg, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-5 h-5 rounded-full ${bg} flex items-center justify-center border border-brand-slate-200`}
              aria-hidden="true"
            >
              {node}
            </div>
            <span className="text-[10px] text-brand-slate-500 font-mono">{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
});

export default ComparisonMatrix;
