import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from "@angular/core";
import {
  PreloadAllModules,
  provideRouter,
  withPreloading,
} from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideNativeDateAdapter } from "@angular/material/core";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
  ],
};
