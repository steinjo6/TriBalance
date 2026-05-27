<script>
    let { data } = $props();
    import { enhance } from '$app/forms';

    let openOptionsId = $state(null);
    let editingId = $state(null);
    let editValues = $state({});

    function toggleOptions(id) {
        openOptionsId = openOptionsId === id ? null : id;
    }

    function startEdit(training) {
        editingId = training._id;
        editValues = {
            distance: training.distance,
            duration: training.duration,
            painLevel: training.painLevel,
            mentalScore: training.mentalScore
        };
        openOptionsId = null;
    }

    function cancelEdit() {
        editingId = null;
        editValues = {};
    }

    async function saveEdit(id) {
        const fd = new FormData();
        fd.append('id', id);
        fd.append('distance', String(editValues.distance));
        fd.append('duration', String(editValues.duration));
        fd.append('painLevel', String(editValues.painLevel));
        fd.append('mentalScore', String(editValues.mentalScore));

        const response = await fetch('?/updateTraining', { method: 'POST', body: fd });
        if (response.ok) {
            window.location.reload();
        } else {
            const error = await response.text();
            alert('Speichern fehlgeschlagen: ' + error);
        }
    }

    async function confirmDelete(id) {
        const confirmed = confirm('Möchtest du dieses Training wirklich unwiderruflich löschen?');
        if (!confirmed) return;
        const fd = new FormData();
        fd.append('id', id);
        const response = await fetch('?/deleteTraining', { method: 'POST', body: fd });
        if (response.ok) {
            window.location.reload();
        } else {
            const error = await response.text();
            alert('Löschen fehlgeschlagen: ' + error);
        }
    }
</script>

<div class="page-wrapper">
    <div class="header-section">
        <h1 class="h1">TriBalance Dashboard</h1>
        <p class="subtext">Übersicht deiner letzten Trainings</p>
    </div>

    <div class="main-card">
        <div class="training-list">
            {#each data.trainings as training}
                <div style="position: relative;">
                    
                    <div class="options-container">
                        <button type="button" class="options-btn" on:click|stopPropagation={() => toggleOptions(training._id)} aria-label="Optionen">⋮</button>
                        {#if openOptionsId === training._id}
                            <div class="options-dropdown" on:click|stopPropagation>
                                <button type="button" class="dropdown-item" on:click={() => startEdit(training)}>✍️ Bearbeiten</button>
                                <button type="button" class="dropdown-item danger" on:click={() => confirmDelete(training._id)}>🗑️ Löschen</button>
                            </div>
                        {/if}
                    </div>

                    {#if editingId === training._id}
                        <div class="training-card editing-card">
                            <h3 style="margin:0 0 0.25rem 0;font-weight:700">{training.sport} (Bearbeiten)</h3>
                            <div class="edit-grid">
                                <label class="edit-field">
                                    <span class="edit-label">Distanz (km)</span>
                                    <input type="number" min="0" step="0.01" bind:value={editValues.distance} class="custom-input" />
                                </label>
                                <label class="edit-field">
                                    <span class="edit-label">Dauer (min)</span>
                                    <input type="number" min="1" step="1" bind:value={editValues.duration} class="custom-input" />
                                </label>
                                <label class="edit-field">
                                    <span class="edit-label">Schmerzlevel (1-10)</span>
                                    <select bind:value={editValues.painLevel} class="custom-select">
                                        {#each Array.from({ length: 10 }, (_, i) => i + 1) as value}
                                            <option value={value}>{value} / 10</option>
                                        {/each}
                                    </select>
                                </label>
                                <label class="edit-field">
                                    <span class="edit-label">Mental Score (1-5)</span>
                                    <select bind:value={editValues.mentalScore} class="custom-select">
                                        {#each Array.from({ length: 5 }, (_, i) => i + 1) as value}
                                            <option value={value}>{value} / 5</option>
                                        {/each}
                                    </select>
                                </label>
                            </div>
                            <div class="edit-actions">
                                <button type="button" class="save-btn" on:click={() => saveEdit(training._id)}>💾 Speichern</button>
                                <button type="button" class="cancel-btn" on:click={cancelEdit}>❌ Abbrechen</button>
                            </div>
                        </div>
                    {:else}
                        <a href="/trainings/{training._id}" class="training-card link-card">
                            <div class="training-summary">
                                <h3 style="margin:0 0 0.25rem 0;font-weight:700;color:#0f172a;">{training.sport}</h3>
                                <p style="margin:0;color:#475569">{Number(training.distance || 0).toFixed(1)} km | {training.duration} min</p>
                                <p style="margin-top:0.25rem;color:#64748b;font-size:0.9rem">Kalorien: {training.calories} kcal</p>
                            </div>
                        </a>
                    {/if}

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
    .training-list { display: grid; gap: 1rem; }
    
    .training-card { background: #fff; border: 1px solid #e6eef8; border-radius: 12px; padding: 1rem; display: grid; gap: 1rem; transition: transform 0.15s ease, box-shadow 0.15s ease; }
    .link-card { text-decoration: none; color: inherit; display: block; }
    .link-card:hover { transform: translateY(-1px); box-shadow: 0 10px 20px rgba(15,23,42,0.08); background-color: #fafbfc; }
    .editing-card { cursor: default; border-color: #3b82f6; background-color: #ffffff; }
    
    .training-summary { min-width: 0; }
    .edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .edit-field { display: grid; gap: 0.35rem; }
    .edit-label { font-size: 0.82rem; color: #64748b; font-weight: 600; }
    
    .custom-input, .custom-select { width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-family: inherit; }
    
    .edit-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
    .save-btn, .cancel-btn { padding: 0.6rem 1rem; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; flex: 1; text-align: center; }
    .save-btn { background: #16a34a; color: white; }
    .save-btn:hover { background: #15803d; }
    .cancel-btn { background: #e2e8f0; color: #0f172a; }
    .cancel-btn:hover { background: #cbd5e1; }
    
    .options-container { position: absolute; top: 0.5rem; right: 0.5rem; z-index: 25; }
    .options-btn { width: 2rem; height: 2rem; padding: 0; border: none; background: transparent; color: #475569; font-size: 1.25rem; cursor: pointer; border-radius: 999px; transition: background 0.2s; display: flex; align-items: center; justify-content: center; }
    .options-btn:hover { background: rgba(15,23,42,0.06); }
    .options-dropdown { position: absolute; top: 2.2rem; right: 0; width: 10rem; background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 16px 35px rgba(15,23,42,0.14); display: grid; overflow: hidden; }
    .dropdown-item { width: 100%; text-align: left; padding: 0.6rem 1rem; border: none; background: transparent; font-size: 0.9rem; color: #0f172a; cursor: pointer; }
    .dropdown-item:hover { background: #f8fafc; }
    .dropdown-item.danger { color: #b91c1c; }
    .dropdown-item.danger:hover { background: #fef2f2; }
</style>