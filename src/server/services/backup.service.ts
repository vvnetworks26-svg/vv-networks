/**
 * Backup Abstraction — Phase I.6
 *
 * Provides a provider-agnostic interface for database exports and restores.
 * No scheduled jobs required — this is invoked manually or via CLI.
 *
 * Future: wire CloudStorageProvider to S3/GCS for remote uploads.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { config } from "../config.js";
import logger from "../logger.js";

// ── Storage provider interface ────────────────────────────────────────────────

export interface IStorageProvider {
  readonly name: string;
  upload(localPath: string, remotePath: string): Promise<string>;  // returns remote URL
  download(remotePath: string, localPath: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
  delete(remotePath: string): Promise<void>;
}

/** Local filesystem storage — default, works everywhere */
export class LocalStorageProvider implements IStorageProvider {
  readonly name = "local";
  private readonly baseDir: string;

  constructor(baseDir = "./backups") {
    this.baseDir = baseDir;
    fs.mkdirSync(baseDir, { recursive: true });
  }

  async upload(localPath: string, remotePath: string): Promise<string> {
    const dest = path.join(this.baseDir, remotePath);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(localPath, dest);
    return dest;
  }

  async download(remotePath: string, localPath: string): Promise<void> {
    const src = path.join(this.baseDir, remotePath);
    fs.copyFileSync(src, localPath);
  }

  async list(prefix: string): Promise<string[]> {
    const dir = path.join(this.baseDir, prefix);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).map((f) => path.join(prefix, f));
  }

  async delete(remotePath: string): Promise<void> {
    const p = path.join(this.baseDir, remotePath);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

/**
 * S3StorageProvider stub — implement in future cloud phase.
 * Replace with @aws-sdk/client-s3 when ready.
 */
export class S3StorageProvider implements IStorageProvider {
  readonly name = "s3";

  async upload(_local: string, _remote: string): Promise<string> {
    throw new Error("S3StorageProvider: not yet implemented. Coming in Cloud Phase.");
  }
  async download(_remote: string, _local: string): Promise<void> {
    throw new Error("S3StorageProvider: not yet implemented.");
  }
  async list(_prefix: string): Promise<string[]> {
    throw new Error("S3StorageProvider: not yet implemented.");
  }
  async delete(_remote: string): Promise<void> {
    throw new Error("S3StorageProvider: not yet implemented.");
  }
}

// ── Backup interface ──────────────────────────────────────────────────────────

export interface BackupResult {
  success:   boolean;
  filename:  string;
  path:      string;
  size?:     number;
  error?:    string;
}

export interface RestoreOptions {
  filename:  string;
  database?: string;
}

// ── MongoDB Backup ────────────────────────────────────────────────────────────

export class MongoBackupService {
  private readonly storage: IStorageProvider;

  constructor(storage?: IStorageProvider) {
    this.storage = storage ?? new LocalStorageProvider();
  }

  /**
   * Creates a mongodump of the current database.
   * Requires mongodump to be installed on the system.
   */
  async export(outputDir = "./tmp/backup"): Promise<BackupResult> {
    if (!config.mongoUri) {
      return { success: false, filename: "", path: "", error: "MONGODB_URI not configured" };
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename  = `backup-${timestamp}.gz`;
    const localPath = path.join(outputDir, filename);

    try {
      fs.mkdirSync(outputDir, { recursive: true });

      // mongodump to compressed archive
      const cmd = `mongodump --uri="${config.mongoUri}" --archive="${localPath}" --gzip`;
      logger.info("[Backup] Starting mongodump export", { filename });

      execSync(cmd, { stdio: "pipe" });

      const { size } = fs.statSync(localPath);
      const remotePath = `mongo/${filename}`;
      const storedPath = await this.storage.upload(localPath, remotePath);

      // Clean up local temp
      fs.unlinkSync(localPath);

      logger.info("[Backup] Export complete", { filename, size, storedPath });
      return { success: true, filename, path: storedPath, size };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("[Backup] Export failed", { filename, error: message });
      return { success: false, filename, path: "", error: message };
    }
  }

  /**
   * Restores a database from a previously created backup archive.
   */
  async restore(opts: RestoreOptions): Promise<BackupResult> {
    if (!config.mongoUri) {
      return { success: false, filename: opts.filename, path: "", error: "MONGODB_URI not configured" };
    }

    const localPath = `./tmp/restore-${Date.now()}.gz`;

    try {
      fs.mkdirSync("./tmp", { recursive: true });

      // Download from storage
      await this.storage.download(`mongo/${opts.filename}`, localPath);

      const dbFlag = opts.database ? `--nsInclude="${opts.database}.*"` : "";
      const cmd    = `mongorestore --uri="${config.mongoUri}" --archive="${localPath}" --gzip ${dbFlag}`;

      logger.warn("[Backup] Starting mongorestore", { filename: opts.filename });
      execSync(cmd, { stdio: "pipe" });

      fs.unlinkSync(localPath);
      logger.info("[Backup] Restore complete", { filename: opts.filename });
      return { success: true, filename: opts.filename, path: localPath };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("[Backup] Restore failed", { filename: opts.filename, error: message });
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      return { success: false, filename: opts.filename, path: "", error: message };
    }
  }

  async listBackups(): Promise<string[]> {
    return this.storage.list("mongo");
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────
export const backupService = new MongoBackupService();
