import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

// Diese Routen dürfen NIEMALS blockiert werden, sonst stürzt das Login-Formular ab
const publicRoutes = ['/login', '/register'];

export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get('session');
    const pathname = event.url.pathname;

    if (sessionId) {
        event.locals.user = { id: sessionId };
    }

    // Prüfen, ob es sich um eine statische Datei oder interne SvelteKit-Assets handelt
    const isAsset = pathname.startsWith('/_app') || pathname.startsWith('/favicon.svg');
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // WICHTIGER FIX: Wenn keine Session da ist und wir NICHT auf einer öffentlichen Seite oder einem Asset sind
    if (!sessionId && !isPublicRoute && !isAsset && pathname !== '/') {
        throw redirect(303, '/login');
    }

    // Zusatz-Komfort: Wenn man eingeloggt ist, macht es keinen Sinn, das Login-Formular zu sehen
    if (sessionId && isPublicRoute) {
        throw redirect(303, '/dashboard');
    }

    return await resolve(event);
};