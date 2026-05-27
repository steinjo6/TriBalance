<script lang="ts">
    // Svelte 5 nimmt die Serverdaten über das $props-Rune entgegen
    let { data } = $props();
    let training = $derived(data.training);
</script>

<svelte:head>
    <title>Details: {training?.sport || 'Training'}</title>
</svelte:head>

<style>
    .page-wrapper {
        max-width: 500px;
        margin: 2rem auto;
        padding: 0 1rem;
        font-family: system-ui, sans-serif;
        color: #1e293b;
    }
    .header-section {
        text-align: center;
        margin-bottom: 1.5rem;
    }
    .header-section h1 {
        font-size: 2rem;
        font-weight: 800;
        margin: 0 0 0.5rem 0;
    }
    .main-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        margin-bottom: 1.5rem;
    }
    .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid #f1f5f9;
    }
    .detail-row:last-of-type {
        border-bottom: none;
    }
    .detail-label {
        font-weight: 600;
        color: #64748b;
        font-size: 0.95rem;
    }
    .detail-value {
        font-weight: 700;
        color: #0f172a;
    }
    .badge {
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        font-size: 0.9rem;
    }
    .notes-box {
        margin-top: 1.5rem;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1rem;
    }
    .notes-title {
        font-weight: 700;
        font-size: 0.9rem;
        color: #475569;
        margin-bottom: 0.5rem;
    }
    .btn-back {
        display: inline-block;
        color: #2563eb;
        text-decoration: none;
        font-weight: 600;
        margin-top: 1rem;
    }
</style>

<div class="page-wrapper">
    {#if training}
        <div class="header-section">
            <h1>{training.sport} Details</h1>
            <p style="color: #64748b; margin: 0;">
                {new Date(training.date || training.createdAt).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        </div>

        <div class="main-card">
            <div class="detail-row">
                <span class="detail-label">⏱️ Dauer</span>
                <span class="detail-value">{training.duration} Minuten</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">📏 Distanz</span>
                <span class="detail-value">{Number(training.distance || 0).toFixed(1)} km</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">🔥 Kalorienverbrauch</span>
                <span class="detail-value" style="color: #16a34a;">{training.calories || '630'} kcal</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">⚡ Schmerzlevel</span>
                <span class="badge" style="background: #fee2e2; color: #991b1b;">{training.painLevel || '1'} / 10</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">🧠 Mental Score</span>
                <span class="badge" style="background: #ecfccb; color: #365314;">{training.mentalScore || '1'} / 5</span>
            </div>

            <div class="notes-box">
                <div class="notes-title">📝 Erfasste Notizen</div>
                <p style="margin: 0; color: #334155; line-height: 1.5; font-style: {training.notes ? 'normal' : 'italic'};">
                    {training.notes || 'Keine Notizen zu dieser Einheit erfasst.'}
                </p>
            </div>
        </div>

        <a href="/dashboard" class="btn-back">← Zurück zum Dashboard</a>
    {:else}
        <div class="main-card" style="text-align: center; color: #64748b;">
            Daten werden geladen...
        </div>
    {/if}
</div>