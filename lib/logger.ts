type LogLevel = "info" | "error";

type LogPayload = {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
};

function createLog(level: LogLevel, message: string, meta?: Record<string, unknown>): LogPayload {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta } : {}),
  };
}

export function logInfo(message: string, meta?: Record<string, unknown>): void {
  console.log(JSON.stringify(createLog("info", message, meta)));
}

export function logError(message: string, meta?: Record<string, unknown>): void {
  console.error(JSON.stringify(createLog("error", message, meta)));
}
