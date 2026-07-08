# Backups — VV Networks

## Strategy

| Layer | Method | Frequency | Retention |
|---|---|---|---|
| MongoDB Atlas | Continuous cloud backup | Automatic | 7 days (M10+) |
| Manual export | `mongodump` via backup service | On-demand | Stored locally or S3 |
| Point-in-time | MongoDB Atlas PITR | Every 60s | 7 days (M10+) |

---

## MongoDB Atlas (Recommended)

MongoDB Atlas M10+ clusters include:
- **Continuous cloud backup** — restored to any point within 7 days
- **Scheduled snapshots** — daily snapshots, retained 7 days

Enable in Atlas: **Cluster → Backup → Enable Cloud Backup**

---

## Manual Exports

The backup service is available via code:

```typescript
import { backupService } from "./src/server/services/backup.service.js";

// Export
const result = await backupService.export("./backups");
console.log(result); // { success: true, filename: "backup-2026-01-01T00-00-00.gz", ... }

// List
const list = await backupService.listBackups();

// Restore
const restore = await backupService.restore({ filename: "backup-2026-01-01T00-00-00.gz" });
```

### Requirements

`mongodump` and `mongorestore` must be installed:

```bash
# macOS
brew install mongodb/brew/mongodb-database-tools

# Ubuntu
apt-get install mongodb-database-tools
```

---

## Storage Providers

Currently supported:
- **LocalStorageProvider** — saves to `./backups/` directory (default)
- **S3StorageProvider** — stub, implement in Cloud Phase with `@aws-sdk/client-s3`

Switch storage provider:

```typescript
import { MongoBackupService, S3StorageProvider } from "./backup.service.js";
const backup = new MongoBackupService(new S3StorageProvider());
```

---

## Restore Procedure

### From Atlas (point-in-time)

1. Atlas dashboard → Cluster → Backup → Restore
2. Select point in time or snapshot
3. Restore to same or new cluster

### From manual export

```bash
mongorestore \
  --uri="$MONGODB_URI" \
  --archive="./backups/mongo/backup-2026-01-01T00-00-00.gz" \
  --gzip
```

---

## Pre-deployment backup

Before any major deployment, run a manual export:

```bash
npx tsx -e "
import('./src/server/services/backup.service.js').then(m =>
  m.backupService.export('./backups').then(r => console.log(r))
);
"
```
