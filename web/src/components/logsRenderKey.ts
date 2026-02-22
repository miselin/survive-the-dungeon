import type { LogEntry } from "../types";

export function buildLogsRenderKey(logs: LogEntry[]): string {
  return logs.map((entry) => `${entry.level}:${entry.text}`).join("|\n");
}
