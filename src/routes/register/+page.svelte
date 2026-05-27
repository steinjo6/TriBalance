<script>
	import { enhance } from '$app/forms';

	let isSubmitting = $state(false);
	let form = $state(null);
</script>

<div class="page-wrapper">
	<div class="header-section">
		<h1 class="h2">Registrieren</h1>
		<p class="subtext">Erstelle dein Konto und erlebe den vollständigen Bestätigungs-Flow.</p>
	</div>

	<div class="main-card">
		{#if form?.verificationSent}
			<div class="alert variant-filled-primary">
				<div class="alert-title">E-Mail-Verifizierung gesendet</div>
				<div class="alert-message">Der Verifizierungslink wurde in der Server-Konsole ausgegeben. Bitte öffne ihn, um deine E-Mail zu bestätigen.</div>
			</div>
		{:else if form?.requireVerification}
			<div class="alert variant-filled-primary">
				<div class="alert-title">Bestätigung erforderlich</div>
				<div class="alert-message">Bestätigungs-Code wurde an Ihre E-Mail gesendet! (Für den Prototypen-Test: Code lautet {form?.mockCode ?? '1234'})</div>
			</div>

			<form
				method="POST"
				action="?/confirm"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ result }) => {
						isSubmitting = false;
						if (result.type === 'failure' || result.type === 'error') { form = result.data; }
					};
				}}
				class="space-y-4"
			>
				<input type="hidden" name="username" value={form?.data?.username ?? ''} />
				<input type="hidden" name="password" value={form?.data?.password ?? ''} />
				<input type="hidden" name="name" value={form?.data?.name ?? ''} />
				<input type="hidden" name="birthdate" value={form?.data?.birthdate ?? ''} />

				<div class="form-group">
					<label class="form-label">Bestätigungs-Code</label>
					<input type="text" name="confirmationCode" autocomplete="one-time-code" required class="custom-input" />
				</div>

				{#if form?.errors?.confirmationCode}
					<div class="text-sm text-error">❌ {form.errors.confirmationCode}</div>
				{/if}

				<button type="submit" class="primary-btn" disabled={isSubmitting}>{isSubmitting ? 'Überprüfe Code...' : 'Code bestätigen'}</button>
			</form>
		{:else}
			{#if form?.errors}
				<div class="alert variant-filled-error">
					<div class="alert-title">Fehler</div>
					<div class="alert-message space-y-2">
						{#if form.errors.username}<p>❌ {form.errors.username}</p>{/if}
						{#if form.errors.password}<p>❌ {form.errors.password}</p>{/if}
						{#if form.errors.name}<p>❌ {form.errors.name}</p>{/if}
						{#if form.errors.email}<p>❌ {form.errors.email}</p>{/if}
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
					return async ({ result }) => { isSubmitting = false; form = result.data; };
				}}
				class="space-y-4"
			>
				<div class="form-group">
					<label class="form-label">Benutzername</label>
					<input type="text" name="username" autocomplete="username" value={form?.data?.username ?? ''} required class="custom-input" />
				</div>

				<div class="form-group">
					<label class="form-label">Passwort</label>
					<input type="password" name="password" autocomplete="new-password" required class="custom-input" />
				</div>

				<div class="form-group">
					<label class="form-label">Voller Name</label>
					<input type="text" name="name" autocomplete="name" value={form?.data?.name ?? ''} required class="custom-input" />
				</div>

				<div class="form-group">
					<label class="form-label">E-Mail-Adresse</label>
					<input type="email" name="email" autocomplete="email" value={form?.data?.email ?? ''} required class="custom-input" />
				</div>

				<div class="form-group">
					<label class="form-label">Geburtsdatum</label>
					<input type="date" name="birthdate" value={form?.data?.birthdate ?? ''} required class="custom-input" />
				</div>

				<button type="submit" class="primary-btn" disabled={isSubmitting}>{isSubmitting ? 'Registriere...' : 'Konto erstellen'}</button>
			</form>
		{/if}

		<p style="text-align:center;margin-top:1rem;color:#64748b;">Schon ein Konto? <a href="/login" style="color:#2563eb;font-weight:600;">Login</a></p>
	</div>
</div>

<style>
	.page-wrapper { max-width: 500px; margin: 2rem auto; padding: 0 1rem; font-family: system-ui, sans-serif; color: #1e293b; }
	.header-section { text-align: center; margin-bottom: 2rem; }
	.header-section .h2 { font-size: 2rem; font-weight: 800; margin: 0 0 0.5rem 0; }
	.subtext { color: #64748b; margin: 0 0 0.5rem 0; }

	.main-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 2.5rem; }
	.form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
	.form-label { font-size: 0.85rem; font-weight: 700; color: #64748b; }
	.custom-input, .custom-select { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; font-size: 1rem; box-sizing: border-box; }
	.primary-btn { width: 100%; padding: 1rem; background: #3b82f6; color: white; border: none; border-radius: 10px; font-weight: bold; font-size: 1rem; cursor: pointer; transition: background 0.2s; }
	.primary-btn:disabled { background: #94a3b8; cursor: not-allowed; }
</style>
