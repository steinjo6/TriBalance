import { trainings } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
    create: async ({ request }) => {
        const data = await request.formData();
        
        const newTraining = {
            sport: data.get('sport'),
            distance: parseFloat(data.get('distance') || '0'),
            duration: parseInt(data.get('duration') || '0'),
            mentalScore: parseInt(data.get('mentalScore') || '3'),
            painLevel: parseInt(data.get('painLevel') || '0'),
            date: new Date()
        };

        // Validierung: Sportart muss da sein
        if (!newTraining.sport) {
            return fail(400, { error: 'Sportart fehlt!' });
        }

        await trainings.insertOne(newTraining);
        
        // Nach dem Speichern schicken wir den User direkt zum Dashboard
        throw redirect(303, '/dashboard');
    }
};