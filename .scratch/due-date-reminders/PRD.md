# Fälligkeits-Erinnerungen für Tasks

Status: ready-for-agent

Quelle: Backlog-Ticket, Volltext: _"Die Nutzer beschweren sich, dass sie den
Überblick verlieren. Wir brauchen sowas wie Fälligkeits-Erinnerungen für Tasks."_

Mehr stand nicht im Ticket. Alles unten ist aus dem bestehenden Code und dem
einen Satz synthetisiert. Die Stellen, an denen synthetisiert wurde, stehen
explizit unter **Angenommen**.

## Angenommen (nicht im Ticket belegt)

Diese Annahmen tragen die ganze Spec. Wenn eine davon falsch ist, ändert sich
der Zuschnitt — nicht nur ein Detail.

1. **"Erinnerung" heißt in-app, nicht Push/Mail.** Das Backend
   (`backend/TaskApi`) hat keinen User-Begriff, keine Auth, keinen Scheduler und
   keinen persistenten Zustand — der `TaskStore` ist eine geteilte In-Memory-Liste,
   die beim Neustart zurückgesetzt wird. Push, E-Mail oder Browser-Notifications
   bräuchten alle drei fehlenden Bausteine zuerst. Ausgeliefert wird deshalb
   Sichtbarkeit im Board, keine Zustellung nach außen.
2. **"Überblick verlieren" heißt: Fälligkeitsnähe ist unsichtbar.** Das Board
   gruppiert ausschließlich nach `status`. Fälligkeit existiert heute nur als
   (a) roter Rahmen auf überfälligen Karten und (b) eine Zahl in
   `DashboardStats`, die zudem nur bei `> 0` gerendert wird. Ein Task, der morgen
   fällig ist, sieht exakt aus wie einer, der in drei Monaten fällig ist. Genau
   diese Lücke wird geschlossen.
3. **Es gibt keine Nutzeridentität.** Also keine persönlichen Erinnerungs-
   einstellungen, keine gespeicherte Snooze-Historie, keine Vorlaufzeit pro Task.
4. **"Bald fällig" = die nächsten 3 Kalendertage.** Frei gewählt, im Ticket steht
   keine Zahl. Deshalb genau **eine** benannte Konstante, damit die Korrektur ein
   Einzeiler ist.
5. **"Heute" ist der lokale Kalendertag des Clients.** `dueDate` ist ein reiner
   Datums-String (`YYYY-MM-DD`), keine Zeitzone im Modell. Serverseitige
   Zeitzonenauflösung wäre ohne User-Profil sowieso geraten.
6. **Erledigte Tasks erinnern nie.** Entspricht dem heutigen Verhalten von
   `isOverdue`, das bei `status === "completed"` abbricht.

Ein Domain-Glossar existiert im Repo noch nicht. Der hier eingeführte Begriff
**Fälligkeitsstatus / `DueStatus`** ist neue Sprache und gehört bei nächster
Gelegenheit über `/domain-modeling` festgeschrieben — zusammen mit der
Abgrenzung `status` (Spalte im Board) vs. `dueStatus` (Fälligkeitsnähe), die
sich sonst garantiert vermischt.

## Problem Statement

Ein Nutzer öffnet das Board und sieht drei Spalten nach Bearbeitungsstand. Was er
nicht sieht: was als Nächstes dran ist. Ob ein Task morgen fällig ist oder in
drei Monaten, ist der Karte nicht anzusehen — beide zeigen nur ein formatiertes
Datum im Footer. Überfälligkeit wird zwar rot markiert, aber zu diesem Zeitpunkt
ist es bereits zu spät; eine Erinnerung, die erst nach dem Termin auslöst, ist
keine Erinnerung.

Es gibt außerdem keine Möglichkeit, das Board auf "was ist zeitkritisch"
einzuschränken. Gefiltert wird nach Freitext und Priorität — beides sagt nichts
über Termine. Bei wachsender Task-Zahl bedeutet das: der Nutzer scannt alle
Spalten manuell und vergleicht Datumsangaben im Kopf. Das ist der "Überblick
verlieren" aus dem Ticket.

## Solution

Fälligkeit wird zur ersten Klasse im Board — sichtbar auf jeder Karte, zählbar in
der Statistikzeile, filterbar in der Filterleiste.

Jeder Task bekommt einen abgeleiteten **Fälligkeitsstatus**: `overdue`,
`due-today`, `due-soon` oder `upcoming`. Der Status wird nicht gespeichert,
sondern aus `dueDate`, `status` und dem heutigen Datum berechnet.

Daraus folgen drei sichtbare Änderungen:

- **Auf der Karte**: statt eines stillen Datums ein sprechender Hinweis —
  "Überfällig", "Heute fällig", "In 2 Tagen" — visuell abgestuft von dringend zu
  ruhig. Ein Task, der morgen fällig ist, sticht heraus, bevor er rot wird.
- **In der Statistikzeile**: neben der bestehenden Überfällig-Kachel je eine
  Kachel für "Heute fällig" und "Bald fällig". Das ist die Erinnerung auf einen
  Blick, ohne eine einzige Karte zu lesen.
- **In der Filterleiste**: Fälligkeits-Chips neben den bestehenden Prioritäts-
  Chips. Ein Klick auf "Überfällig" reduziert das Board auf genau das, was brennt.

Kein neuer Screen, keine neue Route, kein Notification Center, keine Backend-
Änderung.

## User Stories

1. Als Task-Board-Nutzer möchte ich auf jeder Karte sehen, wie nah der Fälligkeitstermin ist, damit ich Dringlichkeit erkenne, ohne Daten im Kopf zu vergleichen.
2. Als Task-Board-Nutzer möchte ich, dass eine heute fällige Karte deutlich anders aussieht als eine in drei Monaten fällige, damit mein Blick zuerst auf das Richtige fällt.
3. Als Task-Board-Nutzer möchte ich gewarnt werden, _bevor_ ein Task überfällig ist, damit die Erinnerung noch handlungsfähig ist.
4. Als Task-Board-Nutzer möchte ich statt eines rohen Datums eine relative Angabe ("In 2 Tagen") sehen, damit ich nicht selbst rechnen muss.
5. Als Task-Board-Nutzer möchte ich das exakte Datum weiterhin einsehen können, damit die relative Angabe nichts verdeckt, was ich für eine Terminplanung brauche.
6. Als Task-Board-Nutzer möchte ich auf einen Blick die Anzahl heute fälliger Tasks sehen, damit ich mein Tagespensum kenne, ohne zu scrollen.
7. Als Task-Board-Nutzer möchte ich die Anzahl bald fälliger Tasks sehen, damit ich meine Woche planen kann.
8. Als Task-Board-Nutzer möchte ich die Überfällig-Zahl weiterhin sehen, damit sich mein bisheriger Blickpfad nicht ändert.
9. Als Task-Board-Nutzer möchte ich das Board auf überfällige Tasks filtern können, damit ich Rückstand abarbeiten kann, ohne abgelenkt zu werden.
10. Als Task-Board-Nutzer möchte ich auf heute fällige Tasks filtern können, damit ich eine Tagesliste bekomme.
11. Als Task-Board-Nutzer möchte ich auf bald fällige Tasks filtern können, damit ich vorausplanen kann.
12. Als Task-Board-Nutzer möchte ich den Fälligkeitsfilter mit einem zweiten Klick auf denselben Chip aufheben, damit er sich wie die vorhandenen Prioritäts-Chips verhält.
13. Als Task-Board-Nutzer möchte ich Fälligkeitsfilter, Prioritätsfilter und Suche kombinieren können, damit ich "überfällige High-Priority-Tasks" in einem Schritt bekomme.
14. Als Task-Board-Nutzer möchte ich, dass ein Fälligkeitsfilter über alle drei Spalten wirkt, damit ich nichts übersehe, das in einer anderen Spalte liegt.
15. Als Task-Board-Nutzer möchte ich, dass die Statistik-Kacheln die Gesamtlage zeigen und nicht die gefilterte Ansicht, damit mir der Filter nicht die Zahlen wegnimmt, die mich gerade gewarnt haben.
16. Als Task-Board-Nutzer möchte ich, dass erledigte Tasks nie als überfällig oder fällig erinnern, damit abgeschlossene Arbeit keinen falschen Alarm erzeugt.
17. Als Task-Board-Nutzer möchte ich, dass eine Karte sofort ihren Fälligkeitshinweis verliert, wenn ich sie nach "Done" ziehe, damit die Anzeige meiner Handlung folgt.
18. Als Task-Board-Nutzer möchte ich, dass sich der Fälligkeitshinweis sofort aktualisiert, wenn ich das Fälligkeitsdatum im Bearbeiten-Dialog ändere, damit ich die Wirkung meiner Änderung direkt sehe.
19. Als Nutzer mit Screenreader möchte ich den Fälligkeitsstatus als Text vermittelt bekommen, damit ich nicht auf Farbe angewiesen bin.
20. Als farbfehlsichtiger Nutzer möchte ich Dringlichkeit zusätzlich über Text und Icon erkennen, damit Rot-vs-Orange nicht der einzige Träger der Information ist.
21. Als Mobilnutzer möchte ich, dass der Fälligkeitshinweis auch in der gestapelten Board-Ansicht lesbar bleibt, damit die vorhandenen Mobile-Garantien nicht brechen.
22. Als Nutzer in einer Zeitzone östlich von UTC möchte ich, dass "heute" mein Kalendertag ist, damit ein Task um 01:00 Uhr morgens nicht fälschlich als überfällig erscheint.
23. Als Entwickler möchte ich die Fälligkeitsberechnung mit einem übergebenen "Heute" testen können, damit Tests nicht von der Systemuhr abhängen und nächstes Jahr rot werden.

## Implementation Decisions

**Nahtstellen (Seams).** Zwei, davon eine bestehende. Der Skill verlangt die
höchstmögliche und möglichst wenige Nahtstellen; hier trägt die Kombination aus
einer reinen Funktion und einem Store-Computed die gesamte Logik, die UI bleibt
dumm. Diese Wahl wurde nicht rückgefragt (ausdrücklich so beauftragt) und ist
damit selbst eine Annahme:

- **Bestehend, primär für Logik**: die reinen Funktionen in
  `features/tasks/util/task-helpers`. Hier liegt die Datumsarithmetik. Bereits
  mit Unit- und BDD-Tests abgedeckt.
- **Bestehend, primär für Verhalten**: die Computed-Signals des `TaskStore`.
  Hier liegen Zählung, Filterung und die Anreicherung der Board-Spalten.

Die UI-Komponenten sind ausdrücklich **keine** neue Nahtstelle: `TaskCard`,
`DashboardStats` und `TaskFilters` bekommen nur zusätzliche Inputs bzw. Outputs
und dürfen selbst nicht rechnen.

**Der Fälligkeitsstatus ist abgeleitet, nicht gespeichert.** Kein neues Feld auf
`Task`, keine Migration, kein neues Backend-Feld. `dueDate` reicht vollständig
aus.

```ts
type DueStatus = "overdue" | "due-today" | "due-soon" | "upcoming";
```

**Die Datumsberechnung bekommt "heute" als Parameter — das ist die eigentliche
Testbarkeitsentscheidung.** Die Kernfunktion nimmt Task und heutiges Datum
entgegen und gibt den `DueStatus` zurück. Kein Default-Argument, das
`new Date()` aufruft — das würde die gerade geschaffene Naht sofort wieder
zuschütten. Das Repo verlangt dieselbe Disziplin bereits im Backend
(`TimeProvider` statt `DateTime.Now`); dies ist das Frontend-Äquivalent.

**`isOverdue` bleibt erhalten, wird aber zum Spezialfall** des neuen
Fälligkeitsstatus, statt eine zweite, parallel driftende Datumsvergleichs-Logik
zu sein.

**Bestehender Zeitzonen-Bug wird an der Wurzel behoben, weil wir ohnehin genau
dort arbeiten.** Heute wird "heute" an drei Stellen mit
`new Date().toISOString().split("T")[0]` erzeugt — das ist der **UTC**-Tag,
verglichen mit einem lokal gemeinten `dueDate`. Für einen Nutzer in UTC+2 ist
zwischen 00:00 und 02:00 Uhr der falsche Tag aktiv. Eine vierte Kopie hinzuzufügen
wäre die schlechteste Variante. Stattdessen: **eine** Helper-Funktion, die ein
`Date` nach lokalem Kalendertag als `YYYY-MM-DD` formatiert; alle Aufrufer nutzen
sie. Eine korrekte lokale Variante existiert bereits — als private Funktion im
Task-Form-Dialog; sie wandert zu den Task-Helpers und wird dort die einzige
Quelle. Danach gibt es genau eine Definition von "heute" im Frontend.

**Der Store besitzt "heute" als Signal.** Alle Fälligkeitsableitungen hängen
daran. Zwei Konsequenzen: die UI berechnet nirgends selbst ein Datum, und Tests
können den Tag setzen, ohne globale Uhren zu fälschen. Auf einen Timer, der das
Signal über Mitternacht hinweg fortschreibt, wird bewusst verzichtet (siehe _Out
of Scope_).

**Die Board-Spalten liefern angereicherte Tasks.** Die bestehenden Computeds
`todoTasks` / `inProgressTasks` / `completedTasks` filtern und sortieren bereits —
sie hängen zusätzlich den `dueStatus` an. Der so entstehende Typ bleibt
zuweisungskompatibel zu `Task`, wodurch die Edit-/Delete-/Move-Outputs von
Board, Spalte und Karte unverändert bleiben. Damit entfällt die Alternative, den
Status über drei Komponentenebenen als separaten Input durchzureichen.

**`TaskCard` rechnet nicht mehr.** Der heutige `isOverdue`-Aufruf in der Karte
entfällt ersatzlos; die Karte rendert nur noch, was ihr Task mitbringt. Damit
verschwindet der letzte `new Date()`-Aufruf aus einer Presentational Component.

**Der Fälligkeitsfilter ist Zustand im Store**, analog zum bestehenden
`priorityFilter`: ein nullbarer Wert plus ein Setter, und eine zusätzliche
Bedingung im bestehenden `filteredTasks`. Er kombiniert sich dadurch
automatisch mit Suche und Priorität.

**Die Statistik-Zählungen bleiben ungefiltert.** Die vorhandenen Counts zählen
heute schon über alle Entities statt über `filteredTasks`; die neuen Zählungen
für "heute fällig" und "bald fällig" folgen dieser Konvention. Eine Warnzahl, die
der eigene Filter wegblendet, wäre eine Falle.

**`TaskFilters` bekommt ein zweites Chip-Set.** Das Prioritäts-Chip-Set mit
Toggle-Verhalten existiert bereits; das Fälligkeits-Set wird nach demselben
Muster gebaut. Kein neues Control, kein Dropdown, kein Datumsbereichs-Picker.

**`DashboardStats` bekommt zwei zusätzliche Zahlen-Inputs**, gerendert im
bestehenden Kachelmuster. Die Kacheln für "heute fällig" und "bald fällig"
erscheinen — wie die Überfällig-Kachel heute — nur bei einem Wert `> 0`, damit
ein leeres Board nicht mit Nullen zugestellt wird.

**Dringlichkeit wird redundant kodiert**, nicht allein über Farbe: Text plus
Icon plus Farbe. Die Karte nutzt das vorhandene Tooltip- und Badge-Vokabular
weiter; für den Screenreader ist die Statusangabe Text und nicht nur eine
CSS-Klasse.

**Farben kommen aus den `--mat-sys-*`-Tokens** des bestehenden Themes. Keine
Hex-Werte im Komponenten-Stylesheet.

**Das Backend bleibt unangetastet.** Keine neue Route, kein neues Feld auf
`TaskItem`, keine Änderung an `TaskStore.Patch`. `dueDate` wird bereits
übertragen und gepatcht.

## Testing Decisions

**Was ein guter Test hier ist**: er prüft, was ein Nutzer beobachten kann — "ein
morgen fälliger Task wird als bald fällig ausgewiesen" — und nicht, wie es
zustande kommt. Konkret bedeutet das: keine Assertions auf CSS-Klassennamen als
Selbstzweck, keine Prüfung interner Signal-Namen, kein Nachbau der
Datumsarithmetik in der Erwartung. Und vor allem: **kein Test hängt an der
Systemuhr** — genau dafür existiert der "heute"-Parameter.

**Getestet werden zwei Ebenen**, passend zu den beiden Nahtstellen:

1. **Die reinen Task-Helpers** — hier liegt die Beweislast für die Randfälle.
   Vorbild ist die bestehende Datei mit den Unit-Tests der Helper und, für die
   Grenzwerttabelle, die vorhandene BDD-Variante mit `vitest-cucumber` samt
   `.feature`-Datei; das dortige `ScenarioOutline`-Muster ist für diese
   Schwellenwerte gemacht.

   Pflicht-Randfälle: gestern (überfällig), heute (heute fällig), morgen (bald),
   letzter Tag innerhalb der Schwelle (bald), erster Tag außerhalb (upcoming),
   sowie ein erledigter Task mit weit zurückliegendem Datum (nie fällig).
   Zusätzlich ein Fall über einen Monatswechsel — Datumsarithmetik bricht genau
   dort.

   Für den behobenen Zeitzonen-Bug: ein Test, der belegt, dass "heute" aus dem
   lokalen Kalendertag abgeleitet wird und nicht aus dem UTC-Tag. Ohne diesen
   Test kehrt die `toISOString()`-Variante beim nächsten Copy-Paste zurück.

2. **Der `TaskStore`** — hier liegt die Beweislast für Zählung und Filterung.
   Vorbild ist der vorhandene Store-Test des Posts-Features (TestBed-Injection,
   `provideZonelessChangeDetection`, gemockte API); der Task-Store hat bisher
   keinen eigenen Test, dieser entsteht neu nach demselben Muster.

   Abzudecken: die neuen Zählungen bei bekanntem "heute"; dass die Zählungen vom
   aktiven Filter unberührt bleiben; dass der Fälligkeitsfilter sich mit Suche
   und Priorität kombiniert; dass die Board-Spalten den Fälligkeitsstatus
   mitliefern; dass ein Verschieben nach "Done" den Fälligkeitshinweis entfernt.

**Komponententests** werden knapp gehalten, weil die Komponenten nach dieser
Änderung nichts mehr entscheiden. Vorbild ist der bestehende
`DashboardStats`-Spec (`componentRef.setInput`, `provideZonelessChangeDetection`,
Assertion auf gerenderten Text). Genau zwei Dinge sind es wert: dass die
Fälligkeits-Kacheln bei `0` nicht rendern, und dass die Karte den Statustext für
assistive Technologie ausgibt. Die Karte hat bereits einen Spec, in den das
hineingehört.

**End-to-End** wird der Filter-Pfad abgedeckt, weil er über mehrere Komponenten
geht: Fälligkeits-Chip klicken, Board reduziert sich, zweiter Klick hebt auf.
Vorbild sind die vorhandenen Filter-E2E-Tests samt der Route-Mock-Fixture mit
ihren `SEED_TASKS`.

**Ein E2E-Fallstrick, der sonst garantiert zuschlägt**: die Seed-Daten in der
Fixture haben feste Datumsangaben (Februar 2026). Ein Test für "bald fällig"
gegen feste Daten ist ab einem bestimmten Kalendertag dauerhaft rot. Lösung ohne
eigene Mechanik: Playwrights eingebaute Uhr-Kontrolle (`page.clock`) auf einen
festen Zeitpunkt setzen, der zu den vorhandenen Seed-Daten passt. Damit bleiben
die Seed-Daten unverändert und der Test ist datumsfest.

**Nicht getestet wird** die genaue Formulierung der Hinweistexte (ändert sich
ohne Verhaltensänderung), das Styling der Kacheln, und der Zeitzonen-Bug über
tatsächliches Umstellen der Systemzeitzone — der Parameter macht das überflüssig.

**Backend**: keine Änderung, also keine neuen xUnit-Tests. Die bestehende
`TaskStore`-Suite bleibt unberührt.

## Out of Scope

- **Zustellung außerhalb der App**: Push-Notifications, Browser-Notification-API,
  E-Mail-Digest, Slack, Service Worker, Hintergrund-Sync. Setzt Nutzeridentität
  und persistentes Backend voraus (Annahme 1).
- **Snooze / "später erinnern"** — bräuchte gespeicherten Zustand pro Nutzer.
- **Erinnerungs-Vorlaufzeit pro Task** ("erinnere 2 Tage vorher"). Eine globale
  Schwelle zuerst; individuelle Vorlaufzeit ist ein eigenes Ticket.
- **Konfigurierbare Schwelle in der UI.** Eine benannte Konstante im Code, keine
  Einstellungsseite.
- **Wiederkehrende Tasks** und daraus abgeleitete Serientermine.
- **Sortierung des Boards nach Fälligkeit.** Die Spalten sind per Drag & Drop
  manuell geordnet und schreiben `order` zurück; eine automatische Sortierung
  würde gegen die Nutzeraktion arbeiten. Fälligkeit wird gefiltert, nicht
  umsortiert.
- **Uhrzeiten an Fälligkeitsterminen.** `dueDate` bleibt tagesgenau.
- **Kalenderexport (ICS) oder Kalender-Sync.**
- **Automatischer Datumswechsel über Mitternacht** in einer offenen Session. Die
  Ableitung nutzt den Tag, der beim Laden gilt. Ein Timer, der um Mitternacht
  alle Ableitungen neu berechnet, ist Aufwand für einen Fall, den ein Reload löst.
- **Nachträgliche Zeitzonenauflösung serverseitig** (Annahme 5).
- **Eigene Erinnerungs-Ansicht / Notification Center** als Route.

## Further Notes

- **Die Schwelle "3 Tage" ist der wahrscheinlichste Rückfrage-Punkt.** Sie steht
  bewusst als einzelne benannte Konstante an einer Stelle. Wenn im Review eine
  andere Zahl fällt, ist das eine Zeile plus die betroffenen Testfälle — kein
  Redesign.
- **Reihenfolge der Umsetzung**, falls das in Tickets zerlegt wird: zuerst die
  Datumskonsolidierung samt Zeitzonen-Fix in den Task-Helpers (macht alles
  Weitere testbar), dann die Store-Ableitungen, dann die drei UI-Oberflächen
  Karte / Statistik / Filter. Die UI-Teile sind untereinander unabhängig.
- **Netto-Effekt auf die Codebasis ist eher Konsolidierung als Zuwachs**: vier
  verstreute Ad-hoc-Datumsberechnungen werden zu einer, und die Presentational
  Component verliert ihre Uhr-Abhängigkeit. Das ist der Grund, den Zeitzonen-Bug
  hier mitzunehmen statt separat zu ticketen — die Zeilen werden ohnehin angefasst.
- **Es gibt bislang keine ADRs im Repo**, also kein Konflikt zu melden. Falls die
  Regel "kein Datum wird in einer UI-Komponente berechnet" dauerhaft gelten soll,
  wäre sie ein guter erster ADR-Kandidat.
- **Begriffsklärung vor der Umsetzung empfohlen**: `status` und `dueStatus`
  nebeneinander sind eine Verwechslungsquelle in Code-Reviews und Testnamen.
  Siehe die Notiz zum Domain-Glossar oben.
