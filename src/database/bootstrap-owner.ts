/**
 * Production bootstrap — creates the first owner-role User for the business
 * created by bootstrap.ts. Self-registration always creates role "viewer"
 * (see register() in server/services/auth.service.ts), so without this
 * script there is no way to get an owner/admin account into the system.
 *
 * Idempotent: if a user with OWNER_EMAIL already exists for the business,
 * this does nothing and exits 0.
 *
 * Usage:
 *   tsx src/database/bootstrap-owner.ts
 * Requires OWNER_EMAIL, OWNER_NAME, OWNER_PASSWORD in the environment, and
 * `npm run db:bootstrap` to have been run first.
 */
import mongoose from "mongoose";
import { config } from "../server/config.js";
import { Business } from "./models/Business.js";
import { User } from "./models/User.js";
import { hashPassword } from "../server/services/password.service.js";

async function bootstrapOwner(): Promise<void> {
  if (!config.mongoUri) {
    console.error("[BootstrapOwner] MONGODB_URI not set. Aborting.");
    process.exit(1);
  }

  const email = process.env.OWNER_EMAIL;
  const name = process.env.OWNER_NAME;
  const password = process.env.OWNER_PASSWORD;
  if (!email || !name || !password) {
    console.error("[BootstrapOwner] OWNER_EMAIL, OWNER_NAME, and OWNER_PASSWORD must all be set. Aborting.");
    process.exit(1);
  }

  await mongoose.connect(config.mongoUri);
  console.info("[BootstrapOwner] Connected to MongoDB.");

  const business = await Business.findOne({ slug: "vv-networks" });
  if (!business) {
    console.error("[BootstrapOwner] No Business record found. Run `npm run db:bootstrap` first.");
    await mongoose.connection.close();
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ businessId: business._id, email: normalizedEmail });
  if (existing) {
    console.info(`[BootstrapOwner] User ${normalizedEmail} already exists (id: ${existing._id}). Nothing to do.`);
    await mongoose.connection.close();
    process.exit(0);
  }

  const passwordHash = await hashPassword(password);
  const owner = await User.create({
    businessId: business._id,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: "owner",
    isActive: true,
  });

  console.info(`[BootstrapOwner] Created owner: ${owner.email} (id: ${owner._id})`);

  await mongoose.connection.close();
  process.exit(0);
}

bootstrapOwner().catch((err) => {
  console.error("[BootstrapOwner] Fatal error:", err);
  process.exit(1);
});
