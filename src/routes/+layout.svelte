<script lang="ts">
    // +layout.svelte - Final bereinigte Svelte 5 Version
    import favicon from '$lib/assets/favicon.svg';
    
    // Props in Svelte 5
    let { data, children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<style>
    :global(body) { margin: 0; font-family: system-ui; background-color: #f8fafc; }
    .layout-root { min-height: 100vh; display: flex; }
    
    .sidebar {
        position: fixed; top: 0; left: 0; width: 280px; height: 100vh;
        background: #0f172a; color: white; padding: 1rem;
        z-index: 40;
    }

    .main { flex: 1; padding: 2rem; }
    @media(min-width: 640px) { .main { margin-left: 280px; } }

    .menu-item { 
        padding: 0.75rem 0.5rem; color: rgba(255,255,255,0.9); 
        text-decoration: none; display: block; border-radius: 6px; 
    }
    .menu-item:hover { background: rgba(255, 255, 255, 0.1); color: #06b6d4; }
    
    /* Mobile Nav Styles */
    .mobile-nav { display: none; } /* Standardmäßig auf Desktop aus */

    @media(max-width: 639px) {
        .sidebar { display: none; }
        .main { padding: 1rem; padding-bottom: 5rem; } /* Mehr Abstand unten, damit Inhalt nicht verdeckt wird */
        
        .mobile-nav { 
            display: flex; position: fixed; left: 0; right: 0; bottom: 0; 
            background: #0f172a; z-index: 45; padding: 0.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            justify-content: space-around;
        }
        .mobile-nav-link { 
            flex: 1; color: white; text-align: center; text-decoration: none; 
            padding: 0.75rem 0.5rem; font-size: 0.9rem; border-radius: 6px;
        }
        .mobile-nav-link:hover { color: #06b6d4; background: rgba(255, 255, 255, 0.05); }
    }
</style>

<div class="layout-root">
    <nav class="sidebar">
        <div style="font-weight:700; font-size:1.25rem; margin-bottom:1.5rem; padding:0.5rem;">TriBalance</div>
        
        <a href="/dashboard" class="menu-item">Dashboard</a>
        <a href="/trainings" class="menu-item">Training</a>
        <a href="/statistiken" class="menu-item">Statistiken</a>
        
        <hr style="border-color: rgba(255,255,255,0.1); margin: 1.5rem 0;" />
        
        {#if data?.user}
            <a href="/logout" class="menu-item" style="color:#f87171;">Ausloggen</a>
        {:else}
            <a href="/login" class="menu-item">Login</a>
        {/if}
    </nav>

    <main class="main">
        {@render children()}
    </main>

    {#if data?.user}
        <nav class="mobile-nav">
            <a href="/dashboard" class="mobile-nav-link">Dashboard</a>
            <a href="/trainings" class="mobile-nav-link">Training</a>
            <a href="/statistiken" class="mobile-nav-link">Statistiken</a>
            <a href="/logout" class="mobile-nav-link" style="color:#f87171;">Ausloggen</a>
        </nav>
    {/if}
</div>