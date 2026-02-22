import { DungeonRun, type DungeonRunSaveData } from "./game";

const SAVE_TOKEN_PREFIX = "std1";
const SAVE_QUERY_PARAM = "save";
const LATEST_SAVE_KEY = "survive-dungeon/latest-save/v1";
const MAX_SHAREABLE_URL_LENGTH = 1800;

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const value of bytes) {
    binary += String.fromCharCode(value);
  }
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(input: string): Uint8Array {
  const normalized = input.replaceAll("-", "+").replaceAll("_", "/");
  const padding = normalized.length % 4;
  const padded =
    padding === 0 ? normalized : `${normalized}${"=".repeat(4 - padding)}`;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function encodeSaveToken(run: DungeonRun): string {
  const payload = JSON.stringify(run.toSaveData());
  const encoded = bytesToBase64Url(new TextEncoder().encode(payload));
  return `${SAVE_TOKEN_PREFIX}.${encoded}`;
}

export function decodeSaveToken(token: string): DungeonRunSaveData {
  const trimmed = token.trim();
  const payload = trimmed.startsWith(`${SAVE_TOKEN_PREFIX}.`)
    ? trimmed.slice(SAVE_TOKEN_PREFIX.length + 1)
    : trimmed;

  if (!payload) {
    throw new Error("Save token is empty.");
  }

  const raw = new TextDecoder().decode(base64UrlToBytes(payload));
  return JSON.parse(raw) as DungeonRunSaveData;
}

export function loadRunFromToken(token: string): DungeonRun {
  return DungeonRun.fromSaveData(decodeSaveToken(token));
}

export function extractSaveToken(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith(`${SAVE_TOKEN_PREFIX}.`)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const token = url.searchParams.get(SAVE_QUERY_PARAM);
    if (token && token.trim().length > 0) {
      return token.trim();
    }
  } catch {
    // Not a URL. Treat as a raw token.
  }

  return trimmed;
}

export function buildSaveUrl(
  token: string,
  locationLike: Pick<Location, "origin" | "pathname">,
): string {
  const url = new URL(locationLike.pathname, locationLike.origin);
  url.searchParams.set(SAVE_QUERY_PARAM, token);
  return url.toString();
}

export function extractSaveTokenFromSearch(search: string): string | null {
  const params = new URLSearchParams(search);
  const token = params.get(SAVE_QUERY_PARAM);
  if (!token || token.trim().length === 0) {
    return null;
  }
  return token.trim();
}

export function canUseShareableUrl(url: string): boolean {
  return url.length <= MAX_SHAREABLE_URL_LENGTH;
}

export function storeLatestSaveToken(token: string): void {
  try {
    window.localStorage.setItem(LATEST_SAVE_KEY, token);
  } catch {
    // Ignore storage failures in private mode/restricted environments.
  }
}

export function readLatestSaveToken(): string | null {
  try {
    return window.localStorage.getItem(LATEST_SAVE_KEY);
  } catch {
    return null;
  }
}
