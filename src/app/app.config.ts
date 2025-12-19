import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from "@angular/core";
import {
  PreloadAllModules,
  provideRouter,
  withPreloading,
} from "@angular/router";

import { provideNativeDateAdapter } from "@angular/material/core";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideNativeDateAdapter(),
  ],
};
