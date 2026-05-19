<script>
	import Tracker from '$lib/components/Tracker.svelte';
	import { enhance } from '$app/forms';

	let trackerData = $state({
		sport: 'Laufen',
		distance: 0,
		duration: 0,
		mentalScore: 3,
		painLevel: 0
	});

	let isSubmitting = $state(false);
	let form = $state(null);

	function handleInput(e) {
		trackerData = { ...e.detail };
	}
</script>

<div class="p-4 sm:p-8 max-w-xl mx-auto">
	<div class="card p-4 sm:p-6 variant-glass-surface space-y-6">
		<div class="space-y-3">
			<h1 class="h2">Neues Training</h1>
			<p class="text-surface-600">Verwende den Tracker, um dein Training direkt mobil zu protokollieren.</p>
		</div>
		<Tracker on:input={handleInput} />

		{#if form?.errors}
			<div class="alert variant-filled-error mt-6">
				<div class="alert-title">Validierungsfehler</div>
				<div class="alert-message">
					{#if form.errors.sport}
						<p>❌ {form.errors.sport}</p>
					{/if}
					{#if form.errors.distance}
						<p>❌ {form.errors.distance}</p>
					{/if}
					{#if form.errors.duration}
						<p>❌ {form.errors.duration}</p>
					{/if}
					{#if form.errors.painLevel}
						<p>❌ {form.errors.painLevel}</p>
					{/if}
					{#if form.errors.mentalScore}
						<p>❌ {form.errors.mentalScore}</p>
					{/if}
					{#if form.errors.database}
						<p>❌ {form.errors.database}</p>
					{/if}
				</div>
			</div>
		{/if}

		<form
			method="POST"
			action="?/create"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ result }) => {
					isSubmitting = false;
					if (result.type === 'failure' || result.type === 'error') {
						form = result.data;
					} else if (result.type === 'redirect') {
						form = null;
					}
				};
			}}
			class="space-y-4"
		>
			<input type="hidden" name="sport" value={trackerData.sport} />
			<input type="hidden" name="distance" value={trackerData.distance} />
			<input type="hidden" name="duration" value={trackerData.duration} />
			<input type="hidden" name="mentalScore" value={trackerData.mentalScore} />
			<input type="hidden" name="painLevel" value={trackerData.painLevel} />

			<button
				type="submit"
				disabled={isSubmitting}
				class="btn variant-filled-primary w-full min-h-[48px] text-base"
			>
				{isSubmitting ? 'Wird gespeichert...' : 'Training speichern'}
			</button>
		</form>
	</div>
</div>