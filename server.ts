import path from "path";
import serveStatic from "serve-static";
import { createApp, initDatabase } from "./src/server/app.js";
import { config } from "./src/server/config.js";
import { assertEnvironment } from "./src/server/env-validator.js";
import logger from "./src/server/logger.js";
import { registerJobs, schedulerService } from "./src/server/services/scheduler.service.js";

async function start(): Promise<void> {
  // ── 1. Validate environment ────────────────────────────────────────────────
  assertEnvironment();

  // ── 2. Connect to MongoDB ──────────────────────────────────────────────────
  await initDatabase();

  // ── 3. Register + start background jobs ───────────────────────────────────
  registerJobs();
  schedulerService.start();

  // ── 4. Build Express app ───────────────────────────────────────────────────
  const app = createApp();

  if (config.nodeEnv !== "production") {
    // Development: start Vite in middleware mode
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.listen(config.port, "0.0.0.0", () => {
      logger.info(`[VV Networks] dev server → http://localhost:${config.port}`);
    });
  } else {
    // Production: serve pre-built static assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(serveStatic(distPath) as any);
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    app.listen(config.port, "0.0.0.0", () => {
      logger.info(`[VV Networks] production → port ${config.port}`, {
        version: config.appVersion,
        commit:  config.gitCommit,
      });
    });
  }
}

start().catch((err) => {
  logger.fatal("[VV Networks] Fatal startup error", { error: { message: String(err), stack: err?.stack } });
  process.exit(1);
});

// ── Graceful shutdown ──────────────────────────────────────────────────────
function shutdown(signal: string) {
  logger.info(`[VV Networks] ${signal} received — shutting down`);
  schedulerService.stop();
  process.exit(0);
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));
