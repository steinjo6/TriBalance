<script>
	import Tracker from '$lib/components/Tracker.svelte';
	import { enhance } from '$app/forms';
	let trackerData = $state({ sport: 'Laufen', distance: 0, duration: 0, mentalScore: 3, painLevel: 0 });
	function handleInput(e) { trackerData = { ...e.detail }; }
</script>

<div class="p-8 max-w-xl mx-auto">
	<div class="card p-6 variant-glass-surface">
		<Tracker on:input={handleInput} />
		<form method="POST" action="?/create" use:enhance class="mt-6">
			<input type="hidden" name="sport" value={trackerData.sport} />
			<input type="hidden" name="distance" value={trackerData.distance} />
			<input type="hidden" name="duration" value={trackerData.duration} />
			<input type="hidden" name="mentalScore" value={trackerData.mentalScore} />
			<input type="hidden" name="painLevel" value={trackerData.painLevel} />
			<button type="submit" class="btn variant-filled-primary w-full">Training speichern</button>
		</form>
	</div>
</div>