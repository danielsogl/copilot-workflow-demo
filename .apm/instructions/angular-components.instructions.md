---
description: Angular component conventions — standalone, signals, Angular 22 defaults, modern control flow, HTTP.
applyTo: "**/*.ts,**/*.html"
---

- **Standalone only.** No `NgModule`. No `CommonModule` / `RouterModule` imports — import specific directives (`RouterLink`).
- **Signals over decorators** — `input()`, `output()`, `model()`, `computed()`, `linkedSignal()`, `resource()`, `httpResource()`. Never `@Input()` / `@Output()`.
- **Rely on the Angular 22 defaults.** OnPush and zoneless are the default: no `changeDetection` in `@Component`, no `provideZonelessChangeDetection()` in `app.config.ts` or tests. `HttpClient` is provided in root — no `provideHttpClient()` unless you need interceptors; HTTP specs use `provideHttpClientTesting()`.
- **Modern control flow** in templates: `@if`, `@for` (with `track`), `@switch`, `@let`. Never `*ngIf` / `*ngFor`.
- **HTTP** — `httpResource()` for reactive component reads, `HttpClient` inside `rxMethod` pipelines for mutations.
