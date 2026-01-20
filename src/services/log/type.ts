export type LogLevel = "info" | "error" | "warn" | "debug";

export interface LogEntry {
  level: LogLevel;
  message: string;
  source: string;
  context?: Record<string, any>;
  error_stack?: string;
  user_id?: string;
  order_id?: string;
}

export interface LogResponse {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source: string;
  context?: Record<string, any>;
  error_stack?: string;
  user_id?: string;
  order_id?: string;
  created_at: string;
}
