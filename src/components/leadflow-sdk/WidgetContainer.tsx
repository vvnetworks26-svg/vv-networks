import React, { useRef, useEffect, useState, memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, Send, Bot, User, Sparkles } from "lucide-react";
import { useLeadFlow } from "./LeadFlowContext";
import type { Message } from "../../lib/leadflow/types";

interface MessageBubbleProps {
  msg: Message;
  key?: string;
}

function MessageBubble({ msg }: MessageBubbleProps) {
  const shouldReduce = useReducedMotion();
  const isUser = msg.role === "user";
  return (
    <motion.div
      className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      initial={{ opacity: 0, y: shouldReduce ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduce ? 0.1 : 0.28 }}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-brand-slate-200 text-brand-slate-600" : "bg-brand-blue/10 text-brand-blue"
        }`}
        aria-hidden="true"
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>
      <div
        className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
          isUser
            ? "bg-brand-navy text-white rounded-tr-sm"
            : "bg-brand-slate-100 text-brand-navy rounded-tl-sm"
        }`}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  const shouldReduce = useReducedMotion();
  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center flex-shrink-0" aria-hidden="true">
        <Bot className="w-3.5 h-3.5" />
      </div>
      <div className="bg-brand-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-brand-slate-400 rounded-full"
            animate={shouldReduce ? {} : { y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            aria-hidden="true"
          />
        ))}
        <span className="sr-only">LeadFlow is typing…</span>
      </div>
    </div>
  );
}

// Qualification chips strip inside widget
function QualificationStrip() {
  const { session } = useLeadFlow();
  const chips = Object.entries(session.qualification.chips);
  if (chips.length === 0) return null;

  return (
    <div className="px-4 py-2 border-t border-brand-slate-100 flex flex-wrap gap-1.5 bg-brand-slate-50/60">
      {chips.map(([key, value]) => (
        <motion.span
          key={key}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] font-bold text-emerald-800"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <span className="w-1 h-1 rounded-full bg-emerald-500" aria-hidden="true" />
          {value as string}
        </motion.span>
      ))}
    </div>
  );
}

const WidgetContainer = memo(function WidgetContainer({
  onBookDemo,
}: {
  onBookDemo: () => void;
}) {
  const shouldReduce = useReducedMotion();
  const { session, isOpen, isTyping, closeWidget, sendMessage, config } = useLeadFlow();
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages.length, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage(text);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="bg-white border border-brand-slate-200 w-[350px] sm:w-[380px] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: "520px" }}
          initial={{ opacity: 0, y: shouldReduce ? 0 : 30, scale: shouldReduce ? 1 : 0.93 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: shouldReduce ? 0 : 30, scale: shouldReduce ? 1 : 0.93 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          role="dialog"
          aria-label="LeadFlow chat"
          aria-modal="false"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-brand-navy text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center font-black text-sm" aria-hidden="true">
                  L
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-brand-navy" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-xs block">{config.businessName} · LeadFlow</span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" aria-hidden="true" />
                  {session.qualification.score > 0
                    ? `Lead score: ${session.qualification.score}%`
                    : "Online · AI Powered"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {session.phase === "booking" || session.phase === "solution" ? (
                <motion.button
                  onClick={() => { onBookDemo(); closeWidget(); }}
                  className="text-[10px] font-bold bg-brand-blue hover:bg-brand-indigo text-white px-2.5 py-1 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-white"
                  whileHover={shouldReduce ? {} : { scale: 1.04 }}
                  whileTap={shouldReduce ? {} : { scale: 0.97 }}
                  aria-label="Book a strategy session"
                >
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    Book Session
                  </span>
                </motion.button>
              ) : null}
              <button
                onClick={closeWidget}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-white"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar"
            role="log"
            aria-live="polite"
            aria-atomic="false"
          >
            {session.messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={chatEndRef} />
          </div>

          {/* Qualification chips */}
          <QualificationStrip />

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-brand-slate-100 flex gap-2 flex-shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or describe your business…"
              className="flex-1 text-xs border border-brand-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 transition-all"
              aria-label="Message LeadFlow"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 bg-brand-navy hover:bg-brand-blue text-white rounded-xl transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-brand-blue"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default WidgetContainer;
