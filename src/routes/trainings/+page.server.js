import { trainings } from '$lib/server/db.js';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ locals, cookies }) {
	const userId = locals.user?.id || cookies.get('session');
	if (!userId) {
		throw redirect(303, '/login');
	}

	return { userId };
}

export const actions = {
	create: async ({ request, locals, cookies }) => {
		const userId = locals.user?.id || cookies.get('session');
		if (!userId) {
			throw redirect(303, '/login');
		}

		// 1. FormData aus dem Request extrahieren
		const formData = await request.formData();

		const sport = formData.get('sport');
		const distance = formData.get('distance');
		const duration = formData.get('duration');
		const painLevel = formData.get('painLevel');
		const mentalScore = formData.get('mentalScore');

		// 2. Validierung mit detaillierten Fehlerprüfungen
		const errors = {};

		// Sportart validieren
		if (!sport || sport.trim() === '') {
			errors.sport = 'Sportart ist erforderlich';
		}

		// Distanz validieren
		const distanceNum = parseFloat(distance);
		if (isNaN(distanceNum) || distanceNum < 0) {
			errors.distance = 'Distanz muss eine positive Zahl sein';
		}

		// Dauer validieren
		const durationNum = parseInt(duration, 10);
		if (isNaN(durationNum) || durationNum < 1) {
			errors.duration = 'Dauer muss mindestens 1 Minute sein';
		}

		// Pain Level validieren (0-10)
		const painLevelNum = parseInt(painLevel, 10);
		if (isNaN(painLevelNum) || painLevelNum < 0 || painLevelNum > 10) {
			errors.painLevel = 'Pain Level muss zwischen 0 und 10 liegen';
		}

		// Mental Score validieren (1-5)
		const mentalScoreNum = parseInt(mentalScore, 10);
		if (isNaN(mentalScoreNum) || mentalScoreNum < 1 || mentalScoreNum > 5) {
			errors.mentalScore = 'Mental Score muss zwischen 1 und 5 liegen';
		}

		// Falls Fehler: Rückgabe mit fail()
		if (Object.keys(errors).length > 0) {
			return fail(400, {
				success: false,
				errors,
				data: { sport, distance, duration, painLevel, mentalScore }
			});
		}

		// 3. Trainingsdaten zusammenstellen
		const trainingRecord = {
			sport: sport.trim(),
			distance: distanceNum,
			duration: durationNum,
			painLevel: painLevelNum,
			mentalScore: mentalScoreNum,
			userId,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		try {
			// 4. In MongoDB speichern
			const result = await trainings.insertOne(trainingRecord);
			console.log('✓ Training erfolgreich gespeichert (ID:', result.insertedId, ')');

			// 5. Nach erfolgreichem Speichern zur Statistiken-Seite leiten
			throw redirect(303, '/statistiken');
		} catch (error) {
			// Redirect-Fehler durchreichen (ist gewünscht)
			if (error.status === 303) {
				throw error;
			}

			// Datenbankfehler behandeln
			console.error('Fehler beim Speichern des Trainings:', error);
			return fail(500, {
				success: false,
				errors: { database: 'Fehler beim Speichern der Trainingsdaten' },
				data: { sport, distance, duration, painLevel, mentalScore }
			});
		}
	}
};