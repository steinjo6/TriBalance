<div class="page-wrapper">
    <div class="header-section">
        <h1 class="h1">Willkommen bei TriBalance</h1>
        <p class="subtext">
            Tracke deine Leistung und behalte deine mentale Verfassung im Blick.
        </p>
    </div>

    <div class="main-card text-center">
        <div style="display:flex;justify-content:center;gap:1rem;">
            <a
                href="/dashboard"
                class="primary-btn"
                style="background:#e2e8f0;color:#0f172a;">Zum Dashboard</a
            >
            <a href="/trainings" class="primary-btn">Training starten</a>
        </div>
    </div>
</div>

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
        margin-bottom: 2rem;
    }
    .header-section .h1 {
        font-size: 2rem;
        font-weight: 800;
        margin: 0 0 0.5rem 0;
    }
    .subtext {
        color: #64748b;
        margin: 0 0 0.5rem 0;
    }

    .main-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        margin-bottom: 2.5rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
    }
    .custom-input,
    .custom-select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        background: #f8fafc;
        font-size: 1rem;
        box-sizing: border-box;
    }
    .primary-btn {
        display: inline-block;
        padding: 0.9rem 1rem;
        background: #3b82f6;
        color: #fff;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 700;
    }
    .primary-btn[style] {
        padding: 0.75rem 1rem;
    }
</style>
