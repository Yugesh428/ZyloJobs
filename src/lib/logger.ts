/**
 * Lightweight structured logger — works in Node.js and Edge runtime.
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.info("MyController", "Action started", { id });
 *   logger.warn("MyController", "Not found", { id });
 *   logger.error("MyController", "Failed", error);
 *   logger.debug("MyController", "Payload", { body });   // only in development
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info:  1,
  warn:  2,
  error: 3,
};

// In production only log info and above; in dev log everything
const MIN_LEVEL: LogLevel =
  process.env.NODE_ENV === "production" ? "info" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LEVEL_RANK[level] >= LEVEL_RANK[MIN_LEVEL];
}

function timestamp(): string {
  return new Date().toISOString();
}

function formatMeta(meta: unknown): string {
  if (meta === undefined || meta === null) return "";
  try {
    return " " + JSON.stringify(meta, null, 0);
  } catch {
    return " [unserializable]";
  }
}

function log(level: LogLevel, ctx: string, message: string, meta?: unknown) {
  if (!shouldLog(level)) return;

  const ts  = timestamp();
  const tag = `[${ts}] [${level.toUpperCase().padEnd(5)}] [${ctx}]`;
  const out = `${tag} ${message}${formatMeta(meta)}`;

  if (level === "error") {
    console.error(out);
    // If meta is an Error, print the stack separately
    if (meta instanceof Error && meta.stack) {
      console.error(meta.stack);
    }
  } else if (level === "warn") {
    console.warn(out);
  } else {
    console.log(out);
  }
}

export const logger = {
  debug: (ctx: string, message: string, meta?: unknown) =>
    log("debug", ctx, message, meta),
  info:  (ctx: string, message: string, meta?: unknown) =>
    log("info",  ctx, message, meta),
  warn:  (ctx: string, message: string, meta?: unknown) =>
    log("warn",  ctx, message, meta),
  error: (ctx: string, message: string, meta?: unknown) =>
    log("error", ctx, message, meta),
};
