# Fälligkeitsstatus als reine Funktion

Status: ready-for-agent
Type: task
Blocked by: 01

## Parent

`.scratch/due-date-reminders/PRD.md`

## What to build

Die Datumsarithmetik der ganzen Feature-Kette, als reine Funktion in den
Task-Helpers — noch ohne UI. Aus Task und einem **übergebenen** heutigen Datum
entsteht ein Fälligkeitsstatus:

```ts
type DueStatus = "overdue" | "due-today" | "due-soon" | "upcoming";
```

"Bald fällig" heißt: innerhalb der nächsten 3 Kalendertage. Die 3 steht als
**eine** benannte Konstante an einer Stelle, damit eine andere Zahl im Review ein
Einzeiler bleibt.

Entscheidend ist die Signatur: "heute" ist ein Pflichtparameter, kein
Default-Argument mit `new Date()`. Das ist die Naht, an der alle Tests hängen —
schüttet man sie mit einem Default zu, hängt die halbe Suite wieder an der
Systemuhr. Das Backend hält dieselbe Disziplin bereits mit `TimeProvider` statt
`DateTime.Now`.

`isOverdue` bleibt bestehen, wird aber zum Spezialfall dieser Funktion statt
einer zweiten, parallel driftenden Datumslogik. Dabei bekommt auch `isOverdue`
"heute" als Pflichtparameter; die zwei heutigen Aufrufer (Task-Store, Task-Card)
übergeben vorerst den lokalen Tag aus Ticket 01. Der Aufruf in der Karte
verschwindet in Ticket 03 ersatzlos.

- [ ] `DueStatus`-Typ und eine reine Funktion `(task, heute) => DueStatus` in den
      Task-Helpers, ohne Default-Argument für "heute"
- [ ] Die Schwelle für "bald fällig" ist genau eine benannte Konstante
- [ ] Erledigte Tasks liefern nie einen fälligen Status, auch bei weit
      zurückliegendem Datum
- [ ] `isOverdue` ist über die neue Funktion definiert, nicht über einen zweiten
      Datumsvergleich, und nimmt "heute" als Parameter
- [ ] Grenzwerte abgedeckt: gestern, heute, morgen, letzter Tag innerhalb der
      Schwelle, erster Tag außerhalb, plus ein Fall über einen Monatswechsel
- [ ] Die Grenzwerttabelle liegt als `ScenarioOutline` in der bestehenden
      `.feature`-Datei der Task-Helpers, passend zur vorhandenen BDD-Spec
- [ ] Kein Test liest die Systemuhr
