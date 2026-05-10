// src/lib/server/calories.js
// Hilfsfunktion zur Berechnung von verbrannten Kalorien nach MET-Faktoren.
// Erstellt mit KI-Unterstützung — für ZHAW-Dokumentation kommentiert.

/**
 * Berechnet Kalorien basierend auf Sportart und Dauer.
 * Formel: Kalorien = MET * 3.5 * Gewicht_kg / 200 * Dauer_min
 * MET-Faktoren: Schwimmen 8.0, Rad 10.0, Laufen 11.5
 */
export function calcCalories(sport, durationMin, weightKg = 75) {
  const MET = {
    Schwimmen: 8.0,
    Rad: 10.0,
    Lauf: 11.5
  };

  const met = MET[sport] ?? 8.0;
  const kcal = met * 3.5 * weightKg / 200 * Number(durationMin || 0);
  // Runde auf ganze Kalorien für einfachere Anzeige
  return Math.round(kcal);
}
