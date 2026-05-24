import { users } from '$lib/server/db.js';
import { fail, redirect } from '@sveltejs/kit';
import { createHash, randomBytes } from 'crypto';

function hashPassword(password) {
    return createHash('sha256').update(password).digest('hex');
}

export const actions = {
    register: async ({ request, url }) => {
        const formData = await request.formData();
        const username = String(formData.get('username') ?? '').trim();
        const password = String(formData.get('password') ?? '');
        const name = String(formData.get('name') ?? '').trim();
        const email = String(formData.get('email') ?? '').trim();
        const birthdate = String(formData.get('birthdate') ?? '').trim();
        const errors = {};

        // Validierung
        if (!username || username.length < 3) errors.username = 'Benutzername muss mindestens 3 Zeichen haben';
        if (!password || password.length < 6) errors.password = 'Passwort muss mindestens 6 Zeichen haben';
        if (!name) errors.name = 'Voller Name ist erforderlich';
        if (!email || !email.includes('@')) errors.email = 'Gültige E-Mail-Adresse ist erforderlich';
        if (!birthdate) errors.birthdate = 'Geburtsdatum ist erforderlich';

        if (Object.keys(errors).length > 0) {
            return fail(400, { success: false, errors, data: { username, name, email, birthdate } });
        }

        const existing = await users.findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
        if (existing) {
            return fail(400, { success: false, errors: { username: 'Benutzername existiert bereits' }, data: { username, name, email, birthdate } });
        }

        // Token generieren
        const verificationToken = randomBytes(32).toString('hex');
        const verificationLink = `${url.origin}/verify?token=${verificationToken}`;
        console.log(`>>> E-Mail-Verifikations-Link: ${verificationLink}`);

        await users.insertOne({
            username,
            passwordHash: hashPassword(password),
            name,
            email,
            birthdate,
            isVerified: false, // Standardisiert auf isVerified
            verificationToken,
            createdAt: new Date()
        });

        return { success: true, verificationSent: true };
    }
};