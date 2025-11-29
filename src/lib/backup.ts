import { copyFile, mkdir, readdir, unlink, stat } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const DATABASE_PATH = path.join(process.cwd(), "prisma", "dev.db");
const BACKUP_DIR = path.join(process.cwd(), "backups");

// Maximum number of backups to keep
const MAX_BACKUPS = 10;

export interface BackupInfo {
  filename: string;
  path: string;
  createdAt: Date;
  size: number;
}

/**
 * Ensure backup directory exists
 */
async function ensureBackupDir(): Promise<void> {
  await mkdir(BACKUP_DIR, { recursive: true });
}

/**
 * Generate a backup filename with timestamp
 */
function generateBackupFilename(): string {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .replace("Z", "");
  return `backup_${timestamp}.db`;
}

/**
 * Create a database backup
 */
export async function createBackup(description?: string): Promise<BackupInfo> {
  await ensureBackupDir();

  // Check if database exists
  if (!existsSync(DATABASE_PATH)) {
    throw new Error("Database file not found");
  }

  const filename = generateBackupFilename();
  const backupPath = path.join(BACKUP_DIR, filename);

  // Copy the database file
  await copyFile(DATABASE_PATH, backupPath);

  // Also backup the WAL file if it exists
  const walPath = DATABASE_PATH + "-wal";
  if (existsSync(walPath)) {
    await copyFile(walPath, backupPath + "-wal");
  }

  // Get file stats
  const stats = await stat(backupPath);

  // Store metadata (optional description)
  if (description) {
    const metadataPath = backupPath + ".json";
    const metadata = {
      description,
      createdAt: new Date().toISOString(),
    };
    const { writeFile } = await import("fs/promises");
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  // Cleanup old backups
  await cleanupOldBackups();

  return {
    filename,
    path: backupPath,
    createdAt: stats.birthtime,
    size: stats.size,
  };
}

/**
 * Get list of all backups
 */
export async function listBackups(): Promise<BackupInfo[]> {
  await ensureBackupDir();

  const files = await readdir(BACKUP_DIR);
  const backups: BackupInfo[] = [];

  for (const file of files) {
    if (file.endsWith(".db") && file.startsWith("backup_")) {
      const filepath = path.join(BACKUP_DIR, file);
      try {
        const stats = await stat(filepath);

        // Try to read metadata
        let metadata: { description?: string } = {};
        const metadataPath = filepath + ".json";
        if (existsSync(metadataPath)) {
          const { readFile } = await import("fs/promises");
          const content = await readFile(metadataPath, "utf-8");
          metadata = JSON.parse(content);
        }

        backups.push({
          filename: file,
          path: filepath,
          createdAt: stats.birthtime,
          size: stats.size,
          ...metadata,
        });
      } catch (error) {
        console.error(`Error reading backup ${file}:`, error);
      }
    }
  }

  // Sort by creation date (newest first)
  backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return backups;
}

/**
 * Restore a backup
 */
export async function restoreBackup(filename: string): Promise<void> {
  const backupPath = path.join(BACKUP_DIR, filename);

  if (!existsSync(backupPath)) {
    throw new Error("Backup file not found");
  }

  // Create a backup of the current database before restoring
  const preRestoreBackup = generateBackupFilename().replace(
    ".db",
    "-pre-restore.db"
  );
  await copyFile(DATABASE_PATH, path.join(BACKUP_DIR, preRestoreBackup));

  // Copy the backup to the database location
  await copyFile(backupPath, DATABASE_PATH);

  // Also restore WAL file if it exists
  const walBackupPath = backupPath + "-wal";
  const walPath = DATABASE_PATH + "-wal";
  if (existsSync(walBackupPath)) {
    await copyFile(walBackupPath, walPath);
  } else if (existsSync(walPath)) {
    // Remove existing WAL file if backup doesn't have one
    await unlink(walPath);
  }
}

/**
 * Delete a backup
 */
export async function deleteBackup(filename: string): Promise<void> {
  const backupPath = path.join(BACKUP_DIR, filename);

  if (!existsSync(backupPath)) {
    throw new Error("Backup file not found");
  }

  await unlink(backupPath);

  // Also delete WAL and metadata files if they exist
  const walPath = backupPath + "-wal";
  const metadataPath = backupPath + ".json";

  if (existsSync(walPath)) {
    await unlink(walPath);
  }
  if (existsSync(metadataPath)) {
    await unlink(metadataPath);
  }
}

/**
 * Cleanup old backups (keep only MAX_BACKUPS)
 */
async function cleanupOldBackups(): Promise<void> {
  const backups = await listBackups();

  if (backups.length > MAX_BACKUPS) {
    const toDelete = backups.slice(MAX_BACKUPS);
    for (const backup of toDelete) {
      try {
        await deleteBackup(backup.filename);
      } catch (error) {
        console.error(`Failed to delete old backup ${backup.filename}:`, error);
      }
    }
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}
