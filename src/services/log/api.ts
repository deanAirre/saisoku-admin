import { supabase } from "../api";
import type { LogEntry } from "./type";

export const logError = async (entry: LogEntry) => {
  try {
    const { error } = await supabase.from("logs").insert({
      level: entry.level,
      message: entry.message,
      source: entry.source,
      context: entry.context,
      error_stack: entry.error_stack,
      user_id: entry.user_id,
      order_id: entry.order_id,
    });

    if (error) {
      // Fallback to console if logging failse
      console.error("Failed to log to database:", error);
      console.error("Original log", entry);
    }
  } catch (err) {
    // Silent fail - don't break app if logging fails
    console.error("Logger error:", err);
    console.error("Original log:", entry);
  }
};

export const logger = {
  error: (
    message: string,
    source: string,
    context?: Record<string, any>,
    error?: Error,
  ) => {
    return logError({
      level: "error",
      message,
      source,
      context,
      error_stack: error?.stack,
    });
  },

  warn: (message: string, source: string, context?: Record<string, any>) => {
    return logError({
      level: "warn",
      message,
      source,
      context,
    });
  },

  info: (message: string, source: string, context?: Record<string, any>) => {
    return logError({
      level: "info",
      message,
      source,
      context,
    });
  },
  debug: (message: string, source: string, context?: Record<string, any>) => {
    return logError({
      level: "debug",
      message,
      source,
      context,
    });
  },
};
