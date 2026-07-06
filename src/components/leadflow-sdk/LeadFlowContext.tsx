import React, {
  createContext, useContext, useState, useCallback,
  useRef, useEffect, useMemo, memo,
} from "react";
import type { ReactNode } from "react";
import { defaultConfig } from "../../lib/leadflow/config";
import type { LeadFlowConfig } from "../../lib/leadflow/config";
import { createInitialSession, sendMessage as sdkSendMessage } from "../../lib/leadflow/session";
import { eventBus } from "../../lib/leadflow/eventBus";
import { analytics } from "../../lib/leadflow/analytics";
import { demoTransport, productionTransport } from "../../lib/leadflow/transport";
import type { SessionState, AnalyticsSnapshot, Transport } from "../../lib/leadflow/index";

interface LeadFlowContextValue {
  config: LeadFlowConfig;
  session: SessionState;
  isOpen: boolean;
  isTyping: boolean;
  hasUnread: boolean;
  analyticsSnapshot: AnalyticsSnapshot;
  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;
  sendMessage: (text: string) => Promise<void>;
  resetSession: () => void;
}

const LeadFlowContext = createContext<LeadFlowContextValue | null>(null);

export function useLeadFlow(): LeadFlowContextValue {
  const ctx = useContext(LeadFlowContext);
  if (!ctx) throw new Error("useLeadFlow must be used inside <LeadFlowProvider>");
  return ctx;
}

interface LeadFlowProviderProps {
  children: ReactNode;
  config?: Partial<LeadFlowConfig>;
}

export const LeadFlowProvider = memo(function LeadFlowProvider({
  children,
  config: configOverrides,
}: LeadFlowProviderProps) {
  const config = useMemo(
    () => ({ ...defaultConfig, ...configOverrides }),
    [configOverrides]
  );

  const transport: Transport =
    config.mode === "production" ? productionTransport : demoTransport;

  const [session, setSession] = useState<SessionState>(() => createInitialSession());
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [analyticsSnapshot, setAnalyticsSnapshot] = useState<AnalyticsSnapshot>(
    () => analytics.getSnapshot()
  );

  // Keep analytics snapshot fresh after every event
  useEffect(() => {
    const unsubs = [
      "widget:opened", "widget:closed", "message:sent", "message:received",
      "conversation:started", "conversation:completed", "demo:requested", "appointment:requested",
    ].map((name) =>
      eventBus.on(name as any, () => setAnalyticsSnapshot(analytics.getSnapshot()))
    );
    return () => unsubs.forEach((u) => u());
  }, []);

  const openWidget = useCallback(() => {
    setIsOpen(true);
    setHasUnread(false);
    eventBus.track("widget:opened", { businessId: config.businessId });
  }, [config.businessId]);

  const closeWidget = useCallback(() => {
    setIsOpen(false);
    eventBus.track("widget:closed", { businessId: config.businessId });
  }, [config.businessId]);

  const toggleWidget = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setHasUnread(false);
        eventBus.track("widget:opened", { businessId: config.businessId });
      } else {
        eventBus.track("widget:closed", { businessId: config.businessId });
      }
      return next;
    });
  }, [config.businessId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setIsTyping(true);
      try {
        const next = await sdkSendMessage(session, text, transport);
        setSession(next);
      } catch {
        // Append error fallback message without crashing
        setSession((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: `err-${Date.now()}`,
              role: "assistant",
              content:
                "Let's schedule a 15-minute strategy session — click 'Book Team Demo' above and we'll reach out within one business day.",
              timestamp: new Date(),
            },
          ],
        }));
      } finally {
        setIsTyping(false);
      }
    },
    [session, transport]
  );

  const resetSession = useCallback(() => {
    setSession(createInitialSession());
    setHasUnread(true);
  }, []);

  // Auto-open on first visit after 4 s
  const autoOpenRef = useRef(false);
  useEffect(() => {
    if (autoOpenRef.current) return;
    autoOpenRef.current = true;
    const t = setTimeout(() => {
      if (!isOpen) openWidget();
    }, 4000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<LeadFlowContextValue>(
    () => ({
      config, session, isOpen, isTyping, hasUnread, analyticsSnapshot,
      openWidget, closeWidget, toggleWidget, sendMessage, resetSession,
    }),
    [config, session, isOpen, isTyping, hasUnread, analyticsSnapshot,
     openWidget, closeWidget, toggleWidget, sendMessage, resetSession]
  );

  return (
    <LeadFlowContext.Provider value={value}>
      {children}
    </LeadFlowContext.Provider>
  );
});
