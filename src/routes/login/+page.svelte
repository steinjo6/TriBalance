<script>
    import { enhance } from '$app/forms';
    import { goto, invalidateAll } from '$app/navigation';

    // Svelte 5 Runes: Reaktiver Zustand
    let isSubmitting = $state(false);
    let form = $state(null);
</script>

<div class="page-wrapper">
    <div class="header-section">
        <h1 class="h1">Login</h1>
        <p class="subtext">Melde dich an, um auf deine TriBalance-Daten zuzugreifen.</p>
    </div>

    <div class="main-card">
        {#if form?.errors}
            <div class="alert variant-filled-error mb-4">
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
                return async ({ result, update }) => {
                    isSubmitting = false;
                    if (result.type === 'redirect') {
                        await invalidateAll();
                        await goto(result.location, { invalidateAll: true });
                    } else if (result.type === 'failure' || result.type === 'error') {
                        form = result.data;
                        await update();
                    } else {
                        await update();
                    }
                };
            }}
            class="space-y-4"
        >
            <div class="form-group">
                <label class="form-label">Benutzername</label>
                <input type="text" name="username" autocomplete="username" required class="custom-input" oninput={() => { form = null; }} />
            </div>

            <div class="form-group">
                <label class="form-label">Passwort</label>
                <input type="password" name="password" autocomplete="current-password" required class="custom-input" oninput={() => { form = null; }} />
            </div>

            <button type="submit" class="primary-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Anmeldung...' : 'Login'}
            </button>
        </form>

        <p style="text-align:center;margin-top:1rem;color:#64748b;">Noch kein Konto? <a href="/register" style="color:#2563eb;font-weight:600;">Registrieren</a></p>
    </div>
</div>

<style>
    .page-wrapper { max-width: 500px; margin: 2rem auto; padding: 0 1rem; font-family: system-ui, sans-serif; color: #1e293b; }
    .header-section { text-align: center; margin-bottom: 2rem; }
    .header-section .h1 { font-size: 2rem; font-weight: 800; margin: 0 0 0.5rem 0; }
    .subtext { color: #64748b; margin: 0 0 0.5rem 0; }

    .main-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 2.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
    .form-label { font-size: 0.85rem; font-weight: 700; color: #64748b; }
    .custom-input, .custom-select { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; font-size: 1rem; box-sizing: border-box; }
    .primary-btn { width: 100%; padding: 1rem; background: #3b82f6; color: white; border: none; border-radius: 10px; font-weight: bold; font-size: 1rem; cursor: pointer; transition: background 0.2s; }
    .primary-btn:disabled { background: #94a3b8; cursor: not-allowed; }
</style>