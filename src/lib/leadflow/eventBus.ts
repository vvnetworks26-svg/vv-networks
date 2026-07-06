import type { LeadFlowEventName, LeadFlowEvent, EventHandler } from "./types";

type HandlerMap = Map<LeadFlowEventName, Set<EventHandler<any>>>;

class EventBus {
  private readonly handlers: HandlerMap = new Map();

  on<T>(name: LeadFlowEventName, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(name)) this.handlers.set(name, new Set());
    this.handlers.get(name)!.add(handler as EventHandler<unknown>);
    return () => this.off(name, handler);
  }

  off<T>(name: LeadFlowEventName, handler: EventHandler<T>): void {
    this.handlers.get(name)?.delete(handler as EventHandler<unknown>);
  }

  emit<T>(name: LeadFlowEventName, payload: T): void {
    const event: LeadFlowEvent<T> = { name, payload, timestamp: new Date() };
    this.handlers.get(name)?.forEach((h) => h(event));
    // wildcard listeners
    this.handlers.get("*" as LeadFlowEventName)?.forEach((h) => h(event as LeadFlowEvent<unknown>));
  }

  recentEvents: Array<LeadFlowEvent<unknown>> = [];

  track<T>(name: LeadFlowEventName, payload: T): void {
    const event: LeadFlowEvent<T> = { name, payload, timestamp: new Date() };
    this.recentEvents = [event, ...this.recentEvents].slice(0, 20);
    this.emit(name, payload);
  }
}

export const eventBus = new EventBus();
