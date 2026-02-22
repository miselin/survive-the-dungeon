import { useEffect, useRef } from "react";
import type { LogEntry } from "../types";

export function buildLogsRenderKey(logs: LogEntry[]): string {
  return logs.map((entry) => `${entry.level}:${entry.text}`).join("|\n");
}

type LogsPanelProps = {
  logs: LogEntry[];
};

export function LogsPanel(props: LogsPanelProps) {
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const element = listRef.current;
    if (!element) {
      return;
    }
    element.scrollTop = element.scrollHeight;
  }, [props.logs.length]);

  return (
    <ul id="logs" ref={listRef} className="logs">
      {props.logs.map((entry, index) => (
        <li key={`${index}-${entry.level}-${entry.text}`} className={`log-${entry.level}`}>{entry.text}</li>
      ))}
    </ul>
  );
}
