# Lokaler Kalendertag als einzige "heute"-Quelle

Status: ready-for-agent
Type: task
Blocked by: —

## Parent

`.scratch/due-date-reminders/PRD.md`

## What to build

Prefactor ohne sichtbare Funktionsänderung, mit einem echten Bugfix: "heute" wird
im Frontend an genau einer Stelle definiert und liefert den **lokalen**
Kalendertag statt des UTC-Tags.

Heute erzeugen drei Stellen "heute" per `new Date().toISOString().split("T")[0]`
(Task-Helpers, Task-Store, Task-API) und eine vierte, korrekte lokale Variante
liegt als private Funktion im Task-Form-Dialog. Für einen Nutzer östlich von UTC
ist damit zwischen Mitternacht und dem UTC-Tageswechsel der falsche Tag aktiv:
ein heute fälliger Task erscheint als überfällig, ein `completedAt` bekommt das
Datum von gestern.

Nach diesem Ticket gibt es eine Helper-Funktion in den Task-Helpers, die ein
`Date` als lokalen `YYYY-MM-DD`-String formatiert, plus eine, die den heutigen
lokalen Tag liefert. Alle Aufrufer nutzen sie; die private Kopie im Dialog
verschwindet. Verhalten bleibt sonst identisch — kein neues UI, keine neuen
Felder, keine Backend-Änderung.

- [ ] Task-Helpers exportieren eine Funktion, die ein `Date` nach lokalem
      Kalendertag als `YYYY-MM-DD` formatiert, und eine, die den heutigen lokalen
      Tag liefert
- [ ] Kein `toISOString()` mehr in `src/` zur Ermittlung eines Kalendertags
      (Task-Helpers, Task-Store, Task-API)
- [ ] Die private Datumsfunktion im Task-Form-Dialog ist entfernt; der Dialog
      nutzt den Helper
- [ ] Unit-Test belegt den Bugfix: mit auf eine Zone östlich von UTC gesetzter
      Prozess-Zeitzone (z. B. `Asia/Tokyo`; `process.env.TZ` ist zur Laufzeit
      umsetzbar) liefert ein Zeitpunkt kurz nach lokaler Mitternacht den lokalen
      Tag, nicht den UTC-Vortag. Der Test setzt die Zeitzone danach zurück
- [ ] Bestehende Unit-, BDD- und E2E-Suites bleiben grün; keine Änderung an
      Testerwartungen außer für die verschobenen Funktionen
