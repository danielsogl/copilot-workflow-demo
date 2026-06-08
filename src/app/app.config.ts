import { provideHttpClient } from "@angular/common/http";
import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from "@angular/core";
import { provideNativeDateAdapter } from "@angular/material/core";
import {
  PreloadAllModules,
  provideRouter,
  withPreloading,
} from "@angular/router";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideNativeDateAdapter(),
  ],
};
