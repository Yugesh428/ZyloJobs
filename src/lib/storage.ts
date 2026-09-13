/**
 * storage.ts — file upload utility.
 *
 * Dev  (LOCAL_STORAGE=true or NODE_ENV=development):
 *   Saves files to /public/uploads/<subfolder>/ and returns a relative URL.
 *
 * Prod:
 *   Swap this file for an S3 implementation — keep the same
 *   `saveFile(buffer, filename, subfolder)` signature.
 *
 * Usage:
 *   import { saveFile } from "@/lib/storage";
 *   const url = await saveFile(buffer, "resume.pdf", "cvs");
 */

import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Ensure the target directory exists (creates recursively).
 */
async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Generate a unique filename to avoid collisions.
 * Format: <timestamp>-<random>-<originalname>
 */
export function uniqueFilename(original: string): string {
  const ext  = path.extname(original).toLowerCase();
  const base = path.basename(original, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .slice(0, 40);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${Date.now()}-${rand}-${base}${ext}`;
}

/**
 * Save a file buffer to local disk.
 *
 * @param buffer   - Raw file bytes
 * @param filename - Already-sanitised unique filename (use uniqueFilename())
 * @param subfolder - e.g. "cvs", "avatars" — stored under /public/uploads/<subfolder>/
 * @returns Public URL path, e.g. "/uploads/cvs/1234-abc-resume.pdf"
 */
export async function saveFile(
  buffer: Buffer,
  filename: string,
  subfolder: string,
): Promise<string> {
  const dir = path.join(UPLOAD_DIR, subfolder);
  await ensureDir(dir);

  const fullPath = path.join(dir, filename);
  await fs.writeFile(fullPath, buffer);

  // Return the public URL (relative, served by Next.js from /public)
  return `/uploads/${subfolder}/${filename}`;
}

/**
 * Delete a previously saved file by its public URL.
 * Silently ignores if the file doesn't exist.
 */
export async function deleteFile(publicUrl: string): Promise<void> {
  try {
    const relativePath = publicUrl.replace(/^\/uploads\//, "");
    const fullPath = path.join(UPLOAD_DIR, relativePath);
    await fs.unlink(fullPath);
  } catch {
    // File not found or already deleted — not an error
  }
}

/**
 * Allowed MIME types for CV uploads.
 */
export const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type AllowedCvType = (typeof ALLOWED_CV_TYPES)[number];

/** Max CV size: 5 MB */
export const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;
