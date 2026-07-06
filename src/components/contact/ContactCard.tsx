import React, { memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Mail, Clock, MapPin, Zap, ArrowRight } from "lucide-react";
import type { ContactOption } from "./contactData";

const iconMap: Record<string, React.ElementType> = { Mail, Clock, MapPin, Zap };

interface ContactCardProps {
  option: ContactOption;
  index: number;
  key?: string;
}

const ContactCard = memo(function ContactCard({ option, index }: ContactCardProps) {
  const shouldReduce = useReducedMotion();
  const Icon = iconMap[option.icon] ?? Mail;

  return (
    <motion.div
      className="p-5 bg-white border border-brand-slate-200 rounded-2xl group hover:border-brand-blue/20 transition-colors"
      initial={{ opacity: 0, y: shouldReduce ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: shouldReduce ? 0.1 : 0.38, delay: shouldReduce ? 0 : index * 0.07 }}
      whileHover={shouldReduce ? {} : { y: -4 }}
    >
      <div className="w-9 h-9 rounded-xl bg-brand-blue/5 text-brand-blue flex items-center justify-center mb-3 group-hover:bg-brand-blue group-hover:text-white transition-colors">
        <Icon className="w-4 h-4" aria-hidden="true" />
      </div>
      <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold block mb-1">
        {option.label}
      </span>
      <p className="text-sm font-bold text-brand-navy mb-1.5">{option.value}</p>
      <p className="text-xs text-brand-slate-500 leading-relaxed mb-3">{option.description}</p>
      <a
        href={option.href}
        className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:text-brand-indigo transition-colors group/link focus-visible:outline-2 focus-visible:outline-brand-blue rounded"
        aria-label={`${option.action} — ${option.label}`}
      >
        {option.action}
        <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" aria-hidden="true" />
      </a>
    </motion.div>
  );
});

export default ContactCard;
