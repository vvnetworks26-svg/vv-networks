import React, { useState, useCallback, memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ArrowRight, Loader, CheckCircle, Bot, Globe, Code, Zap, Layers,
  RotateCcw,
} from "lucide-react";
import type { ContactFormData, ProjectType, BudgetRange, Timeline } from "./contactData";
import {
  projectTypeOptions, budgetOptions, timelineOptions,
} from "./contactData";
import { validateField, validateForm, type FormErrors } from "./validation";

const projectIcons: Record<string, React.ElementType> = {
  Bot, Globe, Code, Zap, Layers,
};

const EMPTY_FORM: ContactFormData = {
  name: "", company: "", email: "", phone: "", industry: "",
  website: "", projectType: "", budget: "", timeline: "",
  message: "", preferredContact: "email", wantsLeadFlowDemo: false,
};

/** Mocked submit — resolves after 1200ms. Replace with real API in Phase D. */
async function mockSubmit(_data: ContactFormData): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1200));
}

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  touched?: boolean;
  children: React.ReactNode;
}

function FormField({ id, label, error, touched, children }: FormFieldProps) {
  const showError = touched && error;
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-[10px] font-mono uppercase tracking-wider font-bold text-brand-slate-500 block"
      >
        {label}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {showError && (
          <motion.p
            id={`${id}-error`}
            className="text-[10px] text-rose-600 font-medium"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputClass = (error?: string, touched?: boolean) =>
  `w-full text-xs border rounded-xl px-3 py-2.5 outline-none transition-all bg-white ${
    touched && error
      ? "border-rose-300 focus:border-rose-400 focus:ring-1 focus:ring-rose-300"
      : "border-brand-slate-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
  }`;

const BookingForm = memo(function BookingForm() {
  const shouldReduce = useReducedMotion();
  const [form, setForm] = useState<ContactFormData>(EMPTY_FORM);
  const [touched, setTouched] = useState<Partial<Record<keyof ContactFormData, boolean>>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = useCallback(<K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      const err = validateField(key, value);
      setErrors((e) => {
        const updated = { ...e };
        if (err) updated[key] = err;
        else delete updated[key];
        return updated;
      });
      return next;
    });
  }, []);

  const touch = useCallback((key: keyof ContactFormData) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const err = validateField(key, form[key]);
    setErrors((e) => {
      const updated = { ...e };
      if (err) updated[key] = err;
      else delete updated[key];
      return updated;
    });
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Touch all required fields
    const allTouched: Partial<Record<keyof ContactFormData, boolean>> = {
      name: true, email: true, phone: true, projectType: true, message: true,
    };
    setTouched(allTouched);
    const allErrors = validateForm(form);
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) return;

    setLoading(true);
    await mockSubmit(form);
    setLoading(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setTouched({});
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center text-center py-16 space-y-5"
        initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <motion.div
          className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center"
          animate={shouldReduce ? {} : { scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CheckCircle className="w-8 h-8 text-emerald-500" aria-hidden="true" />
        </motion.div>
        <h4 className="text-xl font-extrabold text-brand-navy tracking-tight">Thank you!</h4>
        <p className="text-sm text-brand-slate-500 leading-relaxed max-w-xs">
          We've received your enquiry. Our team will review your project and reach out within one business day.
        </p>
        <p className="text-xs text-brand-indigo font-semibold bg-brand-indigo/5 px-3 py-1.5 rounded-full">
          Expect a response within 24 hours
        </p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-bold text-brand-slate-600 hover:text-brand-navy transition-colors focus-visible:outline-2 focus-visible:outline-brand-blue rounded"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Submit another enquiry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate aria-label="Strategy session booking form">

      {/* Row 1: Name + Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField id="name" label="Full Name *" error={errors.name?.message} touched={touched.name}>
          <input
            id="name" type="text" required autoComplete="name"
            value={form.name} placeholder="Sarah Jenkins"
            className={inputClass(errors.name?.message, touched.name)}
            onChange={(e) => set("name", e.target.value)}
            onBlur={() => touch("name")}
            aria-invalid={!!(touched.name && errors.name)}
            aria-describedby={touched.name && errors.name ? "name-error" : undefined}
          />
        </FormField>
        <FormField id="company" label="Company">
          <input
            id="company" type="text" autoComplete="organization"
            value={form.company} placeholder="Peak Growth Services"
            className={inputClass()}
            onChange={(e) => set("company", e.target.value)}
          />
        </FormField>
      </div>

      {/* Row 2: Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField id="email" label="Business Email *" error={errors.email?.message} touched={touched.email}>
          <input
            id="email" type="email" required autoComplete="email"
            value={form.email} placeholder="sarah@peakgrowth.co"
            className={inputClass(errors.email?.message, touched.email)}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => touch("email")}
            aria-invalid={!!(touched.email && errors.email)}
            aria-describedby={touched.email && errors.email ? "email-error" : undefined}
          />
        </FormField>
        <FormField id="phone" label="Phone" error={errors.phone?.message} touched={touched.phone}>
          <input
            id="phone" type="tel" autoComplete="tel"
            value={form.phone} placeholder="+1 602 555 0147"
            className={inputClass(errors.phone?.message, touched.phone)}
            onChange={(e) => set("phone", e.target.value)}
            onBlur={() => touch("phone")}
            aria-invalid={!!(touched.phone && errors.phone)}
            aria-describedby={touched.phone && errors.phone ? "phone-error" : undefined}
          />
        </FormField>
      </div>

      {/* Row 3: Industry + Website */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField id="industry" label="Industry">
          <input
            id="industry" type="text" autoComplete="off"
            value={form.industry} placeholder="HVAC, Legal, Real Estate…"
            className={inputClass()}
            onChange={(e) => set("industry", e.target.value)}
          />
        </FormField>
        <FormField id="website" label="Current Website">
          <input
            id="website" type="url" autoComplete="url"
            value={form.website} placeholder="https://yoursite.com"
            className={inputClass()}
            onChange={(e) => set("website", e.target.value)}
          />
        </FormField>
      </div>

      {/* Project type */}
      <FormField id="projectType" label="Project Type *" error={errors.projectType?.message} touched={touched.projectType}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-labelledby="projectType-label">
          {projectTypeOptions.map((opt) => {
            const Icon = projectIcons[opt.icon] ?? Layers;
            const selected = form.projectType === opt.value;
            return (
              <motion.button
                key={opt.value}
                type="button"
                onClick={() => { set("projectType", opt.value as ProjectType); touch("projectType"); }}
                className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left transition-all focus-visible:outline-2 focus-visible:outline-brand-blue ${
                  selected
                    ? "bg-brand-navy border-brand-navy text-white"
                    : "bg-white border-brand-slate-200 hover:border-brand-slate-300 text-brand-slate-700"
                }`}
                whileHover={shouldReduce ? {} : { y: -2 }}
                whileTap={shouldReduce ? {} : { scale: 0.97 }}
                aria-pressed={selected}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span className="text-[11px] font-bold leading-tight">{opt.label}</span>
              </motion.button>
            );
          })}
        </div>
      </FormField>

      {/* Budget chips */}
      <FormField id="budget" label="Budget Range">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Budget range options">
          {budgetOptions.map((opt) => {
            const selected = form.budget === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => set("budget", opt.value as BudgetRange)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all focus-visible:outline-2 focus-visible:outline-brand-blue ${
                  selected
                    ? "bg-brand-blue border-brand-blue text-white"
                    : "border-brand-slate-200 text-brand-slate-600 hover:border-brand-blue/30"
                }`}
                aria-pressed={selected}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </FormField>

      {/* Timeline chips */}
      <FormField id="timeline" label="Timeline">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Project timeline options">
          {timelineOptions.map((opt) => {
            const selected = form.timeline === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => set("timeline", opt.value as Timeline)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all focus-visible:outline-2 focus-visible:outline-brand-blue ${
                  selected
                    ? "bg-brand-indigo border-brand-indigo text-white"
                    : "border-brand-slate-200 text-brand-slate-600 hover:border-brand-indigo/30"
                }`}
                aria-pressed={selected}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </FormField>

      {/* Message */}
      <FormField id="message" label="Tell us about your project *" error={errors.message?.message} touched={touched.message}>
        <div className="relative">
          <textarea
            id="message" rows={4} required maxLength={1000}
            value={form.message}
            placeholder="Describe the operational challenge or opportunity you'd like to discuss…"
            className={`${inputClass(errors.message?.message, touched.message)} resize-none`}
            onChange={(e) => set("message", e.target.value)}
            onBlur={() => touch("message")}
            aria-invalid={!!(touched.message && errors.message)}
            aria-describedby={
              [
                touched.message && errors.message ? "message-error" : "",
                "message-count",
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
          />
          <span
            id="message-count"
            className={`absolute bottom-2 right-3 text-[10px] font-mono ${
              form.message.length > 900 ? "text-amber-500" : "text-brand-slate-400"
            }`}
            aria-live="polite"
          >
            {form.message.length}/1000
          </span>
        </div>
      </FormField>

      {/* Preferred contact method */}
      <FormField id="preferredContact" label="Preferred Contact Method">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Preferred contact method">
          {(["email", "phone", "whatsapp"] as const).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => set("preferredContact", method)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize focus-visible:outline-2 focus-visible:outline-brand-blue ${
                form.preferredContact === method
                  ? "bg-brand-navy border-brand-navy text-white"
                  : "border-brand-slate-200 text-brand-slate-600 hover:border-brand-slate-300"
              }`}
              aria-pressed={form.preferredContact === method}
            >
              {method === "whatsapp" ? "WhatsApp" : method.charAt(0).toUpperCase() + method.slice(1)}
            </button>
          ))}
        </div>
      </FormField>

      {/* LeadFlow demo checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            className="sr-only"
            checked={form.wantsLeadFlowDemo}
            onChange={(e) => set("wantsLeadFlowDemo", e.target.checked)}
            id="wantsLeadFlowDemo"
            aria-label="Request a live LeadFlow demonstration"
          />
          <div
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
              form.wantsLeadFlowDemo ? "bg-brand-blue border-brand-blue" : "border-brand-slate-300 group-hover:border-brand-blue/50"
            }`}
            aria-hidden="true"
          >
            {form.wantsLeadFlowDemo && <CheckCircle className="w-2.5 h-2.5 text-white" />}
          </div>
        </div>
        <span className="text-xs text-brand-slate-600 leading-relaxed">
          I'd like a live <strong className="text-brand-navy">LeadFlow demonstration</strong> during the strategy session.
        </span>
      </label>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-4 bg-brand-navy hover:bg-brand-blue text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-brand-blue disabled:opacity-60 disabled:cursor-not-allowed"
        whileHover={loading || shouldReduce ? {} : { y: -1 }}
        whileTap={loading || shouldReduce ? {} : { scale: 0.98 }}
        aria-label="Submit strategy session booking"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" aria-hidden="true" />
            Sending your enquiry…
          </>
        ) : (
          <>
            Book My Strategy Session
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </>
        )}
      </motion.button>

      <p className="text-center text-[10px] text-brand-slate-400">
        No obligation. No spam. We respond within one business day.
      </p>
    </form>
  );
});

export default BookingForm;
