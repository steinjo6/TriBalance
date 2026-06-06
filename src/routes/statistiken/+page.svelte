<script lang="ts">
    // src/routes/statistiken/+page.svelte

    type Training = {
        sport?: string;
        distance?: number | string;
        duration?: number | string;
        painLevel?: number | string;
        mentalScore?: number | string;
        createdAt?: string;
        date?: string;
        _id?: string;
    };

    type PageData = {
        trainings?: Training[];
        success?: boolean;
        error?: string;
    };

    // Svelte 5 nimmt Daten über das $props-Rune entgegen
    let { data }: { data: PageData } = $props();

    // 1. totalBySport: Ermittelt die Gesamtdistanz pro Sportart
    let totalBySport = $derived.by(() => {
        const groups = { Laufen: 0, Radfahren: 0, Schwimmen: 0 };
        for (const training of data.trainings ?? [] as Training[]) {
            const rawSport = String(training.sport ?? '').trim();
            const sport = rawSport === 'Rad' ? 'Radfahren'
                : rawSport === 'Lauf' ? 'Laufen'
                : rawSport === 'Radfahren' ? 'Radfahren'
                : rawSport === 'Laufen' ? 'Laufen'
                : rawSport === 'Schwimmen' ? 'Schwimmen'
                : null;
            if (!sport) continue;
            groups[sport] += Number(training.distance || 0);
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

        for (const training of data.trainings ?? [] as Training[]) {
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
        return (data.trainings ?? [] as Training[]).reduce((sum: number, training: Training) => {
            const durationMin = Number(training.duration || 0);
            const sportKey = String(training.sport ?? '') as keyof typeof metBySport;
            const metValue = metBySport[sportKey] ?? 6;
            return sum + Math.round(metValue * weightKg * (durationMin / 60));
        }, 0);
    });

    // Hilfsvariablen für die Header-Karten (Einfache reactive States)
    let totalDistance = $derived(
        (data.trainings ?? [] as Training[]).reduce((sum: number, t: Training) => sum + Number(t.distance || 0), 0)
    );
    
    let avgMentalScore = $derived(
        data.trainings?.length 
            ? ((data.trainings.reduce((sum: number, t: Training) => sum + Number(t.mentalScore || 0), 0) / data.trainings.length)).toFixed(1)
            : '0.0'
    );

    let avgPainScore = $derived.by(() => {
        const trainings = data.trainings ?? [] as Training[];
        if (!trainings.length) return '0.0';
        const sum = trainings.reduce((sum: number, t: Training) => sum + Number(t.painLevel || 0), 0);
        return (sum / trainings.length).toFixed(1);
    });

    const chartRadius = 90;
    const chartCircumference = 2 * Math.PI * chartRadius;

    let sportDistribution = $derived.by(() => {
        const categories = [
            { label: 'Laufen', color: '#fb923c', count: 0, distance: 0 },
            { label: 'Radfahren', color: '#3b82f6', count: 0, distance: 0 },
            { label: 'Schwimmen', color: '#06b6d4', count: 0, distance: 0 }
        ];

        for (const training of data.trainings ?? [] as Training[]) {
            const rawSport = String(training.sport ?? '').trim();
            const item = categories.find((entry) =>
                entry.label === rawSport
                || (rawSport === 'Rad' && entry.label === 'Radfahren')
                || (rawSport === 'Lauf' && entry.label === 'Laufen')
            );
            if (!item) continue;
            item.count += 1;
            item.distance += Number(training.distance || 0);
        }

        const totalCount = categories.reduce((sum: number, entry) => sum + entry.count, 0);
        let offset = 0;

        return categories.map((entry) => {
            const percentage = totalCount ? Math.round((entry.count / totalCount) * 100) : 0;
            const dash = Math.max(0.001, (percentage / 100) * chartCircumference);
            const slice = {
                ...entry,
                value: entry.count,
                percentage,
                dash,
                offset,
                displayDistance: entry.distance.toFixed(1)
            };
            offset += dash;
            return slice;
        });
    });

    let focusSeries = $derived.by(() => {
        const trainings = (data.trainings ?? [] as Training[]).slice(0, 10).slice().reverse();
        return trainings.map((training: Training) => ({
            label: formatTrainingDateValue(training.createdAt ?? training.date),
            pain: Number(training.painLevel || 0),
            mental: Number(training.mentalScore || 0)
        }));
    });

    function formatTrainingDateValue(value?: string) {
        const date = new Date(value ?? '');
        return Number.isNaN(date.getTime()) ? '--.--' : date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
    }

    function formatTrainingTimeValue(value?: string) {
        const date = new Date(value ?? '');
        return Number.isNaN(date.getTime()) ? '--:--' : date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }

    let focusPoints = $derived.by(() => {
        const entries = focusSeries;
        const width = 360;
        const height = 240;
        const left = 40;
        const right = 16;
        const top = 24;
        const bottom = 36;
        const plotWidth = width - left - right;
        const plotHeight = height - top - bottom;
        const count = Math.max(entries.length - 1, 1);

        const painSegments: string[] = [];
        const mentalSegments: string[] = [];
        const painDots: Array<{ x: number; y: number; value: number }> = [];
        const mentalDots: Array<{ x: number; y: number; value: number }> = [];
        const xLabels: Array<{ x: number; label: string }> = [];

        entries.forEach((entry: { label: string; pain: number; mental: number }, index: number) => {
            const x = left + (plotWidth * index / count);
            const yPain = top + plotHeight * (1 - (entry.pain - 1) / 9);
            const yMental = top + plotHeight * (1 - (entry.mental - 1) / 4);
            painSegments.push(`${x},${yPain}`);
            mentalSegments.push(`${x},${yMental}`);
            painDots.push({ x, y: yPain, value: entry.pain });
            mentalDots.push({ x, y: yMental, value: entry.mental });
            xLabels.push({ x, label: entry.label });
        });

        return {
            painPath: painSegments.join(' '),
            mentalPath: mentalSegments.join(' '),
            painDots,
            mentalDots,
            xLabels,
            width,
            height,
            left,
            right,
            top,
            bottom,
            plotWidth,
            plotHeight
        };
    });
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
    
    /* Mobilgeräte: Genau zwei Spalten nebeneinander, ungerade Karte füllt volle Breite */
    @media (max-width: 600px) { 
        .stats-grid { grid-template-columns: repeat(2, 1fr); } 
        .mini-card.full-mobile { grid-column: span 2; }
    }
    @media(min-width: 1024px) { .stats-grid { grid-template-columns: repeat(5, 1fr); } }
    
    .mini-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; justify-content: center; }
    .mini-card-label { font-size: 0.85rem; color: #64748b; font-weight: 600; margin-bottom: 0.25rem; }
    .mini-card-value { font-size: 1.5rem; font-weight: 800; color: #0f172a; }

    /* Main card containers for charts / sections */
    .main-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.04); margin-bottom: 1rem; }

    .charts-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-bottom: 1rem; }
    .chart-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 1rem; }
    .chart-card-header { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
    .chart-card-header h3 { margin: 0 0 0.25rem 0; font-size: 1.1rem; font-weight: 700; }
    .chart-card-header p { margin: 0; color: #64748b; font-size: 0.9rem; }
    .chart-figure { display: grid; gap: 1rem; }
    .pie-chart { width: 100%; height: auto; max-width: 340px; margin: 0 auto; display: block; }
    .chart-legend { display: grid; gap: 0.75rem; }
    .legend-item { display: grid; grid-template-columns: auto 1fr auto; gap: 0.75rem; align-items: center; }
    .legend-swatch { width: 12px; height: 12px; border-radius: 999px; display: inline-block; }
    .legend-label { font-weight: 700; color: #0f172a; }
    .legend-subtext { color: #64748b; font-size: 0.85rem; }
    .legend-percentage { font-weight: 700; color: #0f172a; font-size: 0.95rem; }
    .chart-linechart svg { width: 100%; height: auto; overflow: visible; }
    .linechart-legend { display: flex; gap: 1rem; flex-wrap: wrap; color: #475569; font-size: 0.9rem; }
    .legend-dot { width: 10px; height: 10px; border-radius: 999px; display: inline-block; margin-right: 0.4rem; vertical-align: middle; }
    .legend-dot.red { background: #ef4444; }
    .legend-dot.teal { background: #0f766e; }

    @media (max-width: 900px) {
        .charts-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 600px) {
        .stats-grid { grid-template-columns: 1fr; }
        .mini-card.full-mobile { grid-column: auto; }
    }

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
        <h1>Statistiken</h1>
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
            <div class="mini-card full-mobile">
                <div class="mini-card-label">Ø Schmerzlevel</div>
                <div class="mini-card-value">{avgPainScore} / 10</div>
            </div>
        </div>

        <div class="charts-grid">
            <div class="chart-card">
                <div class="chart-card-header">
                    <div>
                        <h3>Disziplinen-Verteilung</h3>
                        <p>Verhältnis der Trainings nach Sportart.</p>
                    </div>
                </div>
                <div class="chart-figure">
                    <svg viewBox="0 0 260 260" class="pie-chart" role="img" aria-label="Disziplinen-Verteilung">
                        <circle cx="130" cy="130" r="90" fill="#f8fafc" />
                        {#if sportDistribution.reduce((sum, slice) => sum + slice.value, 0) > 0}
                            {#each sportDistribution as slice}
                                <circle
                                    cx="130"
                                    cy="130"
                                    r="90"
                                    fill="none"
                                    stroke={slice.color}
                                    stroke-width="40"
                                    stroke-linecap="round"
                                    stroke-dasharray={`${slice.dash} ${chartCircumference - slice.dash}`}
                                    stroke-dashoffset={-slice.offset}
                                    transform="rotate(-90 130 130)"
                                />
                            {/each}
                        {:else}
                            <text x="130" y="130" text-anchor="middle" dominant-baseline="middle" fill="#64748b" font-size="14">Noch keine Daten</text>
                        {/if}
                        <circle cx="130" cy="130" r="60" fill="#ffffff" />
                        <text x="130" y="130" text-anchor="middle" dominant-baseline="middle" fill="#0f172a" font-size="16" font-weight="700">{data.trainings.length}</text>
                    </svg>
                    <div class="chart-legend">
                        {#each sportDistribution as item}
                            <div class="legend-item">
                                <span class="legend-swatch" style="background:{item.color}"></span>
                                <div>
                                    <div class="legend-label">{item.label}</div>
                                    <div class="legend-subtext">{item.count} Einheiten · {item.displayDistance} km</div>
                                </div>
                                <div class="legend-percentage">{item.percentage}%</div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>

            <div class="chart-card">
                <div class="chart-card-header">
                    <div>
                        <h3>Mentaler Fokus vs. Schmerzverlauf</h3>
                        <p>Die letzten 10 Einheiten im direkten Vergleich.</p>
                    </div>
                </div>
                <div class="chart-figure chart-linechart">
                    <svg viewBox={
                        `0 0 ${focusPoints.width} ${focusPoints.height}`
                    } preserveAspectRatio="none" role="img" aria-label="Mentaler Fokus versus Schmerzverlauf">
                        <defs>
                            <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="#e2e8f0" stop-opacity="0.22" />
                                <stop offset="100%" stop-color="#e2e8f0" stop-opacity="0" />
                            </linearGradient>
                        </defs>
                        {#each [1, 3, 5, 7, 9] as line}
                            <line x1={focusPoints.left} y1={focusPoints.top + ((line - 1)/9) * focusPoints.plotHeight} x2={focusPoints.width - focusPoints.right} y2={focusPoints.top + ((line - 1)/9) * focusPoints.plotHeight} stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4 4" />
                        {/each}
                        <polyline points={focusPoints.painPath} fill="none" stroke="#ef4444" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />
                        <polyline points={focusPoints.mentalPath} fill="none" stroke="#0f766e" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />
                        {#each focusPoints.painDots as dot}
                            <circle cx={dot.x} cy={dot.y} r="4" fill="#ef4444" />
                        {/each}
                        {#each focusPoints.mentalDots as dot}
                            <circle cx={dot.x} cy={dot.y} r="4" fill="#0f766e" />
                        {/each}
                        {#each focusPoints.xLabels as tick}
                            <text x={tick.x} y={focusPoints.height - 8} text-anchor="middle" font-size="10" fill="#475569">{tick.label}</text>
                        {/each}
                    </svg>
                    <div class="linechart-legend">
                        <span><span class="legend-dot red"></span> Schmerzlevel</span>
                        <span><span class="legend-dot teal"></span> Mental Score</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="main-card" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-items:start;">
            <div>
                <h3 style="margin:0 0 0.5rem 0;font-weight:700;">Mental vs. Schmerz</h3>
                <div style="display:flex;flex-direction:column;gap:0.5rem;">
                    <div>Niedriges Schmerzlevel (1-5): <strong style="float:right">{painMental.low} / 5</strong></div>
                    <div>Hohes Schmerzlevel (6-10): <strong style="float:right">{painMental.high} / 5</strong></div>
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
                                {formatTrainingDateValue(training.createdAt ?? training.date)}
                                <div style="font-size:0.75rem;color:#64748b">{formatTrainingTimeValue(training.createdAt ?? training.date)}</div>
                            </td>
                            <td class="training-cell" style="text-align:right">{Number(training.distance || 0).toFixed(1)} km</td>
                            <td class="training-cell" style="text-align:right">{training.duration} min</td>
                            <td class="training-cell" style="text-align:center"><span style="padding:0.25rem 0.5rem;border-radius:6px;background:#fee2e2;color:#991b1b">{training.painLevel}/10</span></td>
                            <td class="training-cell" style="text-align:center"><span style="padding:0.25rem 0.5rem;border-radius:6px;background:#ecfccb;color:#365314">{training.mentalScore}/5</span></td>
                        </tr>
                    {/each}
                </tbody>
            </table>

            <div class="training-mobile">
                <div class="training-body">
                    {#each data.trainings as training (training._id)}
                        <div class="training-row">
                            <div class="training-cell" style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                                <div>
                                    <span class="training-cell-label">Sportart</span>
                                    <span class="training-cell-value" style="font-weight:700;">{training.sport}</span>
                                </div>
                                <div style="text-align:right;">
                                    <span class="training-cell-label">Schmerzlevel</span>
                                    <span style="padding:0.25rem 0.5rem;border-radius:6px;background:#fee2e2;color:#991b1b;font-size:0.85rem;display:inline-block;margin-top:0.25rem;">{training.painLevel}/10</span>
                                </div>
                            </div>
                            <div class="training-cell" style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                                <div>
                                    <span class="training-cell-label">Datum & Zeit</span>
                                    <span class="training-cell-value" style="font-size:0.9rem;">
                                        {formatTrainingDateValue(training.createdAt ?? training.date)} <br/>
                                        {formatTrainingTimeValue(training.createdAt ?? training.date)}
                                    </span>
                                </div>
                                <div style="text-align:right;">
                                    <span class="training-cell-label">Dauer</span>
                                    <span class="training-cell-value">{training.duration} min</span>
                                </div>
                            </div>
                            <div class="training-cell" style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem">
                                <div>
                                    <span class="training-cell-label">Distanz</span>
                                    <span class="training-cell-value">{Number(training.distance || 0).toFixed(1)} km</span>
                                </div>
                                <div style="text-align:right;">
                                    <span class="training-cell-label">Mental Score</span>
                                    <span style="padding:0.25rem 0.5rem;border-radius:6px;background:#ecfccb;color:#365314;font-size:0.85rem;display:inline-block;margin-top:0.25rem;">{training.mentalScore}/5</span>
                                </div>
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