export type WindowPosition = {
  left: number;
  top: number;
};

const STORAGE_PREFIX = "survive.window-position.v1";
const WINDOW_MARGIN_PX = 8;

function hasBrowserWindow(): boolean {
  return typeof window !== "undefined";
}

function hasStorage(): boolean {
  return hasBrowserWindow() && typeof window.localStorage !== "undefined";
}

function storageKey(windowKey: string): string {
  return `${STORAGE_PREFIX}:${windowKey}`;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function centerModal(modal: HTMLElement): void {
  modal.style.left = "50%";
  modal.style.top = "50%";
  modal.style.transform = "translate(-50%, -50%)";
}

export function placeModalAt(modal: HTMLElement, position: WindowPosition): void {
  modal.style.left = `${Math.round(position.left)}px`;
  modal.style.top = `${Math.round(position.top)}px`;
  modal.style.transform = "none";
}

export function currentModalPosition(modal: HTMLElement): WindowPosition {
  const rect = modal.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
  };
}

export function clampModalPosition(modal: HTMLElement, position: WindowPosition): WindowPosition {
  if (!hasBrowserWindow()) {
    return {
      left: Math.round(position.left),
      top: Math.round(position.top),
    };
  }

  const rect = modal.getBoundingClientRect();
  const width = rect.width || modal.offsetWidth || 0;
  const height = rect.height || modal.offsetHeight || 0;
  const maxLeft = Math.max(WINDOW_MARGIN_PX, window.innerWidth - width - WINDOW_MARGIN_PX);
  const maxTop = Math.max(WINDOW_MARGIN_PX, window.innerHeight - height - WINDOW_MARGIN_PX);

  return {
    left: Math.min(maxLeft, Math.max(WINDOW_MARGIN_PX, Math.round(position.left))),
    top: Math.min(maxTop, Math.max(WINDOW_MARGIN_PX, Math.round(position.top))),
  };
}

export function readWindowPosition(windowKey: string): WindowPosition | null {
  if (!hasStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(storageKey(windowKey));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<WindowPosition>;
    if (!isFiniteNumber(parsed.left) || !isFiniteNumber(parsed.top)) {
      return null;
    }

    return {
      left: parsed.left,
      top: parsed.top,
    };
  } catch {
    return null;
  }
}

export function writeWindowPosition(windowKey: string, position: WindowPosition): void {
  if (!hasStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(storageKey(windowKey), JSON.stringify(position));
  } catch {
    // Ignore storage failures (private mode/quota) and continue without persistence.
  }
}

export function applySavedWindowPosition(modal: HTMLElement, windowKey: string | null): void {
  if (!windowKey) {
    centerModal(modal);
    return;
  }

  const saved = readWindowPosition(windowKey);
  if (!saved) {
    centerModal(modal);
    return;
  }

  const clamped = clampModalPosition(modal, saved);
  placeModalAt(modal, clamped);
  if (clamped.left !== saved.left || clamped.top !== saved.top) {
    writeWindowPosition(windowKey, clamped);
  }
}
