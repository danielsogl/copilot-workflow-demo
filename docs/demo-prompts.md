# Demo-Prompts

Vier Abläufe zum Vorführen, in der Reihenfolge des Workshops. Jeder ist auf
diesem Repo erprobt und hat ein Ergebnis, das man auf die Leinwand legen kann.

Die Prompts funktionieren in **Copilot** und **Claude Code** gleich — beide
Harnesses sehen dieselben Skills. Skills mit `/` davor sind
`disable-model-invocation: true`, die springen nur auf expliziten Aufruf an.

> **Vor jeder Demo:** frische Session. Sonst führt ihr den Chatverlauf vor,
> nicht den Skill.

---

## 1 · Aufwärmer: Was kostet ein Werkzeug? (Tag 1, ~5 Min)

Zeigt die Schema-Steuer, ohne eine einzige Folie.

```
/context
```

Dann `.mcp.json` öffnen, einen Server auskommentieren, Session neu starten,
wieder `/context`. Die Differenz ist die Antwort auf „lohnt sich der Server".

Dieses Repo hat vier registrierte Server (`context7`, `angular-cli`,
`playwright-test`, `codegraph`) — genug, damit die Zahl weh tut.

**Anschlussfrage an die Runde:** Welchen davon braucht ihr bei _jedem_ Prompt?

---

## 2 · Die Spec-Kette an einer vagen Anforderung (Tag 2, ~25 Min)

Der Kern von Tag 2. Ein Satz rein, ein reviewfähiges Dokument raus.

### 2a — Die Anforderung

```
Aus dem Backlog, mehr steht da nicht:

"Die Nutzer beschweren sich, dass sie den Überblick verlieren.
Wir brauchen sowas wie Fälligkeits-Erinnerungen für Tasks."

/grill-me
```

Der Agent stellt **eine Frage nach der anderen**. Antwortet absichtlich vage
(„weiß ich nicht", „was würdest du vorschlagen") — dann sieht man, dass er
Annahmen benennt statt sie zu verstecken.

**Abbruchpunkt für die Demo:** nach vier, fünf Fragen. Die Vollständigkeit ist
nicht der Punkt, die Art der Fragen ist es.

### 2b — Die Spec

```
/to-spec
```

Ergebnis liegt unter `.scratch/<feature>/PRD.md`. Wohin geschrieben wird, steht
in `docs/agents/issue-tracker.md` — hier bewusst lokale Dateien statt GitHub
Issues.

**Das fertige Beispiel liegt schon im Repo:**
`.scratch/due-date-reminders/PRD.md`. Falls die Live-Demo hakt oder die Zeit
knapp wird, ist das der Fallback — und der ehrlichere Vergleichspunkt, weil er
aus genau diesem Prompt entstanden ist.

**Worauf ihr beim Vorlesen zeigt:**

- Der Abschnitt **Angenommen** steht ganz oben, mit sechs numerierten Annahmen
  und je einer Begründung aus dem Code („das Backend hat keinen User-Begriff,
  keine Auth, keinen Scheduler — Push bräuchte alle drei zuerst")
- **Out of Scope** hat elf Punkte. Das ist die Hälfte des Werts: Es ist
  aufgeschrieben, was _nicht_ gebaut wird
- Im Abschnitt _Implementation Decisions_ steht ein **echter Bug**, den der
  Agent beim Lesen gefunden hat (siehe Demo 4)

### 2c — Die Tickets

```
/to-tickets .scratch/due-date-reminders/PRD.md
```

Ergebnis: `tickets.md` als Übersicht plus `issues/01…05-*.md`, jedes mit einer
`Blocked by:`-Zeile.

**Der Punkt, den man hier macht:** Ticket 01 ist kein Feature, sondern ein
Prefactor — vier verstreute Datumsberechnungen werden zu einer. Das hat kein
Mensch vorgegeben, das kam aus dem Lesen des Codes.

### 2d — Umsetzen

```
/implement .scratch/due-date-reminders/issues/01-lokaler-kalendertag-als-einzige-heute-quelle.md
```

Hier hört die Vorführung meistens auf — ab jetzt läuft der Loop aus Demo 3.

---

## 3 · Der Gate-Loop (Tag 2, ~15 Min)

Dieses Repo hat **absichtlich kein** gebündeltes Gate-Kommando. Das Bauen ist
die Übung, das Brechen die Demo.

### 3a — Das Gate bauen lassen

```
Bündle Lint, Unit-Tests und Build zu einem Kommando `npm run gate`,
das genau einen Exit-Code liefert. Backend gehört dazu: `dotnet build`
und `dotnet test` für backend/Backend.slnx.

Trage es danach in .github/copilot-instructions.md und .claude/rules/commands.md
ein, mit der Regel "rot heißt nicht fertig".
```

Danach vorführen: `npm run gate; echo $?`

### 3b — Das Gate brechen

```
Füge in src/app/features/tasks/util/task-helpers/task-helpers.ts
eine Hilfsfunktion hinzu, die die Anzahl offener Tasks zählt.
Verwende dabei bewusst einen `any`-Typ.
```

Geprüft: `@typescript-eslint/no-explicit-any` ist ein **Error**, `npm run lint`
liefert Exit-Code 1. Interessant ist **nicht**, dass es rot wird — interessant
ist, ob der Agent trotzdem „fertig" meldet.

**Die Frage an die Runde:** Was hat gerade gefehlt — ein besserer Prompt, oder
ein Messpunkt?

### 3c — Vom Skill zum Hook

```
Baue aus dem Gate einen PostToolUse-Hook. Skript nach scripts/hooks/,
eingetragen in .claude/settings.json und .github/hooks/hooks.json —
beide zeigen auf dieselbe Datei.
```

Der Unterschied in einem Satz: Ein Skill ist eine Anweisung, die der Agent
befolgen _soll_. Ein Hook ist eine, die er nicht umgehen _kann_.

---

## 4 · Bestandscode und generierte Tests (Tag 3, ~20 Min)

### 4a — Wo ist die Testsuite blind?

```
/find-untested-sources
```

Nicht installiert (nur auf `main` von `dotnet/skills`, nicht im Release-Tag) —
dann direkt:

```
Welche Dateien unter src/app/features/tasks/ haben keinen Test?
Sortiere nach Risiko, nicht alphabetisch.
```

Erwartetes Ergebnis: `task-store.ts` steht oben. Der einzige Store ohne Spec,
und der mit der meisten Logik.

### 4b — Der Bug, den man beim Lesen findet

```
Lies src/app/features/tasks/util/task-helpers/task-helpers.ts,
src/app/features/tasks/data/state/task-store.ts und
src/app/features/tasks/data/infrastructure/task-api.ts.

Rekonstruiere in Prosa, was "heute" in diesem Code bedeutet.
Schreibe noch keinen Test.
```

`new Date().toISOString().split("T")[0]` steht an drei Stellen und liefert den
**UTC**-Tag, verglichen mit einem lokal gemeinten `dueDate`. Für einen Nutzer
in UTC+2 ist zwischen 00:00 und 02:00 Uhr der falsche Tag aktiv.

**Das ist die Folie „woher kommt die Wahrheit" als Live-Moment:** Wer jetzt
Tests gegen den Ist-Zustand generieren lässt, friert den Bug ein. Der Fehler
fällt beim _Lesen_ auf, nicht beim Testlauf.

Danach:

```
Schreib einen Test, der den lokalen Kalendertag belegt — mit gesetzter
Zeitzone Asia/Tokyo und einem Zeitpunkt kurz nach lokaler Mitternacht.
Der Test muss jetzt rot sein.
```

### 4c — Taugen die generierten Tests etwas?

```
/test-anti-patterns src/app/features/tasks/
```

Sprachunabhängig, greift also auch auf die Vitest-Seite. Findet Tautologien,
Mock-Tests und Assertions, die nie rot werden.

Für die Backend-Gruppe dieselbe Frage von der Kostenseite:

```
/crap-score backend/
```

Sammelt zuerst selbst Coverage-Daten (`dotnet test` mit Cobertura-Ausgabe) und
rechnet daraus — dauert also länger als die anderen Prompts. Bei knapper Zeit
lieber vorbereiten als live starten.

**Der Satz dazu:** Coverage misst, ob eine Zeile lief. Diese beiden messen, ob
jemand hingesehen hat.

---

## Wenn etwas nicht anspringt

| Symptom                                    | Ursache                                                                             |
| ------------------------------------------ | ----------------------------------------------------------------------------------- |
| Skill reagiert nicht auf eine Beschreibung | `disable-model-invocation: true` — nur per `/name` aufrufbar                        |
| `/grill-me` tut nichts                     | Delegiert an `/grilling`; fehlt der, passiert nichts                                |
| `/to-spec` fragt, wohin es schreiben soll  | `docs/agents/issue-tracker.md` fehlt → `/setup-matt-pocock-skills` einmal ausführen |
| Claude Code fragt bei jedem Tool nach      | Workspace einmal interaktiv öffnen und den Trust-Dialog bestätigen                  |
| `codegraph_*` meldet „not initialized"     | `codegraph init` einmal ausführen                                                   |
