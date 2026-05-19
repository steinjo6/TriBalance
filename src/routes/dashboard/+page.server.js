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
    }
};