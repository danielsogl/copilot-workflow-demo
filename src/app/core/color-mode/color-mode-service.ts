import { computed, effect } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from "@ngrx/signals";

export type ColorMode = "system" | "light" | "dark";
export type EffectiveColorMode = "light" | "dark";

export interface ColorModeState {
  colorMode: ColorMode;
  systemPrefersDark: boolean;
}

const initialColorModeState: ColorModeState = {
  colorMode: "system",
  systemPrefersDark: false,
};

const NEXT_COLOR_MODE: Record<ColorMode, ColorMode> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const COLOR_MODE_STORAGE_KEY = "color-mode";

function isColorMode(value: string | null): value is ColorMode {
  return value === "system" || value === "light" || value === "dark";
}

function readStoredColorMode(): ColorMode | null {
  try {
    const value = localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    return isColorMode(value) ? value : null;
  } catch {
    return null;
  }
}

function writeStoredColorMode(mode: ColorMode): void {
  try {
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
  } catch {
    // localStorage unavailable (disabled, private browsing, etc.) — keep the
    // in-memory state only, without blocking the app.
  }
}

export const ColorModeService = signalStore(
  { providedIn: "root" },
  withState(initialColorModeState),
  withComputed(({ colorMode, systemPrefersDark }) => ({
    effectiveColorMode: computed<EffectiveColorMode>(() => {
      const mode = colorMode();
      if (mode === "system") {
        return systemPrefersDark() ? "dark" : "light";
      }
      return mode;
    }),
  })),
  withComputed(({ effectiveColorMode }) => ({
    effectiveColorModeIcon: computed(() =>
      effectiveColorMode() === "dark" ? "dark_mode" : "light_mode",
    ),
    toggleLabel: computed(() => `Color mode: ${effectiveColorMode()}`),
  })),
  withMethods((store) => ({
    cycleColorMode(): void {
      patchState(store, { colorMode: NEXT_COLOR_MODE[store.colorMode()] });
    },
  })),
  withHooks({
    onInit(store) {
      const storedColorMode = readStoredColorMode();
      if (storedColorMode) {
        patchState(store, { colorMode: storedColorMode });
      }

      const media =
        typeof window !== "undefined" && typeof window.matchMedia === "function"
          ? window.matchMedia("(prefers-color-scheme: dark)")
          : null;

      if (media) {
        patchState(store, { systemPrefersDark: media.matches });
        media.addEventListener("change", (event) => {
          patchState(store, { systemPrefersDark: event.matches });
        });
      }

      effect(() => {
        writeStoredColorMode(store.colorMode());
      });

      // Applied synchronously (not just via the effect below) so the
      // document already reflects the resolved color mode as soon as the
      // service is constructed — `provideAppInitializer` relies on this to
      // avoid a flash before the root component's first render. Angular
      // effects only flush asynchronously, which isn't early enough here.
      document.documentElement.style.colorScheme = store.effectiveColorMode();

      effect(() => {
        document.documentElement.style.colorScheme = store.effectiveColorMode();
      });
    },
  }),
);
