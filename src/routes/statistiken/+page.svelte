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
<style>
    /* Layout wrapper */
  .page-wrapper { max-width: 900px; margin: 2rem auto; padding: 0 1rem; font-family: system-ui, sans-serif; color: #1e293b; }
    .header-section { text-align: center; margin-bottom: 1.5rem; }
    .header-section h1 { font-size: 2rem; font-weight: 800; margin: 0 0 0.5rem 0; }
    .header-section p { color: #64748b; margin: 0; }

    /* Small metric cards */
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem; }
    @media(min-width: 1024px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }
    .mini-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; }
    .mini-card-label { font-size: 0.85rem; color: #64748b; }
    .mini-card-value { font-size: 1.6rem; font-weight: 800; color: #0f172a; }

    /* Main card containers for charts / sections */
    .main-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.04); margin-bottom: 1rem; }

    /* Chart row (used inside main-card) */
    .chart-row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
    .chart-label { font-size: 0.95rem; font-weight: 600; color: #0f172a; }
    .chart-track { background: rgba(15,23,42,0.06); border-radius: 999px; height: 0.9rem; overflow: hidden; }
    .chart-fill { height: 100%; background: linear-gradient(90deg,#38bdf8,#818cf8); border-radius: 999px; transition: width 0.4s cubic-bezier(0.4,0,0.2,1); }

    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.5rem 0.75rem; }
    tr + tr { border-top: 1px solid #eef2f7; }

    /* Responsive table: Desktop view */
    @media (min-width: 601px) {
        .training-list { display: table; width: 100%; }
        .training-row { display: table-row; }
        .training-cell { display: table-cell; padding: 0.5rem 0.75rem; }
        .training-header { display: table-header-group; font-weight: 700; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        .training-body { display: table-row-group; }
        .training-mobile { display: none; }
    }

    /* Responsive table: Mobile view */
    @media (max-width: 600px) {
        .training-list, .training-header { display: none; }
        .training-mobile { display: block; width: 100%; box-sizing: border-box; }
        .training-mobile .training-body { display: flex; flex-direction: column; gap: 0.75rem; }
        .training-mobile .training-row { display: flex; flex-direction: column; gap: 0.5rem; background: #f8fafc; padding: 0.75rem; border-radius: 8px; border: 1px solid #e2e8f0; box-sizing: border-box; width: 100%; }
        .training-mobile .training-cell { display: block; padding: 0; box-sizing: border-box; }
        .training-cell-label { font-weight: 600; font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 0.25rem; }
        .training-cell-value { color: #0f172a; display: block; }
    }

    .btn-link { color: #2563eb; text-decoration: none; font-weight: 600; }
</style>

<div class="page-wrapper">
    <div class="header-section">
        <h1>Training Statistiken</h1>
        <p>Übersicht deiner absolvierten Trainings mit Mobile-optimierten Charts.</p>
    </div>

    {#if data.success && data.trainings && data.trainings.length > 0}
        <div class="stats-grid">
            <div class="mini-card">
                <div class="mini-card-label">Trainings gesamt</div>
                <div class="mini-card-value">{data.trainings.length}</div>
            </div>
            <div class="mini-card">
                <div class="mini-card-label">Energetischer Aufwand</div>
                <div class="mini-card-value">{totalCalories} kcal</div>
            </div>
            <div class="mini-card">
                <div class="mini-card-label">Gesamtdistanz</div>
                <div class="mini-card-value">{Number(totalDistance).toFixed(1)} km</div>
            </div>
            <div class="mini-card">
                <div class="mini-card-label">Ø Mental Score</div>
                <div class="mini-card-value">{avgMentalScore} / 5</div>
            </div>
        </div>

        <div class="main-card">
            <h2 style="margin-top:0;margin-bottom:0.75rem;font-size:1.125rem;font-weight:700;">Totalvolumen pro Sport</h2>
            {#each chartSportBars as bar}
                <div class="chart-row">
                    <div class="chart-label">{bar.sport}</div>
                    <div class="chart-track"><div class="chart-fill" style="width:{bar.width}%;"></div></div>
                    <div class="chart-value">{bar.value.toFixed(1)} km</div>
                </div>
            {/each}
        </div>

        <div class="main-card" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-items:start;">
            <div>
                <h3 style="margin:0 0 0.5rem 0;font-weight:700;">Mental vs. Schmerz</h3>
                <div style="display:flex;flex-direction:column;gap:0.5rem;">
                    <div>Niedriges Schmerzlevel (0-5): <strong style="float:right">{painMental.low} / 5</strong></div>
                    <div>Hohes Schmerzlevel (6-10): <strong style="float:right">{painMental.high} / 10</strong></div>
                </div>
                <p style="color:#64748b;margin-top:0.75rem;font-size:0.9rem;">Diese Kennzahl hilft dir, mentale Stärke in Abhängigkeit zum Belastungsempfinden einzuschätzen.</p>
            </div>
            <div>
                <h3 style="margin:0 0 0.5rem 0;font-weight:700;">Energetische Auswertung</h3>
                <p style="font-size:1.5rem;font-weight:800;color:#16a34a;margin:0">{totalCalories} kcal</p>
                <p style="color:#64748b;margin-top:0.5rem;font-size:0.9rem;">Berechnet mit standardisierten MET-Werten für Schwimmen (8.0), Radfahren (7.5) und Laufen (9.5).</p>
            </div>
        </div>

        <div class="main-card">
            <h2 style="margin:0 0 0.75rem 0;font-weight:700;">Letzte Trainings</h2>
            
            <!-- Desktop Table View -->
            <table class="training-list">
                <thead class="training-header">
                    <tr class="training-row">
                        <th class="training-cell">Datum</th>
                        <th class="training-cell" style="text-align:right;">Distanz</th>
                        <th class="training-cell" style="text-align:right;">Dauer</th>
                        <th class="training-cell" style="text-align:center;">Schmerz</th>
                        <th class="training-cell" style="text-align:center;">Befinden</th>
                    </tr>
                </thead>
                <tbody class="training-body">
                    {#each data.trainings as training (training._id)}
                        <tr class="training-row">
                            <td class="training-cell">
                                {new Date(training.createdAt || training.date).toLocaleDateString('de-DE')}
                                <div style="font-size:0.75rem;color:#64748b">{new Date(training.createdAt || training.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td class="training-cell" style="text-align:right">{Number(training.distance || 0).toFixed(1)} km</td>
                            <td class="training-cell" style="text-align:right">{training.duration} min</td>
                            <td class="training-cell" style="text-align:center"><span style="padding:0.25rem 0.5rem;border-radius:6px;background:#fee2e2;color:#991b1b">{training.painLevel}/10</span></td>
                            <td class="training-cell" style="text-align:center"><span style="padding:0.25rem 0.5rem;border-radius:6px;background:#ecfccb;color:#365314">{training.mentalScore}/5</span></td>
                        </tr>
                    {/each}
                </tbody>
            </table>

            <!-- Mobile Card View -->
            <div class="training-mobile">
                <div class="training-body">
                    {#each data.trainings as training (training._id)}
                        <div class="training-row">
                            <div class="training-cell">
                                <span class="training-cell-label">Sportart</span>
                                <span class="training-cell-value">{training.sport}</span>
                                <span style="margin-left:0.5rem;padding:0.25rem 0.5rem;border-radius:6px;background:#fee2e2;color:#991b1b;font-size:0.85rem">{training.painLevel}/10</span>
                            </div>
                            <div class="training-cell">
                                <span class="training-cell-label">Datum & Zeit</span>
                                <span class="training-cell-value">
                                    {new Date(training.createdAt || training.date).toLocaleDateString('de-DE')}
                                    {new Date(training.createdAt || training.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div class="training-cell" style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem">
                                <div>
                                    <span class="training-cell-label">Distanz</span>
                                    <span class="training-cell-value">{Number(training.distance || 0).toFixed(1)} km</span>
                                </div>
                                <div>
                                    <span class="training-cell-label">Dauer</span>
                                    <span class="training-cell-value">{training.duration} min</span>
                                </div>
                            </div>
                            <div class="training-cell">
                                <span class="training-cell-label">Mental Score</span>
                                <span style="padding:0.25rem 0.5rem;border-radius:6px;background:#ecfccb;color:#365314">{training.mentalScore}/5</span>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {:else if data && !data.success}
        <div class="main-card">
            <div style="font-weight:700;color:#b91c1c">Fehler beim Laden</div>
            <div style="color:#475569">{data.error || 'Trainings konnten nicht geladen werden'}</div>
        </div>
    {:else}
        <div class="main-card" style="text-align:center">
            <div style="font-weight:800;font-size:1.125rem;margin-bottom:0.5rem">Keine Trainings vorhanden</div>
            <div style="color:#64748b;margin-bottom:1rem">Starten Sie ein Training, um hier Ihre Statistiken zu sehen.</div>
            <a href="/trainings" class="btn-link">Jetzt erstes Training erfassen →</a>
        </div>
    {/if}

    <div style="margin-top:1rem;text-align:left">
        <a href="/trainings" class="btn-link">← Zurück zu Trainings</a>
    </div>
</div>