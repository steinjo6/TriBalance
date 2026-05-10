<script>
	let { data } = $props();
	import { enhance } from '$app/forms';
</script>

<div class="p-8">
	<h1 class="h1 mb-6">TriBalance Dashboard</h1>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		{#each data.trainings as training}
			<div class="card p-4 variant-glass-surface {training.isWarning ? 'border-2 border-error-500' : ''}">
				<div class="flex justify-between">
					<div>
						<h3 class="h3">{training.sport}</h3>
						<p>{training.distance} km | {training.duration} min</p>
						<p class="text-sm opacity-70">Kalorien: {training.calories} kcal</p>
					</div>
					<form method="POST" action="?/deleteTraining" use:enhance>
						<input type="hidden" name="id" value={training._id} />
						<button class="btn btn-sm variant-soft-error">Löschen</button>
					</form>
				</div>
			</div>
		{/each}
	</div>
</div>