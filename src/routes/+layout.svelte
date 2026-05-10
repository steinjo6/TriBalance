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
:global(body) { margin: 0; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
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
}

/* Main content shifts to the right to make room for the sidebar */
.main {
	flex: 1;
	min-height: 100vh;
	padding: 1.25rem;
	margin-left: 0; /* changed in media query */
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

/* Desktop responsive rules */
@media(min-width: 768px) {
	.main { margin-left: 280px; }
	/* Hide bottom drawer on desktop */
	.bottom-drawer { display: none; }
}

/* Mobile: hide the sidebar */
@media(max-width: 767px) {
	.sidebar { display: none; }
}

/* Simple utility */
.sidebar .logo { font-weight: 700; font-size: 1.25rem; margin-bottom: 1rem; }
.menu-item { padding: 0.5rem 0; color: rgba(255,255,255,0.9); }
</style>

<div class="layout-root">
	<!-- Left Sidebar (Desktop) -->
	<nav class="sidebar" aria-label="Hauptnavigation">
		<div class="logo">TriBalance</div>
		<div class="menu-item">Dashboard</div>
		<div class="menu-item">Trainings</div>
		<div class="menu-item">Statistiken</div>
		<hr />
		<!-- Quick action inside sidebar for desktop -->
		<button class="fab" on:click={openTracker} aria-label="Neues Training">
			+
		</button>
	</nav>

	<!-- Main content area where pages render -->
	<main class="main">
		<slot />
	</main>

	<!-- Floating Action Button for Mobile+Desktop (center-right) -->
	<a href="/trainings" class="fab" aria-label="Neues Training">
    +
</a>


</div>
