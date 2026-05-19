<script lang="ts">
    // src/routes/statistiken/+page.svelte
    
    // Svelte 5 nimmt Daten über das $props-Rune entgegen
    let { data } = $props();

    // 1. totalBySport: Ermittelt die Gesamtdistanz pro Sportart
    let totalBySport = $derived.by(() => {
        const groups = { Schwimmen: 0, Rad: 0, Lauf: 0 };
        for (const training of data.trainings ?? []) {
            const sport = training.sport ?? 'Andere';
            if (groups[sport] !== undefined) {
                groups[sport] += Number(training.distance || 0);
            }
        }
        return groups;
    });

    // 2. chartSportBars: Berechnet relative Balkenbreiten (0-100) für das Diagramm
    let chartSportBars = $derived.by(() => {
        const values = Object.values(totalBySport);
        const maxValue = Math.max(...values, 1);
        return Object.entries(totalBySport).map(([sport, value]) => ({
            sport,
            value,
            width: Math.round((value / maxValue) * 100)
        }));
    });

    // 3. painMental: Berechnet den Durchschnitt von Mental Score getrennt nach Schmerzlevel
    let painMental = $derived.by(() => {
        const buckets = {
            low: { sum: 0, count: 0 },
            high: { sum: 0, count: 0 }
        };

        for (const training of data.trainings ?? []) {
            const pain = Number(training.painLevel ?? 0);
            const target = pain <= 5 ? buckets.low : buckets.high;
            target.sum += Number(training.mentalScore || 0);
            target.count += 1;
        }

        return {
            low: buckets.low.count ? (buckets.low.sum / buckets.low.count).toFixed(1) : '-',
            high: buckets.high.count ? (buckets.high.sum / buckets.high.count).toFixed(1) : '-'
        };
    });

    // 4. totalCalories: Berechnet Kalorien basierend auf der Sportart (MET-Logik)
    let totalCalories = $derived.by(() => {
        const metBySport = { Schwimmen: 8, Rad: 7.5, Lauf: 9.5 };
        const weightKg = 70;
        return (data.trainings ?? []).reduce((sum, training) => {
            const durationMin = Number(training.duration || 0);
            const metValue = metBySport[training.sport] ?? 6;
            return sum + Math.round(metValue * weightKg * (durationMin / 60));
        }, 0);
    });

    // Hilfsvariablen für die Header-Karten (Einfache reactive States)
    let totalDistance = $derived(
        (data.trainings ?? []).reduce((sum, t) => sum + Number(t.distance || 0), 0)
    );
    
    let avgMentalScore = $derived(
        data.trainings?.length 
            ? ((data.trainings.reduce((sum, t) => sum + Number(t.mentalScore || 0), 0) / data.trainings.length)).toFixed(1)
            : '0.0'
    );
</script>

<svelte:head>
    <title>Statistiken</title>
</svelte:head>

<div class="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
    <div class="space-y-3">
        <h1 class="h1">Training Statistiken</h1>
        <p class="text-surface-600">Übersicht deiner absolvierten Trainings mit Mobile-optimierten Charts.</p>
    </div>

    {#if data.success && data.trainings && data.trainings.length > 0}
        <div class="grid gap-4">
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div class="card p-4 variant-glass-surface">
                    <div class="text-sm text-surface-600">Trainings gesamt</div>
                    <div class="text-3xl font-bold">{data.trainings.length}</div>
                </div>
                <div class="card p-4 variant-glass-surface">
                    <div class="text-sm text-surface-600">Energetischer Aufwand</div>
                    <div class="text-3xl font-bold text-success-500">{totalCalories} kcal</div>
                </div>
                <div class="card p-4 variant-glass-surface">
                    <div class="text-sm text-surface-600">Gesamtdistanz</div>
                    <div class="text-3xl font-bold">{Number(totalDistance).toFixed(1)} km</div>
                </div>
                <div class="card p-4 variant-glass-surface">
                    <div class="text-sm text-surface-600">Ø Mental Score</div>
                    <div class="text-3xl font-bold">{avgMentalScore} / 5</div>
                </div>
            </div>

            <div class="card p-6 variant-glass-surface">
                <h2 class="h2 mb-4">Totalvolumen pro Sport</h2>
                <div class="space-y-4">
                    {#each chartSportBars as bar}
                        <div class="chart-row">
                            <div class="chart-label" style="min-width: 100px;">{bar.sport}</div>
                            <div class="chart-track">
                                <div class="chart-fill" style="width:{bar.width}%;"></div>
                            </div>
                            <div class="chart-value font-semibold">{bar.value.toFixed(1)} km</div>
                        </div>
                    {/each}
                </div>
            </div>

            <div class="card p-6 variant-glass-surface grid gap-6 sm:grid-cols-2">
                <div>
                    <h2 class="h3 mb-3">Mental vs. Schmerz</h2>
                    <div class="space-y-2">
                        <div class="badge variant-soft-success p-2 block text-left w-full">Niedriges Schmerzlevel (0-5): <strong class="float-right text-base">{painMental.low} / 5</strong></div>
                        <div class="badge variant-soft-warning p-2 block text-left w-full">Hohes Schmerzlevel (6-10): <strong class="float-right text-base">{painMental.high} / 5</strong></div>
                    </div>
                    <p class="text-sm text-surface-600 mt-3">Diese Kennzahl hilft dir, mentale Stärke in Abhängigkeit zum Belastungsempfinden einzuschätzen.</p>
                </div>
                <div>
                    <h2 class="h3 mb-3">Energetische Auswertung</h2>
                    <p class="text-2xl font-bold text-success-600">{totalCalories} kcal</p>
                    <p class="text-sm text-surface-600 mt-1">Berechnet mit standardisierten MET-Werten für Schwimmen (8.0), Radfahren (7.5) und Laufen (9.5).</p>
                </div>
            </div>

            <div class="card p-6 variant-glass-surface overflow-x-auto">
                <h2 class="h2 mb-4">Letzte Trainings</h2>
                <table class="w-full text-sm">
                    <thead class="border-b border-surface-300">
                        <tr>
                            <th class="text-left py-2">Datum</th>
                            <th class="text-left py-2">Sportart</th>
                            <th class="text-right py-2">Distanz</th>
                            <th class="text-right py-2">Dauer</th>
                            <th class="text-center py-2">Schmerz</th>
                            <th class="text-center py-2">Befinden</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each data.trainings as training (training._id)}
                            <tr class="border-b border-surface-200 hover:bg-surface-50/50 transition-colors">
                                <td class="py-3">
                                    {new Date(training.createdAt || training.date).toLocaleDateString('de-DE')}
                                    <span class="text-xs text-surface-600 block">{new Date(training.createdAt || training.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
                                </td>
                                <td class="py-3 font-semibold">{training.sport}</td>
                                <td class="text-right py-3">{Number(training.distance || 0).toFixed(1)} km</td>
                                <td class="text-right py-3">{training.duration} min</td>
                                <td class="text-center py-3">
                                    <span class="badge variant-soft-error">{training.painLevel}/10</span>
                                </td>
                                <td class="text-center py-3">
                                    <span class="badge" class:variant-soft-success={training.mentalScore >= 4} class:variant-soft-warning={training.mentalScore === 3} class:variant-soft-error={training.mentalScore <= 2}>
                                        {training.mentalScore}/5
                                    </span>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {:else if data && !data.success}
        <div class="alert variant-filled-error">
            <div class="alert-title">Fehler beim Laden</div>
            <div class="alert-message">{data.error || 'Trainings konnten nicht geladen werden'}</div>
        </div>
    {:else}
        <div class="alert variant-filled-surface p-6 text-center">
            <div class="alert-title text-xl font-bold mb-2">Keine Trainings vorhanden</div>
            <div class="alert-message mb-4">Starten Sie ein Training, um hier Ihre Statistiken zu sehen.</div>
            <a href="/trainings" class="btn variant-filled-primary font-bold">Jetzt erstes Training erfassen →</a>
        </div>
    {/if}

    <div class="mt-8">
        <a href="/trainings" class="btn variant-outlined-primary">← Zurück zu Trainings</a>
    </div>
</div>

<style>
    .chart-row {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 0.75rem;
    }

    .chart-label {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--surface-900, #0f172a);
    }

    .chart-track {
        background: rgba(15, 23, 42, 0.08);
        border-radius: 999px;
        height: 1rem;
        overflow: hidden;
    }

    .chart-fill {
        height: 100%;
        background: linear-gradient(90deg, #38bdf8, #818cf8);
        border-radius: 999px;
        transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    table {
        border-collapse: collapse;
    }
</style>