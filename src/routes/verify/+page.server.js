import { redirect } from '@sveltejs/kit';
import { users } from '$lib/server/db.js';

export async function load({ url }) {
    const token = String(url.searchParams.get('token') ?? '').trim();

    // 1. Grundprüfung: Existiert überhaupt ein Token?
    if (!token) {
        throw redirect(303, '/register?error=missing_token');
    }

    // 2. Datenbank-Suche
    const user = await users.findOne({ verificationToken: token });

    // 3. Wenn User nicht gefunden: Token ist abgelaufen oder ungültig
    if (!user) {
        throw redirect(303, '/register?error=invalid_token');
    }

    // 4. Update: Verifiziert setzen und Token entfernen
    await users.updateOne(
        { _id: user._id },
        {
            $set: { isVerified: true },
            $unset: { verificationToken: "" }
        }
    );

    // 5. Erfolg: Weiterleitung zum Login
    throw redirect(303, '/login?verified=1');
}