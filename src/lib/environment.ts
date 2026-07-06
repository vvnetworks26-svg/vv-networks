/**
 * Typed environment configuration.
 * All environment access in the frontend goes through this module — no scattered import.meta.env calls.
 */

export const env = {
  /** Base URL of the deployed backend API. Empty string in dev (Vite proxy handles /api/*). */
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? "",

  /** True in development mode */
  isDev: import.meta.env.DEV,

  /** True in production build */
  isProd: import.meta.env.PROD,

  /** The deployment mode string */
  mode: import.meta.env.MODE as "development" | "production" | "staging",
} as const;
