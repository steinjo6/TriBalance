<script lang="ts">
    // +layout.svelte
    // Korrigierte Version für Svelte 5 (Runes-Modus)
    
    import { onMount } from 'svelte';
    import Tracker from '$lib/components/Tracker.svelte';
    import { writable } from 'svelte/store';
    import favicon from '$lib/assets/favicon.svg';

    // Svelte 5: Props über $props() entgegennehmen
    let { data, children } = $props();

    // Drawer/FAB state
    const showBottomDrawer = writable(false);
    let showTracker = false; 

    function toggleDrawer() {
        showBottomDrawer.update(v => !v);
    }
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<style>
    /* Layout basics */
    :global(body) { 
        margin: 0; 
        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; 
        background-color: #f8fafc;
    }
    .layout-root { min-height: 100vh; display: flex; }

    /* Sidebar */
    .sidebar {
        position: fixed; top: 0; left: 0; width: 280px; height: 100vh;
        background: #0f172a; color: white; padding: 1rem;
        box-shadow: 2px 0 6px rgba(0,0,0,0.12); z-index: 40;
    }

    .main { flex: 1; min-height: 100vh; padding: 1.25rem; }

    /* Fab & Mobile */
    .fab {
        position: fixed; bottom: 24px; right: 24px; width: 64px; height: 64px;
        border-radius: 999px; background: linear-gradient(135deg,#06b6d4,#7c3aed);
        color: white; display: flex; align-items: center; justify-content: center;
        font-size: 32px; box-shadow: 0 6px 20px rgba(2,6,23,0.4); cursor: pointer; z-index: 50; text-decoration: none;
    }

    @media(min-width: 640px) { .main { margin-left: 280px !important; padding: 2rem; } }

    @media(max-width: 639px) {
        .sidebar { display: none; }
        .main { margin-left: 0 !important; padding-bottom: 5.5rem; }
        .mobile-nav { 
            display: flex; position: fixed; left: 0; right: 0; bottom: 0; 
            align-items: center; justify-content: space-between; gap: 0.25rem; 
            padding: 0.5rem 0.75rem; background: #0f172a; 
            box-shadow: 0 -6px 20px rgba(0,0,0,0.18); z-index: 45; 
        }
        .mobile-nav-link { 
            flex: 1; min-height: 48px; border-radius: 999px; 
            background: rgba(255,255,255,0.08); color: white; text-decoration: none; 
            display: inline-flex; align-items: center; justify-content: center; 
            font-size: 0.9rem; font-weight: 600; 
        }
    }

    .menu-item-link { text-decoration: none; color: white; display: block; margin-bottom: 0.25rem; }
    .menu-item { padding: 0.75rem 0.5rem; color: rgba(255,255,255,0.9); border-radius: 6px; transition: all 0.2s ease; }
    .menu-item-link:hover .menu-item { background: rgba(255, 255, 255, 0.1); padding-left: 12px; color: #06b6d4; }
    .logo { font-weight: 700; font-size: 1.25rem; margin-bottom: 1.5rem; padding: 0.5rem; }
</style>

<div class="layout-root">
    <nav class="sidebar" aria-label="Hauptnavigation">
        <div class="logo">TriBalance</div>
        
        <a href="/dashboard" class="menu-item-link"><div class="menu-item">Dashboard</div></a>
        <a href="/trainings" class="menu-item-link"><div class="menu-item">Trainings</div></a>
        <a href="/statistiken" class="menu-item-link"><div class="menu-item">Statistiken</div></a>
        
        <hr style="border-color: rgba(255,255,255,0.1); margin: 1.5rem 0;" />
        
        {#if data?.user}
            <a href="/logout" class="menu-item-link"><div class="menu-item">Ausloggen</div></a>
        {:else}
            <a href="/login" class="menu-item-link"><div class="menu-item">Login</div></a>
        {/if}
    </nav>

    <main class="main">
        {@render children()}
    </main>

    <a href="/trainings" class="fab" aria-label="Neues Training">+</a>

    <nav class="mobile-nav" aria-label="Mobilnavigation">
        <a href="/dashboard" class="mobile-nav-link">Dashboard</a>
        <a href="/trainings" class="mobile-nav-link">Trainings</a>
        <a href="/statistiken" class="mobile-nav-link">Statistiken</a>
        {#if data?.user}
            <a href="/logout" class="mobile-nav-link">Ausloggen</a>
        {:else}
            <a href="/login" class="mobile-nav-link">Login</a>
        {/if}
    </nav>
</div>