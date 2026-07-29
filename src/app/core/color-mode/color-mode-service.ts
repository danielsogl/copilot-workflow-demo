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
        document.documentElement.style.colorScheme = store.effectiveColorMode();
      });
    },
  }),
);
