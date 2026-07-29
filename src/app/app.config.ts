import { provideHttpClient } from "@angular/common/http";
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from "@angular/core";
import { provideNativeDateAdapter } from "@angular/material/core";
import {
  PreloadAllModules,
  provideRouter,
  withPreloading,
} from "@angular/router";
import { routes } from "./app.routes";
import { ColorModeService } from "./core/color-mode/color-mode-service";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideNativeDateAdapter(),
    provideAppInitializer(() => {
      // Constructs the ColorModeService eagerly so the stored/system color
      // mode is read and applied to the document before the root component
      // is rendered, instead of waiting for whichever component happens to
      // inject it first (e.g. the Navbar).
      inject(ColorModeService);
    }),
  ],
};
