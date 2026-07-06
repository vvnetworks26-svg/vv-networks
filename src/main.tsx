import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import { trackPageView } from "./lib/analytics.ts";
import "./index.css";

// Restore scroll to top on hard navigation
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

// Fire page view on initial load
trackPageView();

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found in HTML.");

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
