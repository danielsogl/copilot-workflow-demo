# Fälligkeitshinweis auf der Task-Karte

Status: ready-for-agent
Type: task
Blocked by: 02

## Parent

`.scratch/due-date-reminders/PRD.md`

## What to build

Die erste sichtbare Scheibe: jede Karte im Board zeigt, wie nah ihr Termin ist —
"Überfällig", "Heute fällig", "In 2 Tagen" — statt eines stillen Datums im
Footer. Ein morgen fälliger Task sticht heraus, bevor er rot wird.

Dazu bekommt der Store "heute" als eigenes Signal (initialisiert aus dem Helper
von Ticket 01) und hängt den Fälligkeitsstatus an die Tasks der drei
Board-Spalten. Der angereicherte Typ bleibt zuweisungskompatibel zu `Task`, damit
Edit-/Delete-/Move-Outputs von Board, Spalte und Karte unverändert bleiben — der
Status wird nicht als separater Input durch drei Komponentenebenen gereicht.

Die Karte rechnet danach nichts mehr: der `isOverdue`-Aufruf in der Karte
entfällt ersatzlos, der letzte `new Date()`-Aufruf verlässt die Presentational
Component. Dringlichkeit wird redundant kodiert — Text plus Icon plus Farbe,
nicht Farbe allein.

Dass Store-Tests hier zum ersten Mal existieren, ist Absicht: der Task-Store hat
bisher keinen eigenen Spec. Vorbild ist der vorhandene Store-Test des
Posts-Features (TestBed-Injection, `provideZonelessChangeDetection`, gemockte
API).

- [ ] Der Store hält "heute" als Signal; alle Fälligkeitsableitungen hängen daran
      und ein Test kann den Tag setzen, ohne globale Uhren zu fälschen
- [ ] Die Board-Spalten liefern Tasks samt Fälligkeitsstatus; die bestehenden
      Outputs und ihre Typen ändern sich nicht
- [ ] Die Karte zeigt einen sprechenden, relativen Fälligkeitshinweis, visuell
      abgestuft von dringend zu ruhig
- [ ] Das exakte Datum bleibt einsehbar (bestehendes Tooltip-/Badge-Vokabular)
- [ ] Der Status ist für Screenreader als Text vermittelt, nicht nur als
      CSS-Klasse; Text und Icon tragen die Information auch ohne Farbe
- [ ] Farben ausschließlich über `--mat-sys-*`-Tokens, keine Hex-Werte im
      Komponenten-Stylesheet
- [ ] Kein `new Date()` und kein Datums-Rechnen mehr in der Karte
- [ ] Verschieben nach "Done" nimmt der Karte sofort den Fälligkeitshinweis;
      Ändern des Fälligkeitsdatums im Bearbeiten-Dialog aktualisiert ihn sofort
- [ ] Der Hinweis bleibt in der gestapelten Mobile-Board-Ansicht lesbar; die
      vorhandenen Mobile-E2E-Garantien bleiben grün
- [ ] Store-Spec deckt ab: Spalten liefern den Status bei bekanntem "heute", und
      ein Move nach "Done" entfernt ihn
- [ ] Der bestehende Karten-Spec prüft den ausgegebenen Statustext für assistive
      Technologie (nicht die genaue Formulierung als Selbstzweck, nicht das
      Styling)
