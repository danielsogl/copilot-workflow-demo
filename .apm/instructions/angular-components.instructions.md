---
description: Angular component conventions — standalone, signals, OnPush, modern control flow, HTTP.
applyTo: "**/*.ts,**/*.html"
---

- **Standalone only.** No `NgModule`. No `CommonModule` / `RouterModule` imports — import specific directives (`RouterLink`).
- **Signals over decorators** — `input()`, `output()`, `model()`, `computed()`, `linkedSignal()`, `resource()`, `httpResource()`. Never `@Input()` / `@Output()`.
- **OnPush on every component.** Tests use `provideZonelessChangeDetection()`.
- **Modern control flow** in templates: `@if`, `@for` (with `track`), `@switch`, `@let`. Never `*ngIf` / `*ngFor`.
- **HTTP** — `httpResource()` for reactive component reads, `HttpClient` inside `rxMethod` pipelines for mutations.
