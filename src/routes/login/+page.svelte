<script>
	import { enhance } from '$app/forms';

	let isSubmitting = false;
	let form = null;
</script>

<div class="min-h-screen flex items-center justify-center p-4 bg-surface-50">
	<div class="max-w-md mx-auto card p-8 variant-glass-surface">
		<h1 class="h1 text-center mb-2">Login</h1>
		<p class="text-surface-600 text-center mb-6">Melde dich an, um auf deine TriBalance-Daten zuzugreifen.</p>

		{#if form?.errors}
			<div class="alert variant-filled-error mb-4">
				<div class="alert-title">Fehler</div>
				<div class="alert-message">
					{#if form.errors.general}<p>❌ {form.errors.general}</p>{/if}
					{#if form.errors.username}<p>❌ {form.errors.username}</p>{/if}
					{#if form.errors.password}<p>❌ {form.errors.password}</p>{/if}
				</div>
			</div>
		{/if}

		<form
			method="POST"
			action="?/login"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ result }) => {
					isSubmitting = false;
					if (result.type === 'failure' || result.type === 'error') {
						form = result.data;
					}
				};
			}}
			class="space-y-4"
		>
			<label class="field">
				<span class="small">Benutzername</span>
				<input type="text" name="username" autocomplete="username" required class="input w-full" on:input={() => { form = null; }} />
			</label>

			<label class="field">
				<span class="small">Passwort</span>
				<input type="password" name="password" autocomplete="current-password" required class="input w-full" on:input={() => { form = null; }} />
			</label>

			<button type="submit" class="btn variant-filled-primary w-full" disabled={isSubmitting}>
				{isSubmitting ? 'Anmeldung...' : 'Login'}
			</button>
		</form>

		<p class="text-center text-surface-600 mt-4">Noch kein Konto? <a href="/register" class="text-primary font-semibold">Registrieren</a></p>
	</div>
</div>
