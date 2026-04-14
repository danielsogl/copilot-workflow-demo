import { DOCUMENT } from "@angular/common";
import { Injectable, effect, inject, signal } from "@angular/core";

export type ThemeMode = "light" | "dark" | "system";

@Injectable({ providedIn: "root" })
export class Theme {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = "theme-mode";

  readonly mode = signal<ThemeMode>(this.getInitialMode());

  constructor() {
    effect(() => {
      const mode = this.mode();
      this.document.documentElement.style.colorScheme =
        mode === "system" ? "light dark" : mode;
      localStorage.setItem(this.storageKey, mode);
    });
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  private getInitialMode(): ThemeMode {
    const stored = localStorage.getItem(this.storageKey);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }

    return "system";
  }
}
