<script lang="ts">
// +layout.svelte
// Dieses Layout implementiert eine linke Sidebar (Desktop) und einen Bottom-Drawer (Mobile).
// Enthält einen Sticky Floating Action Button (+) für schnellen Zugriff auf Neues Training.
// Die Datei wurde mit KI-Unterstützung erstellt — Kommentare dokumentieren die Änderungen.

import { onMount } from 'svelte';
import Tracker from '$lib/components/Tracker.svelte';
import { writable } from 'svelte/store';
import favicon from '$lib/assets/favicon.svg';

// Drawer/FAB state
const showBottomDrawer = writable(false);
let showTracker = false; // inline state for tracker drawer

function toggleDrawer() {
    showBottomDrawer.update(v => !v);
}

function openTracker() {
    showTracker = true;
    showBottomDrawer.set(true);
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
    background-color: #f8fafc; /* Angenehmer, heller Hintergrund für den Content */
}
.layout-root { min-height: 100vh; display: flex; }

/* Sidebar on desktop */
.sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    background: var(--surface, #0f172a);
    color: white;
    padding: 1rem;
    box-shadow: 2px 0 6px rgba(0,0,0,0.12);
    transform: translateZ(0);
    z-index: 40;
}

/* Main content area */
.main {
    flex: 1;
    min-height: 100vh;
    padding: 1.25rem;
    box-sizing: border-box;
}

/* Floating Action Button */
.fab {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 64px;
    height: 64px;
    border-radius: 999px;
    background: linear-gradient(135deg,#06b6d4,#7c3aed);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    box-shadow: 0 6px 20px rgba(2,6,23,0.4);
    cursor: pointer;
    z-index: 50;
    text-decoration: none;
}

/* Bottom drawer for mobile */
.bottom-drawer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    max-height: 70vh;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    box-shadow: 0 -8px 24px rgba(2,6,23,0.12);
    padding: 1rem;
    transform: translateY(100%);
    transition: transform 240ms ease;
    z-index: 60;
}
.bottom-drawer.open { transform: translateY(0%); }

/* Desktop responsive rules (Abgesichert für Windows-Skalierung) */
@media(min-width: 640px) {
    .main { 
        margin-left: 280px !important; 
        padding: 2rem;
    }
    /* Hide bottom drawer on desktop */
    .bottom-drawer { display: none; }
}

/* Mobile: hide the sidebar */
@media(max-width: 639px) {
    .sidebar { display: none; }
    .main { margin-left: 0 !important; }
}

/* Sidebar Navigation Styling */
.sidebar .logo { 
    font-weight: 700; 
    font-size: 1.25rem; 
    margin-bottom: 1.5rem; 
    padding: 0.5rem;
}

.menu-item-link {
    text-decoration: none;
    color: white;
    display: block;
    margin-bottom: 0.25rem;
}

.menu-item { 
    padding: 0.75rem 0.5rem; 
    color: rgba(255,255,255,0.9); 
    border-radius: 6px;
    transition: all 0.2s ease;
}

.menu-item-link:hover .menu-item {
    background: rgba(255, 255, 255, 0.1);
    padding-left: 12px; /* Schicker Slide-Effekt beim Hovern */
    color: #06b6d4;
}
</style>

<div class="layout-root">
    <nav class="sidebar" aria-label="Hauptnavigation">
        <div class="logo">TriBalance</div>
        
        <a href="/dashboard" class="menu-item-link">
            <div class="menu-item">Dashboard</div>
        </a>
        <a href="/trainings" class="menu-item-link">
            <div class="menu-item">Trainings</div>
        </a>
        <a href="/statistiken" class="menu-item-link">
            <div class="menu-item">Statistiken</div>
        </a>
        
        <hr style="border-color: rgba(255,255,255,0.1); margin: 1.5rem 0;" />
    </nav>

    <main class="main">
        <slot />
    </main>

    <a href="/trainings" class="fab" aria-label="Neues Training">
        +
    </a>
</div>