<script lang="ts">
// src/lib/components/Tracker.svelte
// Tracker-Komponente: Stoppuhr + GPS-Tracking + Form-Felder
// - Geolocation-Abfrage ist in onMount gekapselt (keine SSR-Seitenwirkungen)
// - Haversine-Formel zur Distanz-Berechnung
// - Dispatch von 'input' Events, damit Parent-Formulare live befüllt werden können

import { onMount, onDestroy, createEventDispatcher } from 'svelte';
import { writable } from 'svelte/store';

const dispatcher = createEventDispatcher();

// Form fields (exported so Parent optional direkt binden kann)
// Svelte 5 State-Variablen (reaktiv)
let sport = $state('Rad');
let distance = $state(0);
let duration = $state(0);
let mentalScore = $state(3);
let painLevel = $state(0);

//Props von aussen empfangen:
let { initialSport = 'Rad' } = $props();

// Stopwatch internal state
let running = false;
let startTs = 0; // timestamp when started
let elapsed = 0; // elapsed ms while running
let timer: number | null = null;

// Geolocation state
let watchId: number | null = null;
let lastPos: { lat: number; lon: number } | null = null;

// Utility: dispatch current form state to parent for live updates
function emitUpdate() {
	dispatcher('input', { sport, distance: Number(distance), duration: Number(duration), mentalScore, painLevel });
}

// Stopwatch controls
function startPause() {
	if (!running) {
		running = true;
		startTs = Date.now() - elapsed;
		// update every second
		timer = setInterval(() => {
			elapsed = Date.now() - startTs;
			duration = Math.round((elapsed / 60000) * 100) / 100; // minutes, 2 decimals
			emitUpdate();
		}, 1000) as unknown as number;
	} else {
		running = false;
		if (timer) clearInterval(timer);
	}
}

function reset() {
	running = false;
	if (timer) clearInterval(timer);
	elapsed = 0;
	duration = 0;
	emitUpdate();
}

// Haversine formula to compute distance between two lat/lon points in km
function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const R = 6371; // Earth radius in km
	const dLat = toRad(b.lat - a.lat);
	const dLon = toRad(b.lon - a.lon);
	const lat1 = toRad(a.lat);
	const lat2 = toRad(b.lat);
	const sinDLat = Math.sin(dLat / 2) ** 2;
	const sinDLon = Math.sin(dLon / 2) ** 2;
	const c = 2 * Math.asin(Math.sqrt(sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon));
	return R * c;
}

// Setup geolocation in onMount to avoid SSR issues
onMount(() => {
	if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
		console.warn('Geolocation nicht verfügbar');
		return;
	}

	// watchPosition provides continuous updates; update distance cumulatively
	watchId = navigator.geolocation.watchPosition(
		(pos) => {
			const lat = pos.coords.latitude;
			const lon = pos.coords.longitude;
			const current = { lat, lon };
			if (lastPos) {
				const deltaKm = haversine(lastPos, current);
				// Guard: ignore impossible spikes (GPS glitches)
				if (deltaKm < 2) { // if difference less than 2km between samples, accept
					distance = Math.round((distance + deltaKm) * 100) / 100; // keep 2 decimals
				}
			}
			lastPos = current;
			emitUpdate();
		},
		(err) => {
			console.warn('Geolocation-Error', err);
		},
		{ enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
	);

	return () => {
		if (watchId !== null && navigator.geolocation.clearWatch) {
			navigator.geolocation.clearWatch(watchId);
		}
	};
});

onDestroy(() => {
	if (timer) clearInterval(timer);
	if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation.clearWatch) {
		navigator.geolocation.clearWatch(watchId);
	}
});

// Simple validation helper for client-side; final validation must be server-side
let valid = $derived(distance >= 0 && duration >= 0 && ['Schwimmen', 'Rad', 'Lauf'].includes(sport));

</script>

<style>
.tracker { display:flex; flex-direction:column; gap:0.5rem; }
.row { display:flex; gap:0.5rem; align-items:center; }
.field { display:flex; flex-direction:column; flex:1; }
.controls { display:flex; gap:0.5rem; }
.small { font-size:0.85rem; color: #666; }
</style>

<div class="tracker" role="region" aria-label="Activity Tracker">
	<!-- Sport selection -->
	<div class="row">
		<label class="field">
			<span class="small">Sportart</span>
			<select bind:value={sport} on:change={emitUpdate}>
				<option>Schwimmen</option>
				<option selected>Rad</option>
				<option>Lauf</option>
			</select>
		</label>
	</div>

	<!-- Distance (auto-filled by GPS) -->
	<div class="row">
		<label class="field">
			<span class="small">Distanz (km)</span>
			<input type="number" step="0.01" min="0" bind:value={distance} on:input={emitUpdate} />
		</label>
		<label style="width:140px; text-align:center;">
			<span class="small">Pain Level</span>
			<input type="range" min="0" max="10" bind:value={painLevel} on:input={emitUpdate} />
			<div>{painLevel}</div>
		</label>
	</div>

	<!-- Duration (auto-filled by stopwatch) -->
	<div class="row">
		<label class="field">
			<span class="small">Dauer (min)</span>
			<input type="number" min="0" step="0.01" bind:value={duration} on:input={emitUpdate} />
		</label>
		<label style="width:140px;text-align:center;">
			<span class="small">Mental Score</span>
			<input type="range" min="1" max="5" bind:value={mentalScore} on:input={emitUpdate} />
			<div>{mentalScore}</div>
		</label>
	</div>

	<!-- Stopwatch controls -->
	<div class="controls">
		<button on:click={startPause}>{running ? 'Pause' : 'Start'}</button>
		<button on:click={reset}>Reset</button>
		<div style="margin-left:auto; align-self:center; font-weight:600;">{duration} min</div>
	</div>

	<!-- Small hint about GPS -->
	<div class="small">GPS-Tracking: aktiviert (nur im Browser). Reduce spikes werden herausgefiltert.</div>

	<!-- Emit a final update when user leaves the component (optional) -->
</div>
