# Tickets: Color Mode Umschalter

Ein Color-Mode-Umschalter (System/Light/Dark) über einen Button in der Navbar.
Quelle: `.scratch/color-mode-toggle/PRD.md`. Kein Backend-Anteil.

Arbeite die **Frontier**: jedes Ticket, dessen Blocker alle erledigt sind.
Dieser Schnitt ist eine reine Kette: 01 → 02 → 03 → 04.

| #                                                                       | Ticket                                                  | Blocked by |
| ----------------------------------------------------------------------- | ------------------------------------------------------- | ---------- |
| [01](issues/01-color-mode-umschalter-in-der-navbar.md)                  | Color-Mode-Umschalter in der Navbar (System/Light/Dark) | —          |
| [02](issues/02-color-mode-praeferenz-per-localstorage-persistieren.md)  | Color-Mode-Präferenz per localStorage persistieren      | 01         |
| [03](issues/03-initialen-color-mode-vor-dem-ersten-rendern-anwenden.md) | Initialen Color Mode vor dem ersten Rendern anwenden    | 02         |
| [04](issues/04-e2e-abdeckung-fuer-den-color-mode-umschalter.md)         | E2E-Abdeckung für den Color-Mode-Umschalter             | 03         |

## Warum dieser Schnitt

- **01 ist die erste demobare Scheibe**: der komplette `ColorModeService` mit
  allen drei Zuständen, dem `matchMedia`-Listener und dem Navbar-Button — der
  Zustand fällt nur beim Reload noch auf System zurück. Das ist die eine
  Nahtstelle, die laut PRD die gesamte Logik trägt.
- **02 fügt Persistenz hinzu**, ohne 01 anzufassen: `localStorage` lesen/
  schreiben plus defensive Fehlerbehandlung. Erst danach macht ein Reload-Test
  überhaupt Sinn.
- **03 baut auf 02 auf**, nicht auf 01: die Initialisierung vor dem ersten
  Rendern liest denselben persistierten Wert, den 02 gerade erst eingeführt
  hat. Ohne 02 gäbe es nichts zu initialisieren außer dem ohnehin schon
  funktionierenden Default.
- **04 ist bewusst zuletzt**: der E2E-Test verifiziert den vollen Pfad
  (Klick, sichtbare Änderung, Reload-Persistenz, echter
  `provideAppInitializer`-Bootstrap) und ist erst aussagekräftig, wenn alle
  drei vorherigen Tickets stehen.

## Offene Punkte fürs Review

- Ticket 04 ist im PRD als optionale Nahtstelle markiert. Es ist hier trotzdem
  als eigenes Ticket aufgenommen, damit es unabhängig eingeplant oder
  gestrichen werden kann, ohne 01–03 anzufassen.
- Der im PRD benannte Restrisiko-Punkt (kurzes Aufblitzen vor dem Laden des
  JS-Bundles) ist in Ticket 03 explizit als akzeptiert dokumentiert, nicht als
  Bug für ein weiteres Ticket.
