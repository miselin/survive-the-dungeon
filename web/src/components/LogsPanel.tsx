import type { LogEntry } from "../types";

export function buildLogsRenderKey(logs: LogEntry[]): string {
  return logs.map((entry) => `${entry.level}:${entry.text}`).join("|\n");
}

type LogsPanelProps = {
  logs: LogEntry[];
};

export function LogsPanel(props: LogsPanelProps) {
  return (
    <ul id="logs" className="logs">
      {props.logs.map((entry, index) => (
        <li key={`${index}-${entry.level}-${entry.text}`} className={`log-${entry.level}`}>{entry.text}</li>
      ))}
    </ul>
  );
}
