# Statistik-Kacheln "Heute fällig" und "Bald fällig"

Status: ready-for-agent
Type: task
Blocked by: 03

## Parent

`.scratch/due-date-reminders/PRD.md`

## What to build

Die Erinnerung auf einen Blick: neben der bestehenden Überfällig-Kachel je eine
Kachel für "Heute fällig" und "Bald fällig". Der Nutzer kennt sein Tagespensum,
ohne eine einzige Karte zu lesen oder zu scrollen.

Die Zählungen entstehen als Computeds im Store aus dem Fälligkeitsstatus und
zählen — wie die vorhandenen Counts — über **alle** Tasks, nicht über
`filteredTasks`. Eine Warnzahl, die der eigene Filter wegblendet, wäre eine
Falle. Die Überfällig-Zahl bleibt, damit sich der bisherige Blickpfad nicht
ändert.

`DashboardStats` bekommt zwei zusätzliche Zahlen-Inputs und rendert sie im
bestehenden Kachelmuster; die Komponente rechnet nicht. Wie die Überfällig-Kachel
erscheinen die neuen nur bei einem Wert `> 0`, damit ein leeres Board nicht mit
Nullen zugestellt wird.

- [ ] Store-Computeds für "heute fällig" und "bald fällig", abgeleitet aus dem
      Fälligkeitsstatus bei bekanntem "heute"
- [ ] Die Zählungen bleiben von Suche und aktiven Filtern unberührt
- [ ] `DashboardStats` rendert beide Kacheln im vorhandenen Muster und rechnet
      selbst nichts
- [ ] Bei Wert `0` rendert die jeweilige Kachel nicht
- [ ] Erledigte Tasks zählen nie mit
- [ ] Store-Spec deckt die Zählungen bei bekanntem "heute" ab und belegt, dass
      ein aktiver Filter sie nicht verändert
- [ ] Komponenten-Spec belegt das Nicht-Rendern bei `0` (Vorbild: bestehender
      `DashboardStats`-Spec mit `componentRef.setInput`)
- [ ] Der bestehende `tests/dashboard-stats.spec.ts`-E2E bleibt grün
