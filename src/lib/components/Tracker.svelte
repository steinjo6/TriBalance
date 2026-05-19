<script lang="ts">
import { onMount, onDestroy, createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher();

// Svelte 5 Reactive States
let sport = $state('Rad');
let distance = $state(0);
let duration = $state(0);
let mentalScore = $state(3);
let painLevel = $state(0);
let simulationMode = $state(false);

let running = $state(false);
let elapsed = 0;
let startTs = 0;
let timer: number | null = null;
let watchId: number | null = null;
let simInterval: number | null = null;
let lastPos: { lat: number; lon: number } | null = null;
let lastTimestamp = 0;

// FIX: Richtige Svelte 5 Syntax für komplexe Berechnungen via $derived.by
let currentPace = $derived.by(() => {
    if (distance <= 0) return '–';
    const pace = duration / distance;
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${String(seconds).padStart(2, '0')} min/km`;
});

function emitUpdate() {
    dispatch('input', {
        sport,
        distance: Number(distance),
        duration: Number(duration),
        mentalScore,
        painLevel
    });
}

function formatDistance(value: number) {
    return Math.round(value * 100) / 100;
}

// Start / Pause für die Zeitmessung
function startPause() {
    if (!running) {
        running = true;
        startTs = Date.now() - elapsed;
        timer = setInterval(() => {
            elapsed = Date.now() - startTs;
            duration = formatDistance(elapsed / 60000);
            emitUpdate();
        }, 1000) as unknown as number;

        // Wenn der Simulationsmodus aktiv ist, koppeln wir die Bewegung direkt an den Start
        if (simulationMode) {
            startSimulation();
        }
    } else {
        running = false;
        if (timer) clearInterval(timer);
        stopSimulation();
    }
}

function reset() {
    running = false;
    if (timer) clearInterval(timer);
    if (simInterval) clearInterval(simInterval);
    elapsed = 0;
    duration = 0;
    distance = 0;
    lastPos = null;
    lastTimestamp = 0;
    simulationMode = false;
    emitUpdate();
}

function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2) ** 2;
    const sinDLon = Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.asin(Math.sqrt(sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon));
    return R * c;
}

function startSimulation() {
    if (simInterval) return;
    simInterval = setInterval(() => {
        if (running) { // Simuliert nur, wenn die Uhr auch läuft!
            distance = formatDistance(distance + 0.05);
            emitUpdate();
        }
    }, 2000) as unknown as number;
}

function stopSimulation() {
    if (simInterval) {
        clearInterval(simInterval);
        simInterval = null;
    }
}

function toggleSimulation() {
    if (simulationMode) {
        if (running) startSimulation();
    } else {
        stopSimulation();
    }
}

onMount(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
        console.warn('Geolocation nicht verfügbar');
        return;
    }

    watchId = navigator.geolocation.watchPosition(
        (pos) => {
            // Wenn Simulation aktiv ist, echtes GPS ignorieren
            if (simulationMode || !running) return;

            const current = {
                lat: pos.coords.latitude,
                lon: pos.coords.longitude
            };
            const now = pos.timestamp || Date.now();

            if (lastPos && lastTimestamp) {
                const deltaKm = haversine(lastPos, current);
                const deltaH = Math.max((now - lastTimestamp) / 3600000, 1 / 3600);
                const speedKmh = deltaKm / deltaH;
                if (speedKmh <= 50 && deltaKm <= 1) {
                    distance = formatDistance(distance + deltaKm);
                }
            }

            lastPos = current;
            lastTimestamp = now;
            emitUpdate();
        },
        (err) => {
            console.warn('Geolocation-Error', err);
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );
});

onDestroy(() => {
    if (timer) clearInterval(timer);
    if (simInterval) clearInterval(simInterval);
    if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation.clearWatch) {
        navigator.geolocation.clearWatch(watchId);
    }
});
</script>

<style>
.tracker {
    display: grid;
    gap: 1rem;
    width: 100%;
}

.row {
    display: grid;
    gap: 0.75rem;
}

@media (min-width: 640px) {
    .row {
        grid-template-columns: 1fr 1fr;
    }
}

.field {
    display: grid;
    gap: 0.5rem;
    width: 100%;
}

input,
select,
button {
    min-height: 44px;
    border-radius: 14px;
    border: 1px solid rgba(15, 23, 42, 0.16);
    padding: 0.85rem 1rem;
    font-size: 1rem;
    width: 100%;
    box-sizing: border-box;
}

button {
    background: #0f172a;
    color: white;
    font-weight: 700;
    cursor: pointer;
}

button:hover {
    background: #1e293b;
}

.controls {
    display: grid;
    gap: 0.75rem;
}

@media (min-width: 640px) {
    .controls {
        grid-template-columns: 1fr 1fr auto;
        align-items: center;
    }
}

.status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
}

.status-pill {
    padding: 0.75rem 1rem;
    border-radius: 999px;
    background: rgba(6, 182, 212, 0.12);
    color: #0891b2;
    font-weight: 700;
}

.small {
    font-size: 0.9rem;
    color: #475569;
}
</style>

<div class="tracker" role="region" aria-label="Activity Tracker">
    <div class="status-row">
        <label class="field">
            <span class="small">Indoor-Modus (Klassenzimmer)</span>
            <div style="display:flex; align-items:center; gap:0.75rem;">
                <input type="checkbox" bind:checked={simulationMode} onchange={toggleSimulation} style="width: 20px; min-height: 20px;" />
                <span>{simulationMode ? 'Simulation aktiv 🏃‍♂️' : 'Echtes GPS aktiv 📡'}</span>
            </div>
        </label>
        <div class="status-pill">Pace: {currentPace}</div>
    </div>

    <div class="field">
        <label>
            <span class="small">Sportart</span>
            <select bind:value={sport} onchange={emitUpdate}>
                <option>Schwimmen</option>
                <option>Rad</option>
                <option>Lauf</option>
            </select>
        </label>
    </div>

    <div class="row">
        <label class="field">
            <span class="small">Distanz (km)</span>
            <input type="number" step="0.01" min="0" bind:value={distance} oninput={emitUpdate} />
        </label>
        <label class="field">
            <span class="small">Pain Level</span>
            <input type="range" min="0" max="10" bind:value={painLevel} oninput={emitUpdate} />
            <div style="font-weight: 600; text-align: right;">{painLevel} / 10</div>
        </label>
    </div>

    <div class="row">
        <label class="field">
            <span class="small">Dauer (min)</span>
            <input type="number" min="0" step="0.01" bind:value={duration} oninput={emitUpdate} />
        </label>
        <label class="field">
            <span class="small">Mental Score</span>
            <input type="range" min="1" max="5" bind:value={mentalScore} oninput={emitUpdate} />
            <div style="font-weight: 600; text-align: right;">{mentalScore} / 5</div>
        </label>
    </div>

    <div class="controls">
        <button onclick={startPause} type="button" style="background: {running ? '#f59e0b' : '#0f172a'}">
            {running ? 'Pause' : 'Start'}
        </button>
        <button onclick={reset} type="button" style="background: #64748b;">Reset</button>
        <div style="font-weight:700; display:flex; align-items:center; justify-content:center; min-height:44px; font-size: 1.25rem;">
            {duration} min
        </div>
    </div>

    <div class="small">GPS-Tracking-Schutz: Unrealistische Sprünge (> 50 km/h) werden automatisch ignoriert.</div>
</div>