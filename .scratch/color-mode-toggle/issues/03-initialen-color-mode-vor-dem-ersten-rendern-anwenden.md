# Initialen Color Mode vor dem ersten Rendern anwenden

Status: ready-for-agent
Type: task
Blocked by: 02

## Parent

`.scratch/color-mode-toggle/PRD.md`

## What to build

Die anfängliche Ermittlung von `Color Mode`/`Effective Color Mode` (aus
`localStorage`, mit Fallback auf `matchMedia` für System) wird über
`provideAppInitializer` in `app.config.ts` angestoßen, sodass der Zustand
feststeht, bevor die Root-Komponente gerendert wird. Damit entfällt ein
Aufblitzen des falschen Farbmodus auf Ebene der Angular-Komponenten.

Ein Restrisiko bleibt bewusst bestehen und ist kein Fehler dieses Tickets: der
allererste Browser-Paint, bevor das JS-Bundle geladen ist, kann kurz das
system-präferierte Aussehen zeigen, falls die gespeicherte Wahl davon abweicht
(siehe PRD, Out of Scope — bewusst gegen ein zusätzliches Inline-Script in
`index.html` abgewogen).

## Acceptance criteria

- [x] `provideAppInitializer` liest die gespeicherte Präferenz (bzw. ermittelt
      den System-Fallback) und wendet den `Effective Color Mode` auf das
      Dokument an, bevor die Root-Komponente erstmals gerendert wird
- [x] Ein Neuladen der Seite mit gespeicherter Light- oder Dark-Präferenz zeigt
      keinen sichtbaren Wechsel des Farbmodus innerhalb der Angular-Anwendung
      nach dem ersten Rendern der Root-Komponente
- [x] Der bereits bestehende `ColorModeService` wird wiederverwendet, keine
      zweite, parallele Initialisierungslogik entsteht
