import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { users } from '$lib/server/db.js';
import { ObjectId } from 'mongodb';

const publicRoutes = ['/login', '/register', '/verify']; // '/verify' muss öffentlich sein!

export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get('session');
    
    // 1. Session-Check: User aus DB laden, um 'isVerified' zu prüfen
    if (sessionId) {
        try {
            const user = await users.findOne({ _id: new ObjectId(sessionId) });
            if (user) {
                // Nur wenn verifiziert, setzen wir locals.user
                if (user.isVerified) {
                    event.locals.user = { id: user._id.toString(), username: user.username };
                } else {
                    // Falls nicht verifiziert, Session löschen
                    event.cookies.delete('session', { path: '/' });
                }
            }
        } catch (e) {
            // Falls ID ungültig, einfach weiter
        }
    }

    const pathname = event.url.pathname;
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // 2. Zugriffsschutz: Nur wenn KEIN verifizierter User da ist, wird man ausgesperrt
    if (!event.locals.user && !isPublicRoute && pathname !== '/') {
        throw redirect(303, '/login');
    }

    // 3. Komfort-Check: Wenn eingeloggt und auf /login, dann ab zum Dashboard
    if (event.locals.user && isPublicRoute) {
        throw redirect(303, '/dashboard');
    }

    return await resolve(event);
};