"use client";

import { useSyncExternalStore } from "react";

export type FxMode = "lite" | "3d";

const STORAGE_KEY = "progyantra_fx_mode";

function safeRead(): FxMode {
  if (typeof window === "undefined") return "lite";
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "3d" ? "3d" : "lite";
}

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

export function useFxMode(): FxMode {
  return useSyncExternalStore(subscribe, safeRead, () => "lite");
}

export function setFxMode(mode: FxMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, mode);
  // Force same-tab subscribers to update.
  window.dispatchEvent(
    new StorageEvent("storage", { key: STORAGE_KEY, newValue: mode })
  );
}

export function toggleFxMode() {
  const next: FxMode = safeRead() === "3d" ? "lite" : "3d";
  setFxMode(next);
}

