import React, { memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  UserCheck, MessageCircle, FileText, Shield,
  Rocket, Headphones, Clock, HeartHandshake,
} from "lucide-react";
import type { IncludedItem } from "./pricingData";

const iconMap: Record<string, React.ElementType> = {
  UserCheck, MessageCircle, FileText, Shield,
  Rocket, Headphones, Clock, HeartHandshake,
};

interface IncludedCardProps {
  item: IncludedItem;
  index: number;
  key?: string;
}

const IncludedCard = memo(function IncludedCard({ item, index }: IncludedCardProps) {
  const shouldReduce = useReducedMotion();
  const Icon = iconMap[item.icon] ?? Rocket;

  return (
    <motion.div
      className="p-5 bg-white border border-brand-slate-200 rounded-2xl group hover:border-brand-blue/20 transition-colors"
      initial={{ opacity: 0, y: shouldReduce ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: shouldReduce ? 0.1 : 0.4, delay: shouldReduce ? 0 : index * 0.06 }}
      whileHover={shouldReduce ? {} : { y: -3 }}
    >
      <div className="w-9 h-9 rounded-xl bg-brand-blue/5 text-brand-blue flex items-center justify-center mb-3 group-hover:bg-brand-blue group-hover:text-white transition-colors">
        <Icon className="w-4 h-4" aria-hidden="true" />
      </div>
      <h4 className="text-xs font-bold text-brand-navy mb-1.5">{item.title}</h4>
      <p className="text-xs text-brand-slate-500 leading-relaxed">{item.description}</p>
    </motion.div>
  );
});

export default IncludedCard;
