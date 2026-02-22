import "./style.css";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const appElement = document.querySelector<HTMLDivElement>("#app");
if (!appElement) {
  throw new Error("App root not found");
}

createRoot(appElement).render(<App />);
