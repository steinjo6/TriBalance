<script>
    import { enhance } from '$app/forms';

    // Svelte 5 Props: Holt die Daten vom Server
    let { data } = $props();

    // Fallback-Sicherheit für das Logbuch: Holt die Liste direkt im Skript ab
    let eintraege = $derived(data?.trainings || data?.logs || data?.history || []);

    // Zustand für das Tab-System ('live' oder 'manual')
    let activeTab = $state('live');
    let isSubmitting = $state(false);

    // Formularzustand für manuelles Eintragen
    let manual = $state({
        sport: 'Laufen',
        datetime: new Date().toISOString().slice(0, 16),
        duration: 60,
        distance: '',
        notes: ''
    });

    // Zustand für das Live-Tracking
    let isLive = $state(false);
    let elapsed = $state(0);
    let timerId = null;
    let liveSport = $state('Laufen');
    let showLiveFinish = $state(false);
    let liveDistance = $state('');

    // Stoppuhr-Formatierung
    const timeDisplay = $derived((() => {
        const s = elapsed % 60;
        const m = Math.floor(elapsed / 60) % 60;
        const h = Math.floor(elapsed / 3600);
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    })());

    function startLive() {
        isLive = true;
        elapsed = 0;
        showLiveFinish = false;
        timerId = setInterval(() => { elapsed = elapsed + 1; }, 1000);
    }

    function stopLive() {
        isLive = false;
        if (timerId) { clearInterval(timerId); timerId = null; }
        showLiveFinish = true;
    }

    async function submitLive() {
        isSubmitting = true;
        const fd = new FormData();
        fd.append('sport', liveSport);
        fd.append('durationSeconds', String(elapsed));
        fd.append('distance', liveDistance || '0');
        fd.append('datetime', new Date().toISOString());

        try {
            await fetch('?/create', { method: 'POST', body: fd });
            window.location.reload(); 
        } catch (e) {
            isSubmitting = false;
            alert('Fehler: ' + e.message);
        }
    }

    async function submitManual() {
        isSubmitting = true;
        const fd = new FormData();
        fd.append('sport', manual.sport);
        fd.append('datetime', manual.datetime);
        fd.append('duration', String(manual.duration));
        fd.append('distance', manual.distance || '0');
        fd.append('notes', manual.notes);

        try {
            await fetch('?/create', { method: 'POST', body: fd });
            window.location.reload();
        } catch (e) {
            isSubmitting = false;
            alert('Fehler: ' + e.message);
        }
    }
</script>

<style>
    .trainings-wrapper {
        max-width: 500px;
        margin: 2rem auto;
        padding: 0 1rem;
        font-family: system-ui, sans-serif;
        color: #1e293b;
    }
    .header-section {
        text-align: center;
        margin-bottom: 2rem;
    }
    .tab-container {
        display: flex;
        background: #e2e8f0;
        padding: 0.35rem;
        border-radius: 12px;
        margin-bottom: 2rem;
    }
    .tab-btn {
        flex: 1;
        background: none;
        border: none;
        padding: 0.75rem;
        font-weight: bold;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s;
        color: #475569;
    }
    .tab-btn.active {
        background: #ffffff;
        color: #0f172a;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .main-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        margin-bottom: 2.5rem;
    }
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
    }
    .form-group:last-child {
        margin-bottom: 0;
    }
    .form-label {
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
    }
    .custom-input, .custom-select, .custom-textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        background: #f8fafc;
        font-size: 1rem;
        box-sizing: border-box;
    }
    .custom-input:focus, .custom-select:focus, .custom-textarea:focus {
        outline: none;
        border-color: #3b82f6;
        background: #ffffff;
    }
    .custom-textarea {
        resize: none;
        height: 100px;
    }
    .primary-btn {
        width: 100%;
        padding: 1rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: bold;
        font-size: 1rem;
        cursor: pointer;
        transition: background 0.2s;
    }
    .primary-btn:hover {
        background: #2563eb;
    }
    .primary-btn:disabled {
        background: #94a3b8;
        cursor: not-allowed;
    }
    
    .danger-btn {
        width: 100%;
        padding: 1rem;
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: bold;
        font-size: 1rem;
        cursor: pointer;
        transition: background 0.2s;
    }
    .danger-btn:hover {
        background: #dc2626;
    }
    .danger-btn:disabled {
        background: #fca5a5;
        cursor: not-allowed;
    }

    .stoppuhr-container {
        text-align: center;
        padding: 1.5rem 0;
    }
    .stoppuhr-zeit {
        font-family: monospace;
        font-size: 4rem;
        font-weight: 700;
        color: #0f172a;
    }
    .live-indicator {
        font-size: 0.875rem;
        color: #10b981;
        font-weight: 600;
        margin-top: 0.5rem;
    }
    .finish-box {
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        margin-top: 1.5rem;
    }
    .logbuch-section {
        border-top: 2px solid #e2e8f0;
        padding-top: 2rem;
    }
    .log-item {
        background: white;
        border: 1px solid #e2e8f0;
        padding: 1rem;
        border-radius: 12px;
        margin-bottom: 0.75rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .distance-badge {
        background: #dbeafe;
        color: #1e40af;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        font-family: monospace;
        font-weight: bold;
    }
</style>

<div class="trainings-wrapper">
    
    <div class="header-section">
        <h1 style="font-size: 2rem; margin: 0 0 0.5rem 0; font-weight: 800;">Trainings</h1>
        <p style="margin: 0; color: #64748b; font-size: 0.95rem;">Wähle eine Option, um deine Einheiten zu speichern.</p>
    </div>

    <div class="tab-container">
        <button type="button" class="tab-btn {activeTab === 'live' ? 'active' : ''}" onclick={() => activeTab = 'live'}>
            ⏱️ Live-Tracking
        </button>
        <button type="button" class="tab-btn {activeTab === 'manual' ? 'active' : ''}" onclick={() => activeTab = 'manual'}>
            ✍️ Manuell nachtragen
        </button>
    </div>

    <div class="main-card">
        
        {#if activeTab === 'live'}
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                
                {#if !isLive && !showLiveFinish}
                    <div class="form-group">
                        <span class="form-label">Sportart</span>
                        <select bind:value={liveSport} class="custom-select">
                            <option>Laufen</option>
                            <option>Radfahren</option>
                            <option>Schwimmen</option>
                            <option>Krafttraining</option>
                            <option>Andere</option>
                        </select>
                    </div>
                    <button type="button" class="primary-btn" onclick={startLive}>
                        ⏱️ Live-Training starten
                    </button>
                {/if}

                {#if isLive}
                    <div class="stoppuhr-container">
                        <div class="stoppuhr-zeit">{timeDisplay}</div>
                        <div class="live-indicator">● Live-Tracking läuft</div>
                    </div>
                    <button type="button" class="danger-btn" onclick={stopLive}>
                        ⏹️ Training beenden
                    </button>
                {/if}

                {#if showLiveFinish}
                    <div class="finish-box">
                        <p><strong>Dauer:</strong> {timeDisplay}</p>
                        <div class="form-group">
                            <label for="live-distance" class="form-label">Distanz (optional, km)</label>
                            <input id="live-distance" type="number" min="0" step="0.01" bind:value={liveDistance} class="custom-input" />
                        </div>
                        <button type="button" class="primary-btn" onclick={submitLive} disabled={isSubmitting}>
                            {isSubmitting ? 'Speichert…' : '✓ Speichern & beenden'}
                        </button>
                    </div>
                {/if}

            </div>
        {/if}

        {#if activeTab === 'manual'}
            <form onsubmit={(e) => { e.preventDefault(); submitManual(); }} style="display: flex; flex-direction: column; gap: 1.5rem;">
                
                <div class="form-group">
                    <label for="manual-sport" class="form-label">Sportart</label>
                    <select id="manual-sport" bind:value={manual.sport} class="custom-select">
                        <option>Laufen</option>
                        <option>Radfahren</option>
                        <option>Schwimmen</option>
                        <option>Krafttraining</option>
                        <option>Andere</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="manual-datetime" class="form-label">Datum & Uhrzeit</label>
                    <input id="manual-datetime" type="datetime-local" bind:value={manual.datetime} class="custom-input" />
                </div>

                <div class="form-group">
                    <label for="manual-duration" class="form-label">Dauer (Minuten)</label>
                    <input id="manual-duration" type="number" min="1" step="1" bind:value={manual.duration} class="custom-input" />
                </div>

                <div class="form-group">
                    <label for="manual-distance" class="form-label">Distanz (optional, km)</label>
                    <input id="manual-distance" type="number" min="0" step="0.01" bind:value={manual.distance} class="custom-input" />
                </div>

                <div class="form-group">
                    <label for="manual-notes" class="form-label">Notizen</label>
                    <textarea id="manual-notes" bind:value={manual.notes} class="custom-textarea"></textarea>
                </div>

                <button type="submit" class="primary-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Speichert…' : '✓ Speichern'}
                </button>

            </form>
        {/if}

    </div>

    {#if eintraege && eintraege.length > 0}
        <div class="logbuch-section">
            <h2 style="font-size: 1.35rem; font-weight: 700; margin: 0 0 1.25rem 0;">Letzte Einheiten</h2>
            {#each eintraege as entry (entry._id)}
                <div class="log-item">
                    <div>
                        <div style="font-weight: 700; margin-bottom: 0.25rem;">{entry.sport}</div>
                        <div style="font-size: 0.85rem; color: #64748b;">
                            {entry.duration} Min
                            {#if entry.distance && entry.distance > 0}
                                · {entry.distance} km
                            {/if}
                        </div>
                    </div>
                    {#if entry.distance && entry.distance > 0}
                        <div class="distance-badge">{entry.distance} km</div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}

</div>
