import type { SessionState, SessionPhase, Message, QualificationState } from "./types";
import { eventBus } from "./eventBus";
import { extractQualification, initialQualification } from "./qualification";
import type { Transport } from "./transport";
import { defaultConfig } from "./config";

function makeId() {
  return `lf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function detectPhase(
  messages: Message[],
  qualification: QualificationState
): SessionPhase {
  if (messages.length === 0) return "idle";
  if (messages.length === 1) return "greeting";
  if (qualification.chips.strategySessionRequested || qualification.chips.demoRequested) {
    return qualification.score >= 60 ? "booking" : "solution";
  }
  if (qualification.score >= 80) return "complete";
  if (qualification.score >= 30) return "solution";
  return "qualifying";
}

export function createInitialSession(): SessionState {
  return {
    id: makeId(),
    phase: "idle",
    messages: [
      {
        id: "welcome",
        role: "assistant",
        content: defaultConfig.greeting,
        timestamp: new Date(),
      },
    ],
    qualification: initialQualification(),
    appointmentRequested: false,
    startedAt: null,
    completedAt: null,
  };
}

export async function sendMessage(
  session: SessionState,
  text: string,
  transport: Transport
): Promise<SessionState> {
  const userMessage: Message = {
    id: makeId(),
    role: "user",
    content: text,
    timestamp: new Date(),
  };

  const isFirstUserMessage = !session.messages.some((m) => m.role === "user");
  const startedAt = isFirstUserMessage ? new Date() : session.startedAt;
  if (isFirstUserMessage) eventBus.track("conversation:started", { sessionId: session.id });

  eventBus.track("message:sent", { content: text, sessionId: session.id });

  const updatedQualification = extractQualification(text, session.qualification);

  // Check for booking/demo intent before AI replies
  const appointmentRequested =
    session.appointmentRequested ||
    !!updatedQualification.chips.strategySessionRequested;

  if (!session.appointmentRequested && appointmentRequested) {
    eventBus.track("appointment:requested", { sessionId: session.id });
  }
  if (!session.qualification.chips.demoRequested && updatedQualification.chips.demoRequested) {
    eventBus.track("demo:requested", { sessionId: session.id });
  }

  // Build state with user message (for history)
  const messagesWithUser: Message[] = [...session.messages, userMessage];

  // Call transport
  const replyText = await transport.sendMessage(text, session.messages);

  const assistantMessage: Message = {
    id: makeId(),
    role: "assistant",
    content: replyText,
    timestamp: new Date(),
  };

  eventBus.track("message:received", { content: replyText, sessionId: session.id });

  // Also extract qualification from assistant reply (catches slot confirmations etc.)
  const finalQualification = extractQualification(replyText, updatedQualification);

  const messages = [...messagesWithUser, assistantMessage];
  const phase = detectPhase(messages, finalQualification);
  const isComplete = phase === "complete" || phase === "booking";
  const completedAt = isComplete && !session.completedAt ? new Date() : session.completedAt;

  if (isComplete && !session.completedAt) {
    eventBus.track("conversation:completed", { sessionId: session.id, phase });
    eventBus.track("lead:captured", {
      sessionId: session.id,
      qualification: finalQualification,
    });
  }

  return {
    ...session,
    phase,
    messages,
    qualification: finalQualification,
    appointmentRequested,
    startedAt,
    completedAt,
  };
}
