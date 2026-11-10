# Database Backup & Recovery Guide

This guide explains how to back up and restore the Leadora PostgreSQL database in simple words.

---

## 1. Quick Backup

To make an instant copy of your database, open your terminal and run:

```bash
# Set your password
export PGPASSWORD="crm_secret_password"

# Create a compressed backup file
pg_dump \
  -h localhost \
  -p 5432 \
  -U crm_admin \
  -F c \
  -b \
  -v \
  -f "crm_backup_$(date +%Y%m%d_%H%M%S).dump" \
  business_crm
```

### What do the flags mean?
- `-h`: The host where PostgreSQL is running (e.g. `localhost`).
- `-p`: The port number (usually `5432`).
- `-U`: The database username (`crm_admin`).
- `-F c`: Custom compressed format (saves disk space and restores fast).
- `-f`: The output filename.

---

## 2. Quick Restore

If you ever need to restore your database from a backup file:

```bash
# 1. Close existing connections and recreate a fresh database
export PGPASSWORD="crm_secret_password"
dropdb -h localhost -p 5432 -U crm_admin --if-exists business_crm
createdb -h localhost -p 5432 -U crm_admin business_crm

# 2. Restore your backup file
pg_restore \
  -h localhost \
  -p 5432 \
  -U crm_admin \
  -d business_crm \
  -v \
  "your_backup_file.dump"
```

---

## 3. Daily Automatic Backup Script

To run backups automatically every night on a Linux server:

1. Save this script as `/opt/scripts/backup_crm.sh`:

```bash
#!/usr/bin/env bash
set -e

BACKUP_DIR="/var/backups/postgresql/leadora"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/crm_backup_${TIMESTAMP}.dump"

mkdir -p "${BACKUP_DIR}"

# Run pg_dump
PGPASSWORD="${DB_PASSWORD:-crm_secret_password}" pg_dump \
  -h "${DB_HOST:-localhost}" \
  -p "${DB_PORT:-5432}" \
  -U "${DB_USER:-crm_admin}" \
  -F c -b \
  -f "${BACKUP_FILE}" \
  "${DB_NAME:-business_crm}"

# Delete backups older than 30 days to save disk space
find "${BACKUP_DIR}" -name "crm_backup_*.dump" -mtime +30 -delete
```

2. Make it executable:
```bash
chmod +x /opt/scripts/backup_crm.sh
```

3. Schedule it in cron to run at 2:00 AM every night:
```cron
0 2 * * * /opt/scripts/backup_crm.sh
```

