import { users } from '$lib/server/db.js';
import { fail, redirect } from '@sveltejs/kit';
import { createHash } from 'crypto';

function hashPassword(password) {
	return createHash('sha256').update(password).digest('hex');
}

export async function load({ cookies }) {
	if (cookies.get('session')) {
		throw redirect(303, '/trainings');
	}
}

export const actions = {
	register: async ({ request }) => {
		const formData = await request.formData();
		const username = String(formData.get('username') ?? '').trim();
		const password = String(formData.get('password') ?? '');
		const name = String(formData.get('name') ?? '').trim();
		const birthdate = String(formData.get('birthdate') ?? '').trim();
		const errors = {};

		if (!username) {
			errors.username = 'Benutzername ist erforderlich';
		} else if (username.length < 3) {
			errors.username = 'Benutzername muss mindestens 3 Zeichen haben';
		}

		if (!password) {
			errors.password = 'Passwort ist erforderlich';
		} else if (password.length < 6) {
			errors.password = 'Passwort muss mindestens 6 Zeichen haben';
		}

		if (!name) {
			errors.name = 'Voller Name ist erforderlich';
		}

		if (!birthdate) {
			errors.birthdate = 'Geburtsdatum ist erforderlich';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				success: false,
				errors,
				data: { username, name, birthdate }
			});
		}

		const existing = await users.findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
		if (existing) {
			return fail(400, {
				success: false,
				errors: { username: 'Benutzername existiert bereits' },
				data: { username, name, birthdate }
			});
		}

		await users.insertOne({
			username,
			passwordHash: hashPassword(password),
			name,
			birthdate,
			verified: false,
			createdAt: new Date()
		});

		return {
			success: true,
			requireVerification: true,
			mockCode: '1234',
			data: { username, name, birthdate }
		};
	},
	confirm: async ({ request }) => {
		const formData = await request.formData();
		const username = String(formData.get('username') ?? '').trim();
		const confirmationCode = String(formData.get('confirmationCode') ?? '').trim();
		const errors = {};

		if (confirmationCode !== '1234') {
			errors.confirmationCode = 'Falscher Bestätigungs-Code. Bitte 1234 eingeben.';
		}

		if (!username) {
			errors.general = 'Benutzername fehlt. Bitte erneut versuchen.';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				success: false,
				errors,
				requireVerification: true,
				data: { username }
			});
		}

		const existing = await users.findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
		if (!existing) {
			return fail(400, {
				success: false,
				errors: { general: 'Kein ausstehender Benutzer zum Bestätigen gefunden.' },
				requireVerification: true,
				data: { username, password, name, birthdate }
			});
		}

		if (existing.verified) {
			return fail(400, {
				success: false,
				errors: { general: 'Benutzerkonto wurde bereits freigeschaltet.' },
				requireVerification: true
			});
		}

		await users.updateOne(
			{ _id: existing._id },
			{ $set: { verified: true, verifiedAt: new Date() } }
		);

		throw redirect(303, '/login');
	}
};
