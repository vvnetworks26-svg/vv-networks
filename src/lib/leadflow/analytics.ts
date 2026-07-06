import type { AnalyticsSnapshot } from "./types";
import { eventBus } from "./eventBus";

class Analytics {
  private snapshot: AnalyticsSnapshot = {
    widgetOpenCount: 0,
    totalMessages: 0,
    completionRate: 0,
    ctaClicks: 0,
    demoRequests: 0,
    bookingRequests: 0,
  };

  private sessions = 0;
  private completedSessions = 0;

  constructor() {
    eventBus.on("widget:opened",           () => { this.snapshot.widgetOpenCount += 1; });
    eventBus.on("message:sent",            () => { this.snapshot.totalMessages += 1; });
    eventBus.on("message:received",        () => { this.snapshot.totalMessages += 1; });
    eventBus.on("conversation:started",    () => { this.sessions += 1; this.recalc(); });
    eventBus.on("conversation:completed",  () => { this.completedSessions += 1; this.recalc(); });
    eventBus.on("demo:requested",          () => { this.snapshot.demoRequests += 1; this.snapshot.ctaClicks += 1; });
    eventBus.on("appointment:requested",   () => { this.snapshot.bookingRequests += 1; this.snapshot.ctaClicks += 1; });
  }

  private recalc(): void {
    this.snapshot.completionRate =
      this.sessions > 0 ? Math.round((this.completedSessions / this.sessions) * 100) : 0;
  }

  getSnapshot(): AnalyticsSnapshot {
    return { ...this.snapshot };
  }
}

export const analytics = new Analytics();
