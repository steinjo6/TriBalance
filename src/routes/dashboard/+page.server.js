import { trainings } from '$lib/server/db';
import { calcCalories } from '$lib/server/calories';
import { redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

export async function load({ locals }) {
    const userId = locals.user?.id;
    if (!userId) {
        throw redirect(303, '/login');
    }

    const filter = { userId };
    const allTrainings = await trainings.find(filter).sort({ _id: -1 }).toArray();
    
    const processedTrainings = allTrainings.map(t => ({
        ...t,
        _id: t._id.toString(),
        calories: calcCalories(t.sport, t.duration),
        isWarning: t.painLevel > 7
    }));

    return { trainings: processedTrainings };
}

export const actions = {
    deleteTraining: async ({ request, locals }) => {
        const userId = locals.user?.id;
        if (!userId) {
            throw redirect(303, '/login');
        }

        const data = await request.formData();
        const id = data.get('id');
        if (id) {
            await trainings.deleteOne({ _id: new ObjectId(id), userId });
        }
        return { success: true };
    },

    updateTraining: async ({ request, locals }) => {
        const userId = locals.user?.id;
        if (!userId) {
            throw redirect(303, '/login');
        }

        const data = await request.formData();
        const id = data.get('id');
        const distance = parseFloat(String(data.get('distance') ?? '0'));
        const duration = parseInt(String(data.get('duration') ?? '0'), 10);
        const painLevel = parseInt(String(data.get('painLevel') ?? '0'), 10);
        const mentalScore = parseInt(String(data.get('mentalScore') ?? '0'), 10);

        if (!id || isNaN(distance) || distance < 0 || isNaN(duration) || duration < 1 || isNaN(painLevel) || painLevel < 1 || painLevel > 10 || isNaN(mentalScore) || mentalScore < 1 || mentalScore > 5) {
            return { success: false, error: 'Ungültige Trainingswerte für das Update' };
        }

        await trainings.updateOne(
            { _id: new ObjectId(id), userId },
            { $set: { distance, duration, painLevel, mentalScore, updatedAt: new Date() } }
        );

        return { success: true };
    }
};