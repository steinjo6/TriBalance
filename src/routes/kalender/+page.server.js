import { trainings } from '$lib/server/db.js';
import { redirect, fail } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

export async function load({ locals, cookies }) {
    const userId = locals.user?.id || cookies.get('session');
    if (!userId) {
        throw redirect(303, '/login');
    }

    const allTrainings = await trainings.find({ userId }).sort({ plannedDate: 1, createdAt: -1 }).toArray();

    return {
        trainings: allTrainings.map(training => ({
            ...training,
            _id: training._id.toString(),
            plannedDate: training.plannedDate?.toISOString?.() || null,
            createdAt: training.createdAt?.toISOString?.() || null,
            updatedAt: training.updatedAt?.toISOString?.() || null,
            completedAt: training.completedAt?.toISOString?.() || null
        }))
    };
}

export const actions = {
    planTraining: async ({ request, locals, cookies }) => {
        const userId = locals.user?.id || cookies.get('session');
        if (!userId) {
            throw redirect(303, '/login');
        }

        const formData = await request.formData();
        const sport = String(formData.get('sport') || '').trim();
        const plannedDate = String(formData.get('plannedDate') || '').trim();
        const distance = String(formData.get('distance') || '').trim();
        const duration = String(formData.get('duration') || '').trim();

        const errors = {};
        const allowedSports = ['Laufen', 'Schwimmen', 'Radfahren'];

        if (!sport || !allowedSports.includes(sport)) {
            errors.sport = 'Bitte wählen Sie eine Sportart aus.';
        }

        const parsedDate = plannedDate ? new Date(`${plannedDate}T00:00`) : new Date('');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!plannedDate || isNaN(parsedDate.getTime())) {
            errors.plannedDate = 'Bitte geben Sie ein gültiges Datum ein.';
        } else if (parsedDate.getTime() < today.getTime()) {
            errors.plannedDate = 'Das Training muss für heute oder einen zukünftigen Tag geplant werden.';
        }

        const distanceNum = parseFloat(distance || '0');
        if (isNaN(distanceNum) || distanceNum < 0) {
            errors.distance = 'Distanz muss eine positive Zahl sein oder 0.';
        }

        const durationNum = parseInt(duration || '0', 10);
        if (isNaN(durationNum) || durationNum < 1) {
            errors.duration = 'Dauer muss in Minuten angegeben werden und mindestens 1 Minute betragen.';
        }

        if (Object.keys(errors).length > 0) {
            return fail(400, {
                success: false,
                errors,
                values: { sport, plannedDate, distance, duration }
            });
        }

        const plannedRecord = {
            userId,
            sport,
            plannedDate: parsedDate,
            distance: distanceNum,
            durationMinutes: durationNum,
            isPlanned: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await trainings.insertOne(plannedRecord);

        return { success: true };
    },

    toggleComplete: async ({ request, locals, cookies }) => {
        const userId = locals.user?.id || cookies.get('session');
        if (!userId) {
            throw redirect(303, '/login');
        }

        const formData = await request.formData();
        const id = String(formData.get('id') || '').trim();

        if (!id) {
            return fail(400, {
                success: false,
                error: 'Die Trainings-ID fehlt.'
            });
        }

        const result = await trainings.updateOne(
            { _id: new ObjectId(id), userId, isPlanned: true },
            {
                $set: {
                    isPlanned: false,
                    completedAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return fail(404, {
                success: false,
                error: 'Geplantes Training wurde nicht gefunden.'
            });
        }

        return { success: true };
    }
};
