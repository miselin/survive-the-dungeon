import type { ReactNode } from "react";

type WindowProps = {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function Window(props: WindowProps) {
  return (
    <div className="window-shell">
      <header className="window-titlebar" data-window-drag-handle="true">
        <h2 className="window-title">{props.title}</h2>
      </header>
      <div className="window-content">
        <div className="window-body">{props.children}</div>
        {props.actions ? <div className="row-actions">{props.actions}</div> : null}
      </div>
    </div>
  );
}
