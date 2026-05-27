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
		// duration can be provided as minutes ('duration') or as exact seconds ('durationSeconds') for live-tracking
		const duration = formData.get('duration');
		const durationSeconds = formData.get('durationSeconds');
		const datetime = formData.get('datetime');
		const notes = formData.get('notes');
		const painLevel = formData.get('painLevel');
		const mentalScore = formData.get('mentalScore');

		// 2. Validierung mit detaillierten Fehlerprüfungen
		const errors = {};

		// Sportart validieren
		if (!sport || sport.trim() === '') {
			errors.sport = 'Sportart ist erforderlich';
		}

		// Distanz validieren
		const distanceNum = parseFloat(distance || '0');
		if (isNaN(distanceNum) || distanceNum < 0) {
			errors.distance = 'Distanz muss eine positive Zahl sein';
		}

		// Dauer validieren: entweder duration (Minuten) oder durationSeconds
		const durationMinutesNum = duration ? parseInt(duration, 10) : NaN;
		const durationSecondsNumRaw = durationSeconds ? parseInt(durationSeconds, 10) : NaN;
		let durationSecondsNum = null;
		let durationFinalMinutes = null;

		if (!isNaN(durationSecondsNumRaw)) {
			durationSecondsNum = durationSecondsNumRaw;
			durationFinalMinutes = Math.max(1, Math.ceil(durationSecondsNum / 60));
		} else if (!isNaN(durationMinutesNum)) {
			durationFinalMinutes = durationMinutesNum;
			durationSecondsNum = durationFinalMinutes * 60;
		} else {
			errors.duration = 'Dauer muss angegeben werden (Minuten oder exakte Sekunden)';
		}

		if (durationSecondsNum !== null && durationSecondsNum < 10) {
			errors.duration = 'Dauer muss mindestens 10 Sekunden betragen';
		}

		// Schmerzlevel validieren (1-10)
		const painLevelNum = parseInt(painLevel, 10);
		if (!painLevel || isNaN(painLevelNum) || painLevelNum < 1 || painLevelNum > 10) {
			errors.painLevel = 'Schmerzlevel muss zwischen 1 und 10 liegen';
		}

		// Mental Score validieren (1-5)
		const mentalScoreNum = parseInt(mentalScore, 10);
		if (!mentalScore || isNaN(mentalScoreNum) || mentalScoreNum < 1 || mentalScoreNum > 5) {
			errors.mentalScore = 'Mental Score muss zwischen 1 und 5 liegen';
		}

		// Datum validieren (wenn angegeben muss es in der Vergangenheit liegen)
		let createdAt = new Date();
		if (datetime) {
			const parsed = new Date(datetime);
			if (isNaN(parsed.getTime())) {
				errors.datetime = 'Ungültiges Datum';
			} else if (parsed.getTime() > Date.now()) {
				errors.datetime = 'Datum darf nicht in der Zukunft liegen';
			} else {
				createdAt = parsed;
			}
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
			// store both seconds (exact) and minutes (rounded/used elsewhere)
			durationSeconds: durationSecondsNum,
			duration: durationFinalMinutes,
			painLevel: painLevelNum,
			mentalScore: mentalScoreNum,
			notes: notes || '',
			userId,
			createdAt,
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