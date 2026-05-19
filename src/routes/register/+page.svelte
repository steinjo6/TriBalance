<script>
	import { enhance } from '$app/forms';

	let isSubmitting = $state(false);
	let form = $state(null);
</script>

<div class="p-4 sm:p-8 min-h-screen flex items-center justify-center bg-surface-50">
	<div class="w-full max-w-md space-y-6">
		<div class="text-center space-y-2">
			<h1 class="h2">Registrieren</h1>
			<p class="text-surface-600">Erstelle dein Konto und erlebe den vollständigen Bestätigungs-Flow.</p>
		</div>

		{#if form?.requireVerification}
			<div class="alert variant-filled-primary">
				<div class="alert-title">Bestätigung erforderlich</div>
				<div class="alert-message">
					Bestätigungs-Code wurde an Ihre E-Mail gesendet! (Für den Prototypen-Test: Code lautet {form?.mockCode ?? '1234'})
				</div>
			</div>

			<form
				method="POST"
				action="?/confirm"
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
				<input type="hidden" name="username" value={form?.data?.username ?? ''} />
				<input type="hidden" name="password" value={form?.data?.password ?? ''} />
				<input type="hidden" name="name" value={form?.data?.name ?? ''} />
				<input type="hidden" name="birthdate" value={form?.data?.birthdate ?? ''} />

				<label class="field">
					<span class="small">Bestätigungs-Code</span>
					<input type="text" name="confirmationCode" autocomplete="one-time-code" required class="w-full min-h-[44px]" />
				</label>

				{#if form?.errors?.confirmationCode}
					<div class="text-sm text-error">❌ {form.errors.confirmationCode}</div>
				{/if}

				<button type="submit" class="btn variant-filled-primary w-full min-h-[48px] text-base" disabled={isSubmitting}>
					{isSubmitting ? 'Überprüfe Code...' : 'Code bestätigen'}
				</button>
			</form>
		{:else}
			{#if form?.errors}
				<div class="alert variant-filled-error">
					<div class="alert-title">Fehler</div>
					<div class="alert-message space-y-2">
						{#if form.errors.username}<p>❌ {form.errors.username}</p>{/if}
						{#if form.errors.password}<p>❌ {form.errors.password}</p>{/if}
						{#if form.errors.name}<p>❌ {form.errors.name}</p>{/if}
						{#if form.errors.birthdate}<p>❌ {form.errors.birthdate}</p>{/if}
						{#if form.errors.general}<p>❌ {form.errors.general}</p>{/if}
					</div>
				</div>
			{/if}

			<form
				method="POST"
				action="?/register"
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
					<input type="text" name="username" autocomplete="username" value={form?.data?.username ?? ''} required class="w-full min-h-[44px]" />
				</label>

				<label class="field">
					<span class="small">Passwort</span>
					<input type="password" name="password" autocomplete="new-password" required class="w-full min-h-[44px]" />
				</label>

				<label class="field">
					<span class="small">Voller Name</span>
					<input type="text" name="name" autocomplete="name" value={form?.data?.name ?? ''} required class="w-full min-h-[44px]" />
				</label>

				<label class="field">
					<span class="small">Geburtsdatum</span>
					<input type="date" name="birthdate" value={form?.data?.birthdate ?? ''} required class="w-full min-h-[44px]" />
				</label>

				<button type="submit" class="btn variant-filled-primary w-full min-h-[48px] text-base" disabled={isSubmitting}>
					{isSubmitting ? 'Registriere...' : 'Konto erstellen'}
				</button>
			</form>
		{/if}

		<p class="text-center text-surface-600">Schon ein Konto? <a href="/login" class="text-primary font-semibold">Login</a></p>
	</div>
</div>
