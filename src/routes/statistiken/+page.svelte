<script>
	import { formatDate } from '$lib/utils.js';

	let { data } = $props();
</script>

<svelte:head>
	<title>Statistiken</title>
</svelte:head>

<div class="p-8 max-w-4xl mx-auto">
	<div class="mb-8">
		<h1 class="h1">Training Statistiken</h1>
		<p class="text-surface-600">Übersicht deiner absolvierten Trainings</p>
	</div>

	{#if data.success && data.trainings.length > 0}
		<div class="grid gap-4">
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
				<!-- Gesamtanzahl Trainings -->
				<div class="card p-4 variant-glass-surface">
					<div class="text-sm text-surface-600">Trainings gesamt</div>
					<div class="text-3xl font-bold">{data.trainings.length}</div>
				</div>

				<!-- Gesamtdistanz -->
				<div class="card p-4 variant-glass-surface">
					<div class="text-sm text-surface-600">Gesamtdistanz</div>
					<div class="text-3xl font-bold">
						{data.trainings.reduce((sum, t) => sum + t.distance, 0).toFixed(1)}
						<span class="text-sm">km</span>
					</div>
				</div>

				<!-- Gesamtdauer -->
				<div class="card p-4 variant-glass-surface">
					<div class="text-sm text-surface-600">Gesamtdauer</div>
					<div class="text-3xl font-bold">
						{Math.round(data.trainings.reduce((sum, t) => sum + t.duration, 0) / 60)}
						<span class="text-sm">h</span>
					</div>
				</div>

				<!-- Durchschn. Wohlbefinden -->
				<div class="card p-4 variant-glass-surface">
					<div class="text-sm text-surface-600">Ø Mental Score</div>
					<div class="text-3xl font-bold">
						{(
							data.trainings.reduce((sum, t) => sum + t.mentalScore, 0) /
							data.trainings.length
						).toFixed(1)}
						<span class="text-sm">/5</span>
					</div>
				</div>
			</div>

			<!-- Trainings-Tabelle -->
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
							<tr class="border-b border-surface-200 hover:bg-surface-50">
								<td class="py-3">
									{new Date(training.createdAt).toLocaleDateString('de-DE')}
									<span class="text-xs text-surface-600 block">
										{new Date(training.createdAt).toLocaleTimeString('de-DE', {
											hour: '2-digit',
											minute: '2-digit'
										})}
									</span>
								</td>
								<td class="py-3">{training.sport}</td>
								<td class="text-right py-3">{training.distance.toFixed(1)} km</td>
								<td class="text-right py-3">{training.duration} min</td>
								<td class="text-center py-3">
									<span class="badge variant-soft-error">{training.painLevel}/10</span>
								</td>
								<td class="text-center py-3">
									<span
										class="badge"
										class:variant-soft-success={training.mentalScore >= 4}
										class:variant-soft-warning={training.mentalScore === 3}
										class:variant-soft-error={training.mentalScore <= 2}
									>
										{training.mentalScore}/5
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else if !data.success}
		<div class="alert variant-filled-error">
			<div class="alert-title">Fehler beim Laden</div>
			<div class="alert-message">{data.error || 'Trainings konnten nicht geladen werden'}</div>
		</div>
	{:else}
		<div class="alert variant-filled-surface">
			<div class="alert-title">Keine Trainings vorhanden</div>
			<div class="alert-message">
				Starten Sie ein Training, um hier Ihre Statistiken zu sehen.
			</div>
		</div>
	{/if}

	<div class="mt-8">
		<a href="/trainings" class="btn variant-outlined-primary">← Zurück zu Trainings</a>
	</div>
</div>

<style>
	table {
		border-collapse: collapse;
	}
</style>
