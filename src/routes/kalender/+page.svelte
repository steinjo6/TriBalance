<script>
    // FINAL: Bereinigte Svelte 5 Kalenderansicht für TriBalance
    let { data } = $props();

    const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    let monthOffset = $state(0);
    let selectedDate = $state(null);
    let showModal = $state(false);
    let form = $state({
        sport: 'Laufen',
        plannedDate: '',
        duration: 60,
        distance: 0
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Svelte 5 Konforme Top-Level Runes (Ohne verschachtelte Funktions-Rumpfe)
    let currentMonth = $derived.by(() => {
        const now = new Date();
        const month = now.getMonth() + monthOffset;
        const year = now.getFullYear() + Math.floor(month / 12);
        return new Date(year, (month % 12 + 12) % 12, 1);
    });

    let monthLabel = $derived(`${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`);

    let trainingMap = $derived.by(() => {
        const map = new Map();
        const trainings = data?.trainings || [];

        const dayKey = date => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return d.toISOString().slice(0, 10);
        };

        trainings.forEach(item => {
            const sourceDate = item.isPlanned ? item.plannedDate : item.createdAt || item.plannedDate;
            if (!sourceDate) return;
            const date = new Date(sourceDate);
            if (isNaN(date.getTime())) return;
            const key = dayKey(date);
            const existing = map.get(key) || [];
            existing.push(item);
            map.set(key, existing);
        });

        return map;
    });

    let calendarDays = $derived.by(() => {
        const dayList = [];
        const startDay = (currentMonth.getDay() + 6) % 7;
        const totalCells = 42;

        for (let index = 0; index < totalCells; index += 1) {
            const date = new Date(currentMonth);
            date.setDate(index + 1 - startDay);
            const itemKey = date.toISOString().slice(0, 10);
            dayList.push({
                date,
                itemKey,
                isCurrentMonth: date.getMonth() === currentMonth.getMonth(),
                trainings: trainingMap.get(itemKey) || []
            });
        }

        return dayList;
    });

    let selectedKey = $derived.by(() => {
        if (!selectedDate) return null;
        const d = new Date(selectedDate);
        d.setHours(0, 0, 0, 0);
        return d.toISOString().slice(0, 10);
    });

    let selectedTrainings = $derived.by(() => {
        if (!selectedKey) return [];
        const trainings = trainingMap.get(selectedKey) || [];
        return [...trainings].sort((a, b) => {
            const aDate = new Date(a.plannedDate || a.createdAt);
            const bDate = new Date(b.plannedDate || b.createdAt);
            return aDate.getTime() - bDate.getTime();
        });
    });

    let selectedIsFuture = $derived.by(() => {
        if (!selectedDate) return false;
        const selected = new Date(selectedDate);
        selected.setHours(0, 0, 0, 0);
        return selected.getTime() >= today.getTime();
    });

    let selectedLabel = $derived.by(() => {
        if (!selectedDate) return '';
        return selectedDate.toLocaleDateString('de-DE', {
            weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
        });
    });

    function previousMonth() {
        monthOffset -= 1;
    }

    function nextMonth() {
        monthOffset += 1;
    }

    function openDay(day) {
        selectedDate = day.date;
        form.plannedDate = day.date.toISOString().slice(0, 10);
        showModal = true;
    }

    function closeModal() {
        showModal = false;
        selectedDate = null;
    }

    function sportColor(sport) {
        if (sport === 'Laufen') return 'orange';
        if (sport === 'Schwimmen') return 'royalblue';
        if (sport === 'Radfahren') return 'seagreen';
        return 'slategray';
    }
</script>

<style>
    .page-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        padding: 0;
        box-sizing: border-box;
    }

    .calendar-root {
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
        padding: 2rem 1.5rem;
        font-family: system-ui, sans-serif;
        color: #0f172a;
        box-sizing: border-box;
    }

    .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
    }

    .calendar-title {
        font-size: 1.9rem;
        font-weight: 700;
    }

    .calendar-controls {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .calendar-controls button {
        border: none;
        background: #0f172a;
        color: white;
        padding: 0.75rem 1rem;
        border-radius: 10px;
        cursor: pointer;
    }

    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 0.75rem;
    }

    .weekday-label {
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        color: #475569;
        text-align: center;
    }

    .day-cell {
        min-height: 120px;
        border-radius: 18px;
        background: white;
        padding: 1rem;
        box-shadow: 0 10px 35px rgba(15, 23, 42, 0.05);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 0.75rem;
        overflow: hidden;
        position: relative;
    }

    .day-cell.not-current {
        opacity: 0.55;
    }

    .day-cell:hover {
        transform: translateY(-1px);
        transition: transform 0.15s ease;
    }

    .day-number {
        font-weight: 700;
        color: #0f172a;
    }

    .day-number.today {
        color: #2563eb;
    }

    .training-pill {
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        gap: 0.35rem;
        padding: 0.35rem 0.65rem;
        border-radius: 999px;
        font-size: 0.78rem;
        color: white;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 2rem;
    }

    .training-pill-indicator {
        width: 0.65rem;
        height: 0.65rem;
        border-radius: 50%;
        background: currentColor;
        flex-shrink: 0;
    }

    .training-pill-label {
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 6rem;
        vertical-align: middle;
    }

    .training-pill.past {
        background: #94a3b8;
    }

    .training-pill.planned {
        background: #fbbf24;
    }

    .training-pill.swimming {
        background: #3b82f6;
    }

    .training-pill.cycling {
        background: #22c55e;
    }

    .training-pill.running {
        background: #fb923c;
    }

    .training-dots-row {
        display: none;
        gap: 2px;
        justify-content: center;
        flex-wrap: wrap;
    }

    .training-dot {
        display: none;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .training-dot.past {
        background: #94a3b8;
    }

    .training-dot.planned {
        background: #fbbf24;
    }

    .training-dot.swimming {
        background: #3b82f6;
    }

    .training-dot.cycling {
        background: #22c55e;
    }

    .training-dot.running {
        background: #fb923c;
    }

    .training-row {
        display: grid;
        gap: 0.35rem;
    }

    .badge {
        border-radius: 999px;
        padding: 0.25rem 0.65rem;
        font-size: 0.78rem;
        background: #e2e8f0;
        color: #334155;
    }

    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.55);
        display: grid;
        place-items: center;
        padding: 1rem;
        z-index: 50;
    }

    .modal-sheet {
        width: min(100%, 760px);
        background: white;
        border-radius: 20px;
        padding: 1.5rem;
        box-shadow: 0 25px 60px rgba(15, 23, 42, 0.18);
        max-height: 92vh;
        overflow-y: auto;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .modal-close {
        border: none;
        background: transparent;
        font-size: 1.25rem;
        cursor: pointer;
        color: #475569;
    }

    .modal-form {
        display: grid;
        gap: 1rem;
    }

    .field-group {
        display: grid;
        gap: 0.4rem;
    }

    .field-group label {
        font-size: 0.9rem;
        color: #334155;
    }

    .field-group input,
    .field-group select {
        width: 100%;
        padding: 0.85rem 1rem;
        border-radius: 14px;
        border: 1px solid #cbd5e1;
        background: #f8fafc;
        font-size: 0.95rem;
    }

    .button-primary {
        border: none;
        background: #0f172a;
        color: white;
        padding: 0.95rem 1rem;
        border-radius: 14px;
        cursor: pointer;
        font-weight: 700;
    }

    .planned-list {
        display: grid;
        gap: 0.85rem;
    }

    .planned-item {
        border-radius: 16px;
        padding: 1rem;
        background: #f8fafc;
        display: grid;
        gap: 0.5rem;
    }

    .planned-meta {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .planned-meta span {
        font-size: 0.9rem;
        color: #475569;
    }

    .badge {
        border-radius: 999px;
        padding: 0.25rem 0.65rem;
        font-size: 0.78rem;
        background: #e2e8f0;
        color: #334155;
    }

    .status-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        background: #e2e8f0;
        border-radius: 999px;
        padding: 0.35rem 0.75rem;
        font-size: 0.85rem;
    }

    @media (max-width: 768px) {
        .calendar-root {
            padding: 1.5rem 1rem;
        }

        .calendar-grid {
            grid-template-columns: repeat(7, minmax(0, 1fr));
            gap: 0.4rem;
        }

        .weekday-label {
            font-size: 0.7rem;
        }

        .day-cell {
            min-height: 65px;
            height: 65px;
            padding: 0.25rem;
            gap: 0.2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
        }

        .day-number {
            font-size: 0.85rem;
        }

        .training-row {
            display: none;
        }

        .training-pill {
            display: none;
        }

        .training-dots-row {
            display: flex;
        }

        .training-dot {
            display: inline-block;
        }

        .badge {
            display: none;
        }
    }
</style>

<div class="page-wrapper">
    <div class="calendar-root">
        <div class="calendar-header">
            <div>
                <div class="calendar-title">Kalender</div>
            <div style="color:#475569; margin-top:0.35rem;">Hier siehst du vergangene Einheiten und kannst neue Trainings planen.</div>
        </div>

        <div class="calendar-controls">
            <button type="button" onclick={previousMonth}>← Zurück</button>
            <button type="button" onclick={nextMonth}>Vor →</button>
        </div>
    </div>

    <div style="margin-bottom:1rem; font-weight:600; color:#334155;">{monthLabel}</div>

    <div class="calendar-grid">
        {#each weekDays as day}
            <div class="weekday-label">{day}</div>
        {/each}

        {#each calendarDays as day}
            <button type="button" class="day-cell {day.isCurrentMonth ? '' : 'not-current'}" onclick={() => openDay(day)}>
                <div class="day-number {day.date.toISOString().slice(0,10) === today.toISOString().slice(0,10) ? 'today' : ''}">{day.date.getDate()}</div>
                {#if day.trainings.length > 0}
                    <div class="training-row">
                        {#each day.trainings.slice(0, 3) as item}
                            <span class="training-pill {item.isPlanned ? 'planned' : 'past'} {item.sport === 'Laufen' ? 'running' : item.sport === 'Schwimmen' ? 'swimming' : item.sport === 'Radfahren' ? 'cycling' : ''}">
                                <span class="training-pill-indicator" aria-hidden="true"></span>
                                <span class="training-pill-label">{item.sport} {item.isPlanned ? 'geplant' : '✓'}</span>
                            </span>
                        {/each}
                    </div>
                    <div class="training-dots-row">
                        {#each day.trainings.slice(0, 3) as item}
                            <span class="training-dot {item.isPlanned ? 'planned' : 'past'} {item.sport === 'Laufen' ? 'running' : item.sport === 'Schwimmen' ? 'swimming' : item.sport === 'Radfahren' ? 'cycling' : ''}" aria-hidden="true"></span>
                        {/each}
                    </div>
                    {#if day.trainings.length > 3}
                        <span class="badge">+{day.trainings.length - 3} weitere</span>
                    {/if}
                {/if}
            </button>
        {/each}
    </div>
    </div>
</div>

{#if showModal}
    <div class="modal-backdrop" role="button" tabindex="0" onclick={closeModal} onkeydown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); closeModal(); } }}>
        <div class="modal-sheet" role="dialog" tabindex="0" onclick={(event) => event.stopPropagation()} onkeydown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.stopPropagation(); } }}>
            <div class="modal-header">
                <div>
                    <div style="font-size:1.3rem; font-weight:700;">{selectedLabel}</div>
                    <div style="color:#64748b; margin-top:0.35rem;">{selectedIsFuture ? 'Hier kannst du ein neues Training planen.' : 'Details zu absolvierten Einheiten.'}</div>
                </div>
                <button class="modal-close" type="button" onclick={closeModal}>✕</button>
            </div>

            {#if selectedIsFuture}
                <form class="modal-form" method="POST" action="?/planTraining">
                    <input type="hidden" name="plannedDate" value={form.plannedDate} />

                    <div class="field-group">
                        <label for="sport">Sportart</label>
                        <select id="sport" name="sport" bind:value={form.sport}>
                            <option>Laufen</option>
                            <option>Schwimmen</option>
                            <option>Radfahren</option>
                        </select>
                    </div>

                    <div class="field-group">
                        <label for="duration">Geplante Dauer (Minuten)</label>
                        <input id="duration" name="duration" type="number" min="1" bind:value={form.duration} />
                    </div>

                    <div class="field-group">
                        <label for="distance">Geplante Distanz (km)</label>
                        <input id="distance" name="distance" type="number" min="0" step="0.1" bind:value={form.distance} />
                    </div>

                    <button class="button-primary" type="submit">Training planen</button>
                </form>

                {#if selectedTrainings.length > 0}
                    <div class="planned-list" style="margin-top:1.25rem;">
                        <div style="font-weight:700; color:#334155;">Geplante Einheiten an diesem Tag</div>
                        {#each selectedTrainings as item}
                            <div class="planned-item">
                                <div class="planned-meta">
                                    <span><strong>{item.sport}</strong></span>
                                    <span>{item.distance ?? 0} km • {item.durationMinutes ?? item.duration ?? '-'} min</span>
                                </div>
                                <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
                                    <span class="status-chip" style="background:{sportColor(item.sport)}22; color:{sportColor(item.sport)};">Geplant</span>
                                    <form method="POST" action="?/toggleComplete">
                                        <input type="hidden" name="id" value={item._id} />
                                        <button type="submit" class="button-primary" style="background:{sportColor(item.sport)};">Als erledigt markieren</button>
                                    </form>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            {:else}
                {#if selectedTrainings.length > 0}
                    <div class="planned-list">
                        {#each selectedTrainings as item}
                            <div class="planned-item">
                                <div style="display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
                                    <span><strong>{item.sport}</strong></span>
                                    <span class="status-chip">Abgeschlossen ✓</span>
                                </div>
                                <div class="planned-meta">
                                    <span>{item.distance ?? 0} km</span>
                                    <span>{item.durationMinutes ?? item.duration ?? '-'} min</span>
                                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                </div>
                                <div style="color:#475569;">{item.notes ?? 'Keine Notizen'}</div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <p style="color:#475569;">Für diesen Tag wurden noch keine absolvierten Einheiten gefunden.</p>
                {/if}
            {/if}
        </div>
    </div>
{/if}
