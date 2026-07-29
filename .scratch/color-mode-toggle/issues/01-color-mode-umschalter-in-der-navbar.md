# Color-Mode-Umschalter in der Navbar (System/Light/Dark)

Status: ready-for-agent
Type: task
Blocked by: —

## Parent

`.scratch/color-mode-toggle/PRD.md`

## What to build

Ein neuer `ColorModeService` (signalbasiert, analog zu bestehenden
Signal-Stores wie `PostStore`) trägt die gesamte Color-Mode-Logik:

- Zustand `Color Mode` mit den drei Werten System/Light/Dark, Default System.
- Abgeleiteter `Effective Color Mode` (immer Light oder Dark) — bei System
  über `matchMedia('(prefers-color-scheme: dark)')` ermittelt.
- Ein live `matchMedia`-Change-Listener, der `Effective Color Mode`
  aktualisiert, solange `Color Mode` auf System steht (nicht bei expliziter
  Light/Dark-Wahl).
- Eine Methode, die `Color Mode` in der Reihenfolge System → Light → Dark →
  System weiterschaltet.
- Anwenden des `Effective Color Mode` auf das Dokument (z. B. Klasse/Attribut
  auf `<html>`), damit das bestehende Material-3-Theme (`--mat-sys-*`-Tokens)
  entsprechend reagiert.

Die bestehende `Navbar`-Komponente bekommt einen Icon-Button, der bei Klick die
Weiterschalten-Methode des Service aufruft. Das Icon zeigt immer den
`Effective Color Mode`, nicht den rohen `Color Mode`-Wert — sonst wäre bei
"System" nicht erkennbar, was tatsächlich angezeigt wird. `Navbar` selbst
berechnet nichts.

Persistenz über Reloads hinweg ist **nicht** Teil dieses Tickets (folgt in
Ticket 2) — der Zustand darf beim Neuladen der Seite auf den Default (System)
zurückfallen.

## Acceptance criteria

- [ ] Ein Klick auf den Button in der Navbar schaltet sichtbar zwischen den
      drei Color Modes weiter, in der Reihenfolge System → Light → Dark →
      System
- [ ] Das Icon des Buttons entspricht stets dem `Effective Color Mode` (Light
      oder Dark), auch wenn `Color Mode` auf System steht
- [ ] Solange `Color Mode` auf System steht, folgt `Effective Color Mode` einer
      simulierten Änderung der Betriebssystem-Einstellung, ohne dass die Seite
      neu geladen werden muss
- [ ] Eine explizite Light- oder Dark-Wahl wird durch eine
      Betriebssystem-Änderung nicht überschrieben
- [ ] Die gesamte Logik liegt im `ColorModeService`; `Navbar` ruft nur dessen
      Methode auf und liest dessen Signal für das Icon
- [ ] Unit-Tests für `ColorModeService` (Vorbild: `post-store.spec.ts`) decken
      Default, Weiterschalten-Reihenfolge, `Effective Color Mode`-Ableitung und
      das Verhalten des `matchMedia`-Listeners ab
