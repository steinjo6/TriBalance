import { trainings } from '$lib/server/db';
import { calcCalories } from '$lib/server/calories';
import { ObjectId } from 'mongodb';

export async function load() {
    // Hol alle Trainings aus MongoDB (neueste zuerst)
    const allTrainings = await trainings.find({}).sort({ _id: -1 }).toArray();
    
    // Wir wandeln die Daten so um, dass Svelte sie versteht
    const processedTrainings = allTrainings.map(t => ({
        ...t,
        _id: t._id.toString(),
        // Hier nutzen wir deine neue calories.js Logik!
        calories: calcCalories(t.sport, t.duration),
        isWarning: t.painLevel > 7
    }));

    return { trainings: processedTrainings };
}

export const actions = {
    deleteTraining: async ({ request }) => {
        const data = await request.formData();
        const id = data.get('id');
        if (id) {
            await trainings.deleteOne({ _id: new ObjectId(id) });
        }
        return { success: true };
    }
};