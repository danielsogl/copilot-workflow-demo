# E2E-Abdeckung für den Color-Mode-Umschalter

Status: ready-for-agent
Type: task
Blocked by: 03

## Parent

`.scratch/color-mode-toggle/PRD.md`

## What to build

Ein neuer Playwright-Spec (Vorbild: `tests/mobile/navbar-collapse.spec.ts`),
der den vollen, mit Unit-Tests nicht erreichbaren Pfad im echten Browser
abdeckt: echtes `localStorage`, echter `provideAppInitializer`-Bootstrap,
sichtbare Erscheinungsbild-Änderung.

## Acceptance criteria

- [ ] Ein Klick auf den Color-Mode-Button in der Navbar ändert sichtbar das
      Erscheinungsbild der Seite
- [ ] Nach einem Reload der Seite ist weiterhin derselbe Color Mode aktiv wie
      vor dem Reload
- [ ] Der Test läuft gegen die echte Anwendung (kein Mocking von
      `localStorage` oder `matchMedia`)
