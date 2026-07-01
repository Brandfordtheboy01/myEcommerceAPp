type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, scope: string, message: string, meta?: unknown) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    scope,
    message,
    ...(meta !== undefined ? { meta } : {}),
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (scope: string, message: string, meta?: unknown) => log("info", scope, message, meta),
  warn: (scope: string, message: string, meta?: unknown) => log("warn", scope, message, meta),
  error: (scope: string, message: string, meta?: unknown) => log("error", scope, message, meta),
};

export function formatZodError(error: { issues: { path: (string | number)[]; message: string }[] }) {
  return error.issues.map((i) => `${i.path.join(".") || "field"}: ${i.message}`).join("; ");
}
