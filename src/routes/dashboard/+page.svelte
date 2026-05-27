<script>
		let { data } = $props();
		import { enhance } from '$app/forms';
</script>

<div class="page-wrapper">
	<div class="header-section">
		<h1 class="h1">TriBalance Dashboard</h1>
		<p class="subtext">Übersicht deiner letzten Trainings</p>
	</div>

	<div class="main-card">
		<div style="display:grid;grid-template-columns:1fr;gap:1rem;">
			{#each data.trainings as training}
				<div style="background:#fff;border:1px solid #e6eef8;border-radius:12px;padding:1rem;display:flex;justify-content:space-between;align-items:flex-start;">
					<div>
						<h3 style="margin:0 0 0.25rem 0;font-weight:700">{training.sport}</h3>
						<p style="margin:0;color:#475569">{training.distance} km | {training.duration} min</p>
						<p style="margin-top:0.25rem;color:#64748b;font-size:0.9rem">Kalorien: {training.calories} kcal</p>
					</div>
					<form method="POST" action="?/deleteTraining" use:enhance>
						<input type="hidden" name="id" value={training._id} />
						<button type="submit" class="danger-btn">Löschen</button>
					</form>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.page-wrapper { max-width: 500px; margin: 2rem auto; padding: 0 1rem; font-family: system-ui, sans-serif; color: #1e293b; }
	.header-section { text-align: center; margin-bottom: 2rem; }
	.header-section .h1 { font-size: 2rem; font-weight: 800; margin: 0 0 0.5rem 0; }
	.subtext { color: #64748b; margin: 0 0 0.5rem 0; }
	.main-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 2.5rem; }
	.danger-btn { width: 100%; padding: 0.5rem 0.75rem; background: #ef4444; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
	.danger-btn:hover { background:#dc2626; }
</style>