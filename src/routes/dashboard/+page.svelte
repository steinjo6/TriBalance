<script>
    let { data } = $props();
    import { enhance } from '$app/forms';

    import { onMount } from 'svelte';

    let openOptionsId = $state(null);
    let editingId = $state(null);
    let editValues = $state({});
    let showSearch = $state(false);
    let filterSport = $state('Laufen');
    let searchTerm = $state('');

    onMount(() => {
        const trainings = data.trainings || [];
        if (!trainings.some(t => String(t.sport || '').trim() === 'Laufen')) {
            const availableSport = ['Radfahren', 'Schwimmen', 'Laufen'].find(sport => trainings.some(t => String(t.sport || '').trim() === sport));
            if (availableSport) filterSport = availableSport;
        }
    });

    let filteredTrainings = $derived(
        (data.trainings || []).filter(training => {
            const term = String(searchTerm || '').trim().toLowerCase();
            const sport = String(filterSport || '').trim().toLowerCase();
            const trainingSport = String(training.sport || '').trim().toLowerCase();

            const matchesSport = sport === '' || trainingSport === sport;
            if (!matchesSport) return false;

            if (term === '') return true;

            const notes = String(training.notes || '').toLowerCase();
            const location = String(training.location || '').toLowerCase();
            return notes.includes(term) || location.includes(term);
        })
    );

    const formatDate = (value) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '--.--.----';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

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
        <h1 class="h1">Dashboard</h1>
        <p class="subtext">Übersicht deiner letzten Trainings</p>
    </div>

    <div class="main-card">
        <div class="best-section">
            <h2 class="section-title">🏆 Meine Bestzeiten</h2>
            <div class="bestzeiten-grid">
                {#each Object.entries(data.personalBests || {}) as [sport, bests]}
                    <div class="best-card">
                        <div class="best-card-header">{sport}</div>
                        <div class="best-records">
                            {#each bests as record}
                                <div class="best-record">
                                    <span class="best-record-label">{record.label}</span>
                                    {#if record.time === '--:--'}
                                        <span class="best-record-time placeholder">{record.time}</span>
                                    {:else}
                                        <span class="best-record-time">
                                            <span class="time-value">{record.time.split(' ')[0]}</span>
                                            <span class="time-unit">{record.time.split(' ')[1]}</span>
                                        </span>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <div class="section-header-row">
            <div>
                <h2 class="section-title">Letzte 3 Einheiten</h2>
                <p class="section-subtext">Neueste Trainings auf einen Blick</p>
            </div>
        </div>

        <div class="training-list">
            {#each data.trainings.slice(0, 3) as training}
                <div style="position: relative;">
                    <div class="options-container">
                        <button type="button" class="options-btn" onclick={(event) => { event.stopPropagation(); toggleOptions(training._id); }} aria-label="Optionen">⋮</button>
                        {#if openOptionsId === training._id}
                            <div class="options-dropdown">
                                <button type="button" class="dropdown-item" onclick={() => startEdit(training)}>✍️ Bearbeiten</button>
                                <button type="button" class="dropdown-item danger" onclick={() => confirmDelete(training._id)}>🗑️ Löschen</button>
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
                                <button type="button" class="save-btn" onclick={() => saveEdit(training._id)}>💾 Speichern</button>
                                <button type="button" class="cancel-btn" onclick={cancelEdit}>❌ Abbrechen</button>
                            </div>
                        </div>
                    {:else}
                        <a href={`/trainings/${training._id}`} class="training-card link-card">
                            <div class="training-summary">
                                <div class="training-date">{formatDate(training.createdAt)}</div>
                                <h3 style="margin:0 0 0.25rem 0;font-weight:700;color:#0f172a;">{training.sport}</h3>
                                <p style="margin:0;color:#475569">{Number(training.distance || 0).toFixed(1)} km | {training.duration} min</p>
                                <p style="margin-top:0.25rem;color:#64748b;font-size:0.9rem">Kalorien: {training.calories} kcal</p>
                            </div>
                        </a>
                    {/if}
                </div>
            {/each}
        </div>

        <button type="button" class="search-toggle-btn" onclick={() => showSearch = !showSearch}>
            🔍 In allen Trainings suchen
        </button>

        {#if showSearch}
            <div class="search-panel">
                <div class="filter-tabs">
                    {#each ['Laufen', 'Schwimmen', 'Radfahren'] as sport}
                        <button type="button" class="filter-tab {filterSport === sport ? 'active' : ''}" onclick={() => filterSport = sport}>{sport}</button>
                    {/each}
                </div>
                <label class="search-input-label">
                    <span>Suche nach Notizen oder Orten</span>
                    <input type="search" bind:value={searchTerm} placeholder="z. B. Berlin, Intervall, Wettkampf" class="custom-input" />
                </label>

                {#if filteredTrainings.length === 0}
                    <p class="empty-state">Keine Einheiten gefunden.</p>
                {:else}
                    <div class="training-list">
                        {#each filteredTrainings as training}
                            <div style="position: relative;">
                                <div class="options-container">
                                    <button type="button" class="options-btn" onclick={(event) => { event.stopPropagation(); toggleOptions(training._id); }} aria-label="Optionen">⋮</button>
                                    {#if openOptionsId === training._id}
                                        <div class="options-dropdown">
                                            <button type="button" class="dropdown-item" onclick={() => startEdit(training)}>✍️ Bearbeiten</button>
                                            <button type="button" class="dropdown-item danger" onclick={() => confirmDelete(training._id)}>🗑️ Löschen</button>
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
                                            <button type="button" class="save-btn" onclick={() => saveEdit(training._id)}>💾 Speichern</button>
                                            <button type="button" class="cancel-btn" onclick={cancelEdit}>❌ Abbrechen</button>
                                        </div>
                                    </div>
                                {:else}
                                    <a href={`/trainings/${training._id}`} class="training-card link-card">
                                        <div class="training-summary">
                                            <div class="training-date">{formatDate(training.createdAt)}</div>
                                            <h3 style="margin:0 0 0.25rem 0;font-weight:700;color:#0f172a;">{training.sport}</h3>
                                            <p style="margin:0;color:#475569">{Number(training.distance || 0).toFixed(1)} km | {training.duration} min</p>
                                            <p style="margin-top:0.25rem;color:#64748b;font-size:0.9rem">Kalorien: {training.calories} kcal</p>
                                        </div>
                                    </a>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    .page-wrapper { max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem; font-family: system-ui, sans-serif; color: #1e293b; }
    .header-section { text-align: center; margin-bottom: 2rem; }
    .header-section .h1 { font-size: 2rem; font-weight: 800; margin: 0 0 0.5rem 0; }
    .subtext { color: #64748b; margin: 0 0 0.5rem 0; }
    .main-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 2.5rem; width: 100%; box-sizing: border-box; }
    .best-section { margin-bottom: 2.5rem; }
    .bestzeiten-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        width: 100%;
        box-sizing: border-box;
    }
    .best-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; box-shadow: 0 12px 30px rgba(15,23,42,0.06); }
    .best-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; box-shadow: 0 12px 30px rgba(15,23,42,0.06); }
    .best-card-header { font-weight: 800; font-size: 1.1rem; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem; }
    .best-records { display: grid; gap: 0.75rem; }
    .best-record { display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 0.75rem; flex-wrap: wrap; }
    .best-record-label { background: #e2e8f0; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; color: #475569; min-width: 0; white-space: normal; word-break: break-word; }
    .best-record-time { display: inline-flex; align-items: baseline; gap: 0.25rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 600; color: #0f172a; white-space: nowrap; }
    .time-value { font-size: 1rem; }
    .time-unit { color: #64748b; font-size: 0.9rem; font-weight: 400; }
    .placeholder { color: #94a3b8; font-weight: 500; }

    @media (max-width: 900px) {
        .bestzeiten-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 640px) {
        .bestzeiten-grid { grid-template-columns: 1fr; }
    }
    .section-header-row { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1rem; }
    .section-title { font-size: 1.25rem; font-weight: 700; margin: 0; }
    .search-toggle-btn { width: 100%; margin-top: 1.5rem; padding: 1rem; border: none; border-radius: 12px; background: #e2e8f0; color: #0f172a; font-weight: 700; cursor: pointer; transition: background 0.2s; }
    .search-toggle-btn:hover { background: #cbd5e1; }
    .search-panel { margin-top: 1.5rem; display: grid; gap: 1rem; }
    .filter-tabs { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .filter-tab { flex: 1; min-width: 0; padding: 0.75rem 1rem; border: 1px solid #cbd5e1; border-radius: 999px; background: #f8fafc; color: #475569; cursor: pointer; transition: all 0.2s; }
    .filter-tab.active { background: #3b82f6; color: white; border-color: transparent; }
    .search-input-label { display: grid; gap: 0.5rem; }
    .search-input-label span { color: #475569; font-size: 0.9rem; }
    .training-date { color: #64748b; font-size: 0.85rem; margin-bottom: 0.5rem; }
    .empty-state { color: #64748b; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; }
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