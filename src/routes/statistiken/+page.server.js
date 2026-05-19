// src/routes/statistiken/+page.server.js
import { trainings } from '$lib/server/db.js';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const userId = locals.user?.id;
	if (!userId) {
		throw redirect(303, '/login');
	}

	const filter = { userId };

	try {
		const trainingsList = await trainings
			.find(filter)
			.sort({ createdAt: -1 })
			.toArray();

		const serializableTrainings = trainingsList.map((item) => ({
			...item,
			_id: item._id.toString(),
			createdAt: item.createdAt?.toISOString?.() ?? new Date(item.createdAt).toISOString(),
			userId: item.userId?.toString?.() ?? item.userId
		}));

		console.log(`✓ ${serializableTrainings.length} Trainings geladen`);

		return {
			trainings: serializableTrainings,
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
