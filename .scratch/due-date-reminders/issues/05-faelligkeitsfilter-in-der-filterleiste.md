# Fälligkeitsfilter in der Filterleiste

Status: ready-for-agent
Type: task
Blocked by: 03

## Parent

`.scratch/due-date-reminders/PRD.md`

## What to build

Das Board lässt sich auf "was ist zeitkritisch" einschränken: Fälligkeits-Chips
neben den bestehenden Prioritäts-Chips. Ein Klick auf "Überfällig" reduziert das
Board auf genau das, was brennt; ein zweiter Klick auf denselben Chip hebt den
Filter wieder auf — exakt wie die Prioritäts-Chips sich heute verhalten.

Der Filter ist Zustand im Store, analog zum vorhandenen Prioritätsfilter: ein
nullbarer Wert, ein Setter, eine zusätzliche Bedingung im bestehenden
`filteredTasks`. Dadurch kombiniert er sich automatisch mit Suche und Priorität
("überfällige High-Priority-Tasks" in einem Schritt) und wirkt über alle drei
Spalten. Die Statistik-Kacheln bleiben ungefiltert.

`TaskFilters` bekommt ein zweites Chip-Set nach dem vorhandenen Toggle-Muster —
kein neues Control, kein Dropdown, kein Datumsbereichs-Picker.

Der E2E-Fallstrick, der sonst garantiert zuschlägt: die Seed-Daten der
Route-Mock-Fixture haben feste Datumsangaben (Februar 2026). Ein Test für "bald
fällig" gegen feste Daten ist ab einem bestimmten Kalendertag dauerhaft rot.
Lösung ohne eigene Mechanik: Playwrights eingebaute Uhr-Kontrolle (`page.clock`)
auf einen festen Zeitpunkt setzen, der zu den vorhandenen Seed-Daten passt. Die
Seed-Daten bleiben unverändert.

- [ ] Fälligkeitsfilter als nullbarer Zustand im Store plus Setter, ausgewertet
      im bestehenden `filteredTasks`
- [ ] Filtern auf überfällig, heute fällig und bald fällig ist möglich
- [ ] Zweiter Klick auf denselben Chip hebt den Filter auf
- [ ] Fälligkeitsfilter, Prioritätsfilter und Suche kombinieren sich
- [ ] Der Filter wirkt über alle drei Spalten
- [ ] Die Statistik-Kacheln zeigen weiterhin die Gesamtlage, nicht die gefilterte
      Ansicht
- [ ] Store-Spec belegt die Kombination aus Fälligkeit, Priorität und Suche
- [ ] E2E über den Filter-Pfad (Chip klicken → Board reduziert sich → zweiter
      Klick hebt auf), datumsfest über `page.clock`, im Muster der vorhandenen
      Filter-E2E-Tests
- [ ] `tests/mobile/task-filters-mobile.spec.ts` bleibt grün; die Chips brechen
      die Mobile-Garantien nicht
