# Color Mode Umschalter

Status: ready-for-agent

Quelle: Nutzeranfrage, Volltext: _"Als User möchte ich in der bestehenden
Web-App den Color Modus der App switchen können. Es sollte den System, Light
und Dark Mode geben. Gesteuert über einen entsprechenden Button in der
Navbar."_

Diese Spec wurde in einer `/grilling`-Session mit `/domain-modeling`
erarbeitet. Das Domain-Glossar liegt in [`CONTEXT.md`](../../CONTEXT.md), die
Persistenz-Entscheidung in
[`docs/adr/0001-localstorage-for-color-mode-preference.md`](../../docs/adr/0001-localstorage-for-color-mode-preference.md).

## Problem Statement

Die App folgt heute ausschließlich dem Betriebssystem-Farbschema
(`color-scheme: light dark` in `styles.scss`, kombiniert mit dem
Angular-Material-3-Theme über `--mat-sys-*`-Tokens). Ein Nutzer, der die App
z. B. bewusst hell nutzen möchte, obwohl sein Betriebssystem auf Dunkel
gestellt ist (oder umgekehrt), hat dafür keine Möglichkeit — die Wahl liegt
vollständig außerhalb der App. Es gibt weder eine sichtbare Kontrolle dafür
noch eine gespeicherte Präferenz.

## Solution

Ein neuer, umschaltbarer **Color Mode** (System / Light / Dark) wird
eingeführt und über einen Button in der Navbar gesteuert. `Color Mode` ist die
Nutzerpräferenz; `Effective Color Mode` ist der daraus abgeleitete, tatsächlich
gerenderte Zustand (immer Light oder Dark) — siehe `CONTEXT.md` für die
verbindliche Abgrenzung gegenüber dem bestehenden Begriff `Theme` (der
Material-Farbpalette).

Der Button ist ein einzelner, zyklischer Icon-Button (kein Menü) in der
bestehenden `Navbar`. Ein Klick wechselt in der Reihenfolge
System → Light → Dark → System. Das Icon zeigt stets den `Effective Color
Mode`, nicht den rohen `Color Mode`-Wert — sonst wäre bei "System" nicht
erkennbar, was tatsächlich angezeigt wird.

Die Wahl wird in `localStorage` gespeichert und bleibt über Reloads und
neue Sessions hinweg erhalten (Default beim allerersten Besuch: System).
Solange `Color Mode` auf System steht, folgt der `Effective Color Mode` live
Änderungen der Betriebssystem-Einstellung (`matchMedia`-Listener) — genau das
Verhalten, das die App heute bereits kostenlos über `color-scheme: light dark`
bekommt, und das nicht regredieren soll.

## User Stories

1. Als Nutzer möchte ich einen Button in der Navbar sehen, mit dem ich den
   Color Mode der App ändern kann, damit ich die Kontrolle über das
   Erscheinungsbild habe.
2. Als Nutzer möchte ich zwischen System, Light und Dark wählen können, damit
   ich entweder dem Betriebssystem folge oder eine feste Wahl treffe.
3. Als neuer Nutzer (ohne gespeicherte Präferenz) möchte ich, dass die App
   standardmäßig im System-Modus startet, damit sich beim ersten Besuch nichts
   gegenüber dem heutigen Verhalten ändert.
4. Als Nutzer möchte ich, dass ein Klick auf den Button den Modus in der
   Reihenfolge System → Light → Dark → System weiterschaltet, damit das
   Verhalten vorhersehbar ist.
5. Als Nutzer möchte ich, dass das Icon des Buttons erkennen lässt, ob die App
   gerade hell oder dunkel dargestellt wird — auch wenn ich "System"
   ausgewählt habe — damit ich nicht rätseln muss, was "System" gerade
   bedeutet.
6. Als wiederkehrender Nutzer möchte ich, dass meine zuletzt gewählte
   Color-Mode-Einstellung beim nächsten Öffnen der App noch aktiv ist, damit
   ich sie nicht bei jedem Besuch neu setzen muss.
7. Als Nutzer, der die App im System-Modus geöffnet lässt, möchte ich, dass
   sich das Erscheinungsbild automatisch anpasst, wenn mein Betriebssystem
   zwischen Hell und Dunkel wechselt (z. B. durch eine geplante
   Nachtmodus-Umschaltung), ohne dass ich die Seite neu laden muss.
8. Als Nutzer, der explizit Light oder Dark gewählt hat, möchte ich, dass
   diese Wahl bestehen bleibt, auch wenn sich die Betriebssystem-Einstellung
   ändert, damit meine bewusste Entscheidung nicht überschrieben wird.
9. Als Nutzer möchte ich beim Laden der Seite möglichst kein kurzes Aufblitzen
   des falschen Farbmodus sehen, damit der Seitenaufbau nicht visuell stört.
10. Als Entwickler möchte ich, dass die gesamte Color-Mode-Logik (Lesen,
    Schreiben, Ableiten des Effective Color Mode, Reagieren auf
    Systemänderungen) an einer einzigen Stelle liegt, damit `Navbar` und
    andere Komponenten selbst nichts davon berechnen müssen.
11. Als Entwickler möchte ich, dass die Color-Mode-Präferenz unabhängig von
    Backend oder Nutzerkonten funktioniert, damit die Funktion ohne
    Backend-Änderung auskommt (die App hat heute keine Nutzeridentität).
12. Als Nutzer mit `localStorage` deaktiviert oder in einem privaten
    Browser-Fenster möchte ich, dass die App trotzdem nutzbar bleibt (Fallback
    auf System für die laufende Session), damit ein Speicherfehler die App
    nicht blockiert.

## Implementation Decisions

**Nahtstelle (Seam).** Eine einzige, neue: ein signalbasierter
`ColorModeService` (analog zu bestehenden Signal-Stores wie `PostStore`), der
die gesamte Logik trägt:

- Liest die gespeicherte Präferenz aus `localStorage` beim Start.
- Hält `Color Mode` (System/Light/Dark) als Zustand.
- Leitet `Effective Color Mode` (Light/Dark) daraus ab — bei System über
  `matchMedia('(prefers-color-scheme: dark)')`.
- Reagiert live auf Änderungen dieses `matchMedia`-Listeners, solange `Color
Mode` auf System steht.
- Bietet eine Methode zum Weiterschalten (System → Light → Dark → System).
- Schreibt jede Änderung sofort zurück nach `localStorage`.
- Wendet den `Effective Color Mode` auf das Dokument an (z. B. Klasse/Attribut
  auf `<html>`), damit CSS/Material-Theme entsprechend reagieren kann.

`Navbar` bekommt **keine eigene Logik** — nur den Button, der die Methode des
Service aufruft, und ein Icon, das den `Effective Color Mode`-Signal-Wert des
Service anzeigt.

**Initialisierung vor dem ersten Rendern.** Die anfängliche Ermittlung von
`Color Mode`/`Effective Color Mode` (aus `localStorage`, mit Fallback auf
`matchMedia`) erfolgt über `provideAppInitializer` in `app.config.ts`, damit
der Zustand vor dem Rendern der Root-Komponente feststeht. Ein
Restrisiko bleibt bewusst bestehen: der allererste Browser-Paint (bevor das
JS-Bundle geladen ist) kann kurz das system-präferierte Aussehen zeigen, falls
die gespeicherte Wahl davon abweicht — das wurde bewusst gegen die Komplexität
eines zusätzlichen Inline-Scripts in `index.html` abgewogen und akzeptiert.

**Persistenzmechanismus:** `localStorage`, dokumentiert in ADR 0001. Erste
Verwendung von Client-seitigem Storage in dieser Codebase.

**Kein neues Backend-Feld, keine Migration.** `TaskApi` bleibt unberührt —
Color Mode ist reiner Frontend-/Browser-Zustand, keine Nutzerkontendaten.

**Fehlerfall `localStorage` nicht verfügbar:** Lesen/Schreiben wird
defensiv behandelt (z. B. try/catch); bei Fehlschlag verhält sich die App wie
ohne gespeicherte Präferenz (Default System für die laufende Session), ohne
die App zu blockieren.

## Testing Decisions

**Was ein guter Test hier ist:** er prüft beobachtbares Verhalten — "wenn
Color Mode auf System steht und das Betriebssystem Dark meldet, ist der
Effective Color Mode Dark" — nicht interne Implementierungsdetails wie den
genauen `localStorage`-Key-Namen oder CSS-Klassennamen als Selbstzweck.

**Primäre Nahtstelle: `ColorModeService`.** Unit-getestet mit `TestBed` +
`provideZonelessChangeDetection`, Vorbild ist `post-store.spec.ts`
(`PostStore`). `localStorage` und `window.matchMedia` werden gemockt, damit
Tests nicht vom echten Browser-Zustand abhängen. Abzudecken:

- Default ist System, wenn `localStorage` leer ist.
- Gespeicherter Wert wird beim Start korrekt gelesen und als `Color Mode`
  übernommen.
- Weiterschalten folgt exakt der Reihenfolge System → Light → Dark → System.
- `Effective Color Mode` ist bei Light/Dark identisch mit `Color Mode`; bei
  System entspricht er dem gemockten `matchMedia`-Ergebnis.
- Ein simulierter `matchMedia`-Change-Event aktualisiert `Effective Color
Mode` live, aber **nur** wenn `Color Mode` auf System steht (nicht bei
  expliziter Light/Dark-Wahl).
- Jede Änderung des `Color Mode` wird nach `localStorage` geschrieben.
- Ein Fehler beim Zugriff auf `localStorage` führt nicht zu einer Exception,
  die den Service unbrauchbar macht.

**Dünne Nahtstelle: `Navbar`.** Falls überhaupt komponentenseitig getestet,
knapp gehalten (Vorbild: bestehende, flache Component-Specs mit
`componentRef.setInput`/Signal-Mocking): Klick auf den Button ruft die
Weiterschalten-Methode des Service auf; das angezeigte Icon entspricht dem
`Effective Color Mode`-Signal. Es wird **nicht** erneut geprüft, was bereits im
Service-Test abgedeckt ist.

**Optionale E2E-Nahtstelle:** ein neuer Playwright-Spec (Vorbild:
`tests/mobile/navbar-collapse.spec.ts`), der den vollen Pfad abdeckt, den ein
Unit-Test nicht erreicht: Klick auf den Button ändert sichtbar das
Erscheinungsbild, und ein Reload der Seite zeigt weiterhin denselben
Modus (echtes `localStorage`, echter `provideAppInitializer`-Bootstrap).

## Out of Scope

- Kein Backend-seitiges Speichern der Präferenz (keine Nutzerkonten
  vorhanden).
- Kein Menü/Dropdown für die Auswahl — bewusst ein einzelner zyklischer
  Button, keine drei separaten Steuerelemente.
- Kein Eliminieren des allerersten Browser-Paint-Flashs über ein
  Inline-Script in `index.html` — bewusst zugunsten von
  `provideAppInitializer` zurückgestellt (siehe Implementation Decisions).
- Keine Synchronisierung der Präferenz zwischen mehreren Geräten/Browsern.
- Keine Änderung an der Material-Farbpalette (`Theme`/`_theme-colors.scss`) —
  ausschließlich Light/Dark-Umschaltung.

## Further Notes

Domain-Glossar (`Color Mode`, `Effective Color Mode`, Abgrenzung zu `Theme`)
liegt in [`CONTEXT.md`](../../CONTEXT.md). Die Entscheidung für
`localStorage` als Persistenzmechanismus ist in
[`docs/adr/0001-localstorage-for-color-mode-preference.md`](../../docs/adr/0001-localstorage-for-color-mode-preference.md)
festgehalten — beides sollte bei der Umsetzung als bindend behandelt werden.
