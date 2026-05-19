import { fail, redirect } from '@sveltejs/kit';
import { users } from '$lib/server/db.js';
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
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = String(formData.get('username') ?? '').trim();
		const password = String(formData.get('password') ?? '');
		const errors = {};

		if (!username) {
			errors.username = 'Benutzername ist erforderlich';
		}
		if (!password) {
			errors.password = 'Passwort ist erforderlich';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { success: false, errors, data: { username } });
		}

		const user = await users.findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
		if (!user || user.passwordHash !== hashPassword(password)) {
			return fail(400, {
				success: false,
				errors: { general: 'Ungültiger Benutzername oder Passwort' },
				data: { username }
			});
		}

		cookies.set('session', user._id.toString(), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production'
		});

		throw redirect(303, '/dashboard');
	}
};
