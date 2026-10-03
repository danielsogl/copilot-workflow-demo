import { ApplicationConfig } from "@angular/core";
import { provideNativeDateAdapter } from "@angular/material/core";
import {
  PreloadAllModules,
  provideRouter,
  withPreloading,
} from "@angular/router";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideNativeDateAdapter(),
  ],
};
