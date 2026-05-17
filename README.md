# Projektdokumentation - TriBalance

## Inhaltsverzeichnis

1. [Ausgangslage](#1-ausgangslage)
2. [Lösungsidee](#2-lösungsidee)
3. [Vorgehen & Artefakte](#3-vorgehen--artefakte)
    1. [Understand & Define](#31-understand--define)
    2. [Sketch](#32-sketch)
    3. [Decide](#33-decide)
    4. [Prototype](#34-prototype)
        1. [Entwurf (Design)](#341-entwurf-design)
        2. [Umsetzung (Technik)](#342-umsetzung-technik)
    5. [Validate](#35-validate)
4. [Erweiterungen](#4-erweiterungen)
5. [Projektorganisation](#5-projektorganisation)
6. [KI-Deklaration](#6-ki-deklaration)
7. [Anhang [Optional]](#7-anhang-optional)

---

## 1. Ausgangslage
- **Problem:** Triathleten konzentrieren sich im Training oft rein auf physische Metriken wie Distanz, Herzfrequenz und Uhrzeit. Die mentale Verfassung, das Stresslevel und das subjektive Schmerzempfinden werden im Trainingsalltag vernachlässigt. Diese Disbalance gefährdet langfristig die Gesundheit, begünstigt Übertraining und blockiert den sportlichen Erfolg.
- **Ziele:** Entwicklung eines interaktiven Multi-Sport-Logbuchs, das physische Leistungsdaten (Dauer, Distanz, Kalorien) nahtlos mit einem "Mental-Strength-Log" verknüpft, um Zusammenhänge zwischen Psyche und Leistung aufzuzeigen.
- **Primäre Zielgruppe:** Ambitionierte Triathleten (Schwimmen, Radfahren, Laufen), die eine ganzheitliche Übersicht über ihre physische und psychische Belastung suchen.

## 2. Lösungsidee
- **Kernfunktionalität:**
  * Erfassung von Trainingseinheiten via interaktivem Echtzeit-Formular (Sportart, Distanz, Dauer).
  * Integriertes Tracking der psychischen Verfassung (Mental Score) und des Fokus-Levels.
  * Zentrales Dashboard zur Visualisierung physischer Statistiken gepaart mit mentalen Trends.
  * Historische Übersicht zur Reflexion vergangener Belastungsphasen.

## 3. Vorgehen & Artefakte

### 3.1 Understand & Define
- **Wesentliche Erkenntnisse:** Es fehlt am Markt ein zugängliches Tool, das physische Leistung und psychische Belastbarkeit einfach miteinander verknüpft, ohne den User nach dem Sport mit komplexen medizinischen Fragebögen zu überlasten.
- **How-Might-We-Frage:** Wie könnten wir Triathleten helfen, den Zusammenhang zwischen ihrer mentalen Stärke und ihrem physischen Training im Alltag unkompliziert sichtbar zu machen?

### 3.2 Sketch
- **Variantenüberblick:** Erstellung von 8 Konzeptvarianten für das zentrale Log-Feature mittels der *Crazy 8s* Methodik.
- **Skizzen:** Der Fokus lag auf unterschiedlichen Interaktionsansätzen wie einem "Kalender-Fokus", einem schnellen "Emoji-Tagebuch" oder einer geführten "Chat-Eingabe".

### 3.3 Decide
- **Gewählte Variante & Begründung:** Eine Kombination aus einer strukturierten Kalenderansicht für historische Daten und einem zentralen, direkt geladenen Dashboard. Diese Kombination bietet die beste zeitliche Übersicht bei gleichzeitig schneller visueller Rückmeldung über den aktuellen Zustand.
- **Mockup:** Erstellt in Figma unter konsequenter Einhaltung eines *Mobile-First-Ansatzes*, da Triathleten ihre Einheiten oft unmittelbar nach dem Training noch unterwegs oder in der Umkleidekabine loggen möchten.

### 3.4 Prototype

#### 3.4.1. Entwurf (Design)
- **Informationsarchitektur:** Um eine klare Trennung zwischen Datenerfassung und Datenvisualisierung zu schaffen, wurde das ursprüngliche Single-Page-Design in ein Multi-Route-System überführt:
  * `/trainings` (Write): Dedizierte Route für die Trainingserfassung via Echtzeit-Tracker.
  * `/dashboard` (Read): Zentrale Übersicht, die historische Einträge aggregiert darstellt.
- **Globales Layout und Navigation (`+layout.svelte`):** Das Layout bildet das funktionale Gerüst der Applikation. Es wurde primär nach Desktop-First-Prinzipien entwickelt, bietet jedoch durch reaktive CSS-Klassen eine vollständige mobile Adaption. 
- **Designentscheidungen:** * **Sidebar-Logik:** Auf Viewports > 1024px ist eine 280px breite Sidebar fixiert. Dies minimiert die kognitive Last, da Navigationselemente stets sichtbar sind.
  * **Mobile Adaption:** Über Tailwind Media-Queries bricht die Sidebar auf Smartphones in einen Bottom-Drawer um (*Thumb-Zone*-Design), was die Einhandbedienung erleichtert.
  * **Floating Action Button (FAB):** Ein zentraler "+"-Button dient auf Mobilgeräten als primärer Call-to-Action (CTA), um die Interaktionskosten beim Starten eines Trainings zu minimieren.
  * **Slider-Eingabe:** Nutzung eines numerischen Sliders (1-5) für den Mental-Fokus zur Senkung der Hürde bei der Dateneingabe.

#### 3.4.2. Umsetzung (Technik)
- **Technologie-Stack:** SvelteKit (HTML/CSS/JavaScript), Tailwind CSS (Layout & Design), MongoDB (Datenbank-Persistenz via offiziellen `mongodb`-Treiber).
- **Die Tracker-Komponente (`Tracker.svelte`):** Kombiniert zeitliche Erfassung mit räumlicher Logik.
  * **Echtzeit-Stoppuhr:** Über ein `setInterval` implementiert, das die Dauer berechnet und über Svelte-Reaktivität sofort im UI spiegelt.
  * **Geolocation & Haversine-Formel:** Zur Berechnung der zurückgelegten Distanz ohne externe API-Kosten nutzt die Komponente die native Web Geolocation API des Browsers. Die Distanz zwischen zwei GPS-Koordinatenpunkten wird über die Haversine-Formel berechnet:
    $$d = 2r \arcsin\left(\sqrt{\sin^2\left(\frac{\phi_2-\phi_1}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\lambda_2-\lambda_1}{2}\right)}\right)$$
  * **SSR-Sicherheit:** Da die `navigator.geolocation`-API im Server-Side-Rendering von SvelteKit nicht existiert, wurde die gesamte Sensor-Logik in den `onMount`-Lifecycle-Hook gekapselt, um Server-Abstürze zu verhindern.
  * **Robustheit:** Ein eingebauter Glitch-Filter ignoriert fehlerhafte GPS-Sprünge, falls die Distanz zwischen zwei Messpunkten unrealistisch hoch ausfällt.
- **Migration auf Svelte 5 (Runes):** Die Reaktivitäts-Logik wurde von Svelte 4 (`export let`, `$:`) vollständig auf die modernen Svelte 5 Runes (`$state`, `$derived`, `$props`) refactored. Dies führt zu einer performanteren Synchronisation zwischen den GPS-Sensordaten und der Benutzeroberfläche.
- **Analytics & Datenfluss:** Daten werden von der `Tracker.svelte`-Komponente via Custom Events an das Page-Level-Formular (`+page.svelte`) übergeben. Von dort erfolgt die Übermittlung an die serverseitige Logik (`+page.server.js`) via SvelteKit Form Actions. Unter Integration der `calories.js` wird bei jedem Speichervorgang automatisch der energetische Aufwand basierend auf MET-Faktoren (Metabolic Equivalent of Task) berechnet.

#### 🛠️ Technische Sanierung & Datenbank-Krimi (Bugfix-Dokumentation)
Während der Entwicklung traten kritische Fehler bei der Anbindung der entfernten MongoDB Atlas Datenbank auf. Die Behebung wurde wie folgt dokumentiert:

1. **Stabilität der Umgebungsvariablen (`src/lib/server/db.js`):**
   * *Problem:* SvelteKit verlor beim Hot-Reloading im Entwicklungsmodus temporär die statische Verbindung zur `.env`-Datei. Dies führte zu `undefined`-Fehlern (`startsWith`) beim Initialisieren des `MongoClient`.
   * *Lösung:* Umstellung vom statischen Import auf das dynamische private SvelteKit-Modul (`import { env } from '$env/dynamic/private'`), um die URI zur Laufzeit jederzeit sicher auszulesen.
2. **Netzwerk- & DNS-Blockaden im Hochschulnetz:**
   * *Problem:* Restriktive Firewalls im Uni-WLAN blockierten die modernen MongoDB `mongodb+srv://` DNS-SRV-Abfragen. Dies führte lokal reproduzierbar zu `ECONNREFUSED`-Verbindungsabbrüchen.
   * *Lösung:* Modifikation der Verbindungs-URI in der `.env` auf den direkten, dedizierten Shard-Cluster-Verbindungsweg über Port `27017`. Dies umgeht den gesperrten DNS-SRV-Lookup vollständig.
3. **Authentifizierung & URL-Konformität:**
   * *Problem:* Ein Sonderzeichen (`!`) im Datenbank-Passwort führte zu einem Parsing-Fehler innerhalb der Verbindungs-URL. Zudem besaß der Standard-Datenbank-User unzureichende Privilegien, was in einem `MongoServerError: bad auth : authentication failed` resultierte.
   * *Lösung:* Erstellung eines neuen, dedizierten Datenbank-Nutzers (`joel`) ohne URL-kritische Sonderzeichen in MongoDB Atlas, ausgestattet mit der expliziten Rolle `Read and write to any database`.
   * **Erweiterung der Datenerfassung (17. Mai 2026):**
  * Implementierung einer serverseitigen SvelteKit Form Action (`src/routes/trainings/+page.server.js`), welche die Formulardaten asynchron via `use:enhance` entgegennimmt.
  * Integration einer strikten serverseitigen Typ-Validierung (Konvertierung von Strings in numerische `Number`-Typen für Distanz, Dauer, Pain-Level und Mental-Score).
  * Erfolgreiche Verknüpfung mit der exportierten `trainings`-Collection aus `db.js` zur persistenten Speicherung in MongoDB Atlas sowie automatische Weiterleitung (`redirect`) auf die `/statistiken`-Route nach erfolgreichem Write-In.

### 3.5 Validate
- **Ziele der Prüfung:** Testen, ob Triathleten das Koppeln von physischer Dauer und dem subjektiven Mental-Score intuitiv verstehen und ob das UI während der Bewegung (Tracking) fehlerfrei bedienbar bleibt.
- **Zusammenfassung der Resultate:** Der Prototyp verhält sich in der Datenerfassung stabil. Das Erfassen über Slider verringert die Eingabehürde nach dem Training signifikant.

## 4. Erweiterungen
### 4.1 Automatisches Warnsystem (Mental & Physisch)
- **Beschreibung & Nutzen:** Um Verletzungen und Übertraining aktiv vorzubeugen, visualisiert die App kritische Belastungen über ein Schwellenwert-System. Ein subjektives Schmerzniveau (Pain-Level) von über 7 triggert im Dashboard automatisch eine optische Hervorhebung (Warnung).
- **Wo umgesetzt:** Im Frontend (`/dashboard`) via bedingtem CSS-Klassen-Rendering, basierend auf den aus der MongoDB abgerufenen Datensätzen.

## 5. Projektorganisation
- **Repository & Struktur:** Verwendung einer klaren SvelteKit-Ordnerstruktur (`src/routes/` für das routingbasierte System, `src/lib/components/` für wiederverwendbare UI-Elemente wie den Tracker).
- **Commit-Praxis:** Nutzung von sprechenden, feingranularen Git-Commits (z. B. `feat:`, `fix:`, `docs:`), um die Entwicklungsschritte sauber nachvollziehbar zu halten.

## 6. KI-Deklaration

### 6.1 KI-Tools
- **Eingesetzte Tools:** GitHub Copilot (In-Editor Code-Generierung) und Gemini (Architekturberatung, strukturierte Fehlerdiagnose und Prompt-Konzeptionierung).
- **Zweck & Umfang:** KI wurde maßgeblich zur Erstellung des technischen Grundgerüsts der Svelte-Komponenten verwendet. Besonders intensiv wurde Gemini bei der Tiefenanalyse der MongoDB-Verbindungsfehler (`ECONNREFUSED` / `Topology is closed`) eingesetzt, um die zugrundeliegenden DNS- und Netzwerkarchitektur-Probleme zu entschlüsseln.
- **Eigene Leistung:** Konzeption der User Experience, visuelles Design mittels Tailwind CSS, das gesamte manuelle Refactoring der Reaktivität auf Svelte 5 Runes, das Einrichten des MongoDB Atlas Clusters sowie die finale Verantwortung und Validierung des gesamten Codes.

### 6.2 Prompt-Vorgehen
Es wurde ein systematisches, kontextbasiertes Prompting angewendet. Statt unstrukturiertem Code-Kopieren wurden Fehlermeldungen aus dem VS Code Terminal per Screenshot und Text an die KI übergeben, um die genauen Ursachen (z. B. DNS-SRV-Sperren oder Sonderzeichen-Parsing) zu isolieren. Für die Weiterarbeit mit GitHub Copilot wurde ein strukturierter Master-Prompt entwickelt, der Code-Kontext, Technologie-Vorgaben (Svelte 5 Runes) und funktionale Ziele präzise definiert.

### 6.3 Reflexion
Der Einsatz von KI beschleunigte das Aufsetzen des Projekts enorm. Die Grenzen zeigten sich jedoch bei Versionsüberschneidungen (Svelte 4 vs. Svelte 5 Runes), wo KI-Generate oft veraltete Syntax lieferten und manuell korrigiert werden mussten. Bei der Netzwerk-Fehlersuche erwies sich der Dialog mit der KI als exzellenter "Sparringspartner", um komplexe Server-Infrastrukturprobleme Schritt für Schritt logisch einzugrenzen.