import { fail, redirect } from '@sveltejs/kit';
import { users } from '$lib/server/db.js';
import { createHash } from 'crypto';

function hashPassword(password) {
    return createHash('sha256').update(password).digest('hex');
}

export const actions = {
    login: async ({ request, cookies }) => {
        const formData = await request.formData();
        const username = String(formData.get('username') ?? '').trim();
        const password = String(formData.get('password') ?? '');
        const errors = {};

        if (!username) errors.username = 'Benutzername erforderlich';
        if (!password) errors.password = 'Passwort erforderlich';
        if (Object.keys(errors).length > 0) return fail(400, { errors, data: { username } });

        const user = await users.findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
        if (!user || user.passwordHash !== hashPassword(password)) {
            return fail(400, { errors: { general: 'Ungültige Anmeldedaten' }, data: { username } });
        }

        if (!user.isVerified) {
            return fail(400, { errors: { general: 'Bitte verifiziere zuerst deine E-Mail.' }, data: { username } });
        }

        // Cookie-Konfiguration mit fixer 30-Tage-Lebensdauer
        cookies.set('session', user._id.toString(), {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 Tage in Sekunden (Garantiert stabiles Tracking!)
            httpOnly: true,            // Schützt vor bösartigem JavaScript-Zugriff (XSS)
            sameSite: 'lax',           // Schutz vor CSRF-Angriffen bei normaler Navigation
            secure: process.env.NODE_ENV === 'production'
        });

        throw redirect(303, '/dashboard');
    }
};