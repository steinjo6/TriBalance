// src/routes/statistiken/+page.server.js
import { trainings } from '$lib/server/db.js';

export async function load() {
	try {
		// Alle Trainings aus der Datenbank laden, sortiert nach Datum (neueste zuerst)
		const trainingsList = await trainings
			.find({})
			.sort({ createdAt: -1 })
			.toArray();

		console.log(`✓ ${trainingsList.length} Trainings geladen`);

		return {
			trainings: trainingsList,
			success: true
		};
	} catch (error) {
		console.error('Fehler beim Laden der Trainings:', error);
		return {
			trainings: [],
			success: false,
			error: 'Trainings konnten nicht geladen werden'
		};
	}
}
