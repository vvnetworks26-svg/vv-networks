/**
 * MaintenanceService — Phase I.7
 *
 * Supports:
 *   - Global maintenance mode (blocks all requests)
 *   - Per-business maintenance mode
 *   - Whitelist (IPs / user IDs that bypass)
 *   - Message + estimated completion time
 */

import logger from "../logger.js";

export interface MaintenanceStatus {
  enabled:            boolean;
  message:            string;
  estimatedCompletion?: Date;
  startedAt?:         Date;
  updatedAt:          Date;
  businessOverrides:  Record<string, boolean>;  // businessId → override enabled
  whitelist:          string[];                 // IPs or userIds that bypass
  activeCount:        number;                   // number of requests blocked
}

const DEFAULT_STATUS: MaintenanceStatus = {
  enabled:           false,
  message:           "VV Networks is undergoing scheduled maintenance. We'll be back shortly.",
  startedAt:         undefined,
  estimatedCompletion: undefined,
  updatedAt:         new Date(),
  businessOverrides: {},
  whitelist:         [],
  activeCount:       0,
};

class MaintenanceService {
  private status: MaintenanceStatus = { ...DEFAULT_STATUS };

  getStatus(): MaintenanceStatus {
    return { ...this.status };
  }

  enable(opts: {
    message?: string;
    estimatedCompletion?: Date | string;
    whitelist?: string[];
  } = {}): MaintenanceStatus {
    this.status = {
      ...this.status,
      enabled:    true,
      message:    opts.message ?? this.status.message,
      startedAt:  new Date(),
      estimatedCompletion: opts.estimatedCompletion
        ? new Date(opts.estimatedCompletion)
        : undefined,
      whitelist:  opts.whitelist ?? this.status.whitelist,
      updatedAt:  new Date(),
    };
    logger.warn("[Maintenance] Global maintenance ENABLED", {
      message: this.status.message,
      estimated: this.status.estimatedCompletion,
    });
    return this.getStatus();
  }

  disable(): MaintenanceStatus {
    this.status = {
      ...this.status,
      enabled:    false,
      startedAt:  undefined,
      updatedAt:  new Date(),
    };
    logger.info("[Maintenance] Global maintenance DISABLED");
    return this.getStatus();
  }

  update(patch: Partial<Omit<MaintenanceStatus, "activeCount" | "updatedAt">>): MaintenanceStatus {
    this.status = { ...this.status, ...patch, updatedAt: new Date() };
    return this.getStatus();
  }

  setBusinessOverride(businessId: string, enabled: boolean): void {
    this.status.businessOverrides[businessId] = enabled;
    this.status.updatedAt = new Date();
  }

  addToWhitelist(idOrIp: string): void {
    if (!this.status.whitelist.includes(idOrIp)) {
      this.status.whitelist.push(idOrIp);
      this.status.updatedAt = new Date();
    }
  }

  removeFromWhitelist(idOrIp: string): void {
    this.status.whitelist = this.status.whitelist.filter((x) => x !== idOrIp);
    this.status.updatedAt = new Date();
  }

  /** Checks if a request should be blocked */
  isBlocked(opts: { ip?: string; userId?: string; businessId?: string }): boolean {
    // Whitelist check
    if (opts.ip     && this.status.whitelist.includes(opts.ip))     return false;
    if (opts.userId && this.status.whitelist.includes(opts.userId)) return false;

    // Business-specific override
    if (opts.businessId) {
      const biz = this.status.businessOverrides[opts.businessId];
      if (biz !== undefined) return biz;
    }

    return this.status.enabled;
  }

  incrementBlocked(): void {
    this.status.activeCount++;
  }
}

export const maintenanceService = new MaintenanceService();
export default maintenanceService;
