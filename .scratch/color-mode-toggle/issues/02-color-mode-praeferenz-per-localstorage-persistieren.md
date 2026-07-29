# Color-Mode-Präferenz per localStorage persistieren

Status: ready-for-agent
Type: task
Blocked by: 01

## Parent

`.scratch/color-mode-toggle/PRD.md`

## What to build

Der `ColorModeService` aus Ticket 1 liest und schreibt `Color Mode` nun aus
bzw. nach `localStorage` (Persistenzentscheidung siehe
`docs/adr/0001-localstorage-for-color-mode-preference.md` — erste Verwendung
von Client-seitigem Storage in dieser Codebase). Beim Start wird ein
gespeicherter Wert übernommen; jede spätere Änderung über den Button wird
sofort zurückgeschrieben.

Zugriffe auf `localStorage` sind defensiv behandelt (z. B. try/catch): ist
`localStorage` nicht verfügbar (deaktiviert, privates Fenster, o. Ä.), verhält
sich die App wie ohne gespeicherte Präferenz — Default System für die
laufende Session — ohne Exception und ohne die App zu blockieren.

Kein Backend-Anteil: `TaskApi` bleibt unberührt, Color Mode ist reiner
Frontend-/Browser-Zustand.

## Acceptance criteria

- [ ] Eine über den Button gewählte Light- oder Dark-Einstellung bleibt nach
      einem Neuladen der Seite erhalten
- [ ] Ohne gespeicherten Wert startet die App weiterhin im Default System
- [ ] Jede Änderung des `Color Mode` wird unmittelbar nach `localStorage`
      geschrieben
- [ ] Ein simulierter Fehler beim Zugriff auf `localStorage` (z. B. Exception
      beim Lesen/Schreiben) führt nicht dazu, dass der Service unbrauchbar wird
      oder die App abstürzt
- [ ] Unit-Tests decken: gespeicherter Wert wird beim Start korrekt gelesen,
      jede Änderung wird geschrieben, und der Fehlerfall (`localStorage` wirft)
      wird abgefangen
