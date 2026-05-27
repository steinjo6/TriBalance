import { error, redirect } from '@sveltejs/kit';
import { trainings } from '$lib/server/db.js'; // Exakt wie in deiner Statistiken-Datei!
import { ObjectId } from 'mongodb';

export async function load({ params, locals }) {
    // Sicherheits-Check: Falls der User nicht eingeloggt ist (analog zu deinem Setup)
    const userId = locals.user?.id;
    if (!userId) {
        throw redirect(303, '/login');
    }

    try {
        const trainingId = params.id;
        
        // Holt genau das eine Dokument anhand der ID aus deiner Collection
        const item = await trainings.findOne({
            _id: new ObjectId(trainingId)
        });

        if (!item) {
            throw error(404, 'Training nicht gefunden');
        }

        // Serialisierung für Svelte 5 (damit MongoDB-IDs als Strings übergeben werden)
        const serializableTraining = {
            ...item,
            _id: item._id.toString(),
            userId: item.userId?.toString() ?? item.userId
        };

        return {
            training: serializableTraining,
            success: true
        };
    } catch (err) {
        console.error(err);
        throw error(500, 'Fehler beim Laden der Trainingsdetails');
    }
}