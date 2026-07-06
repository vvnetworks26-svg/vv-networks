import path from "path";
import serveStatic from "serve-static";
import { createApp, initDatabase } from "./src/server/app.js";
import { config } from "./src/server/config.js";
import { createServer as createViteServer } from "vite";

async function start(): Promise<void> {
  // Connect to MongoDB (no-op if MONGODB_URI not set)
  await initDatabase();

  const app = createApp();

  if (config.nodeEnv !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.listen(config.port, "0.0.0.0", () => {
      console.log(`[VV Networks] dev server → http://localhost:${config.port}`);
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(serveStatic(distPath) as any);
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    app.listen(config.port, "0.0.0.0", () => {
      console.log(`[VV Networks] production server → port ${config.port}`);
    });
  }
}

start().catch((err) => {
  console.error("[VV Networks] Fatal startup error:", err);
  process.exit(1);
});
