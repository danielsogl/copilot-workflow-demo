# Tickets: Fälligkeits-Erinnerungen für Tasks

Fälligkeit wird zur ersten Klasse im Board — sichtbar auf jeder Karte, zählbar in
der Statistikzeile, filterbar in der Filterleiste. Quelle:
`.scratch/due-date-reminders/PRD.md`. Kein Backend-Anteil.

Arbeite die **Frontier**: jedes Ticket, dessen Blocker alle erledigt sind. 01 → 02
→ 03; danach sind 04 und 05 voneinander unabhängig und können parallel laufen.

| #                                                               | Ticket                                           | Blocked by |
| --------------------------------------------------------------- | ------------------------------------------------ | ---------- |
| [01](issues/01-lokaler-kalendertag-als-einzige-heute-quelle.md) | Lokaler Kalendertag als einzige "heute"-Quelle   | —          |
| [02](issues/02-faelligkeitsstatus-als-reine-funktion.md)        | Fälligkeitsstatus als reine Funktion             | 01         |
| [03](issues/03-faelligkeitshinweis-auf-der-task-karte.md)       | Fälligkeitshinweis auf der Task-Karte            | 02         |
| [04](issues/04-statistik-kacheln-heute-und-bald-faellig.md)     | Statistik-Kacheln "Heute fällig" / "Bald fällig" | 03         |
| [05](issues/05-faelligkeitsfilter-in-der-filterleiste.md)       | Fälligkeitsfilter in der Filterleiste            | 03         |

## Warum dieser Schnitt

- **01 ist ein Prefactor**, kein Feature: eine Definition von "heute" statt vier,
  und der bestehende UTC-vs-lokal-Bug fällt dabei weg. "Make the change easy,
  then make the easy change." Ohne 01 entsteht in 02 eine fünfte Datumskopie.
- **02 trägt die gesamte Logik** als reine Funktion mit übergebenem "heute". Das
  ist die Nahtstelle, an der alle folgenden Tests hängen; sie liefert noch nichts
  Sichtbares, macht aber jede folgende Scheibe testbar statt uhrabhängig.
- **03 ist die erste demobare Scheibe** und zieht dabei das "heute"-Signal und die
  angereicherten Board-Spalten in den Store — deshalb hängen 04 und 05 daran und
  nicht direkt an 02.
- **04 und 05 sind bewusst getrennt**: Statistik und Filter teilen keinen Code
  außer dem Fälligkeitsstatus und sind einzeln verifizierbar.

## Offene Punkte fürs Review

- Die Schwelle "3 Tage" für "bald fällig" ist frei gewählt (PRD, Annahme 4). Eine
  andere Zahl ist eine Zeile in Ticket 02 plus die betroffenen Testfälle.
- `status` (Board-Spalte) und `dueStatus` (Fälligkeitsnähe) nebeneinander sind
  eine Verwechslungsquelle in Reviews und Testnamen. Ein Glossar existiert im Repo
  noch nicht; die Begriffe gehören bei nächster Gelegenheit über
  `/domain-modeling` festgeschrieben. Kein Ticket, weil kein Code-Anteil.
