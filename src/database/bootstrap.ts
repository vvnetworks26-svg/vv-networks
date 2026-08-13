/**
 * Production bootstrap — creates the single VV Networks Business record
 * that every API request depends on (see server/api/middleware.ts withBusiness).
 *
 * Unlike seed.ts, this does NOT create fake leads, appointments, users, or
 * analytics events. It is safe to run once against the production database.
 *
 * Idempotent: running it twice does nothing the second time.
 *
 * Usage:
 *   tsx src/database/bootstrap.ts
 */
import mongoose from "mongoose";
import { config } from "../server/config.js";
import { Business } from "./models/Business.js";

async function bootstrap(): Promise<void> {
  if (!config.mongoUri) {
    console.error("[Bootstrap] MONGODB_URI not set. Aborting.");
    process.exit(1);
  }

  await mongoose.connect(config.mongoUri);
  console.info("[Bootstrap] Connected to MongoDB.");

  const existing = await Business.findOne({ slug: "vv-networks" });
  if (existing) {
    console.info(`[Bootstrap] Business already exists (id: ${existing._id}). Nothing to do.`);
    await mongoose.connection.close();
    process.exit(0);
  }

  // Update these values with your real details before running against
  // production — this is deliberately NOT auto-filled with a fake phone
  // number the way the old dev seed script was.
  const business = await Business.create({
    name: "VV Networks",
    slug: "vv-networks",
    email: "vvnetworks26@gmail.com",
    website: "https://vvnetworks.co.in",
    industry: "AI Software",
    plan: "growth",
    status: "active",
    widgetEnabled: true,
    widgetConfig: {
      greeting: "Hi! I'm LeadFlow. How can I help your business today?",
      accentColor: "#2563EB",
      position: "bottom-right",
      theme: "auto",
    },
    timezone: "America/New_York",
  });

  console.info(`[Bootstrap] Created Business: ${business.name} (id: ${business._id})`);
  console.info("[Bootstrap] Done. Add a real phone number via the Business API/dashboard when available.");

  await mongoose.connection.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error("[Bootstrap] Fatal error:", err);
  process.exit(1);
});
