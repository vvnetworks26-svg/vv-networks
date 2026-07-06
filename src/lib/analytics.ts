/**
 * Internal analytics abstraction.
 *
 * Currently stores events in memory only.
 * In Phase D, swap the `flush()` implementation to send to your
 * analytics backend (PostHog, Plausible, custom endpoint).
 *
 * No third-party scripts are loaded. Zero external network calls.
 */

export type AnalyticsEventName =
  | "page_view"
  | "widget_opened"
  | "widget_closed"
  | "cta_clicked"
  | "booking_started"
  | "booking_completed"
  | "portfolio_opened"
  | "demo_played"
  | "demo_completed"
  | "faq_expanded"
  | "contact_form_submitted";

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  properties?: Record<string, string | number | boolean>;
  timestamp: Date;
}

const queue: AnalyticsEvent[] = [];

export function track(
  name: AnalyticsEventName,
  properties?: Record<string, string | number | boolean>
): void {
  queue.push({ name, properties, timestamp: new Date() });
  // Phase D: flush to backend when queue reaches threshold or on page unload
}

export function getQueue(): ReadonlyArray<AnalyticsEvent> {
  return queue;
}

/** Called on page load — tracks a page view with the current path */
export function trackPageView(): void {
  track("page_view", { path: window.location.pathname });
}
