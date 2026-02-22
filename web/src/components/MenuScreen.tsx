import { EN } from "../strings/en";

type MenuScreenProps = {
  seedInput: string;
  hasLatestSave: boolean;
  onSeedInputChange: (value: string) => void;
  onStart: () => void;
  onLoad: () => void;
  onResumeLatest: () => void;
};

export function MenuScreen(props: MenuScreenProps) {
  return (
    <section className="menu-shell">
      <div className="menu-card">
        <h1>{EN.ui.appTitle}</h1>
        <p className="menu-subtitle">{EN.ui.menuSubtitle}</p>
        <label htmlFor="seed-input">{EN.ui.seedInputLabel}</label>
        <input
          id="seed-input"
          type="text"
          placeholder={EN.ui.seedInputPlaceholder}
          value={props.seedInput}
          onChange={(event) => {
            props.onSeedInputChange(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              props.onStart();
            }
          }}
        />
        <div className="menu-actions">
          <button id="start-run" type="button" onClick={props.onStart}>{EN.ui.startRunButton}</button>
          <button id="load-run" type="button" onClick={props.onLoad}>{EN.ui.buttons.load}</button>
          <button id="resume-latest" type="button" disabled={!props.hasLatestSave} onClick={props.onResumeLatest}>{EN.ui.buttons.resumeLast}</button>
        </div>
        <p className="menu-help">{EN.ui.menuHelp}</p>
      </div>
    </section>
  );
}
