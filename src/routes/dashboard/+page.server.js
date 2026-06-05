import { trainings } from '$lib/server/db';
import { calcCalories } from '$lib/server/calories';
import { redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

const pbTargets = {
    Laufen: [
        { label: '5 km', distance: 5 },
        { label: '10 km', distance: 10 },
        { label: '21 km', distance: 21 },
        { label: '42 km', distance: 42 }
    ],
    Radfahren: [
        { label: '50 km', distance: 50 },
        { label: '100 km', distance: 100 },
        { label: '150 km', distance: 150 },
        { label: '200 km', distance: 200 }
    ],
    Schwimmen: [
        { label: '1 km', distance: 1 },
        { label: '1.5 km', distance: 1.5 },
        { label: '2 km', distance: 2 },
        { label: '3 km', distance: 3 }
    ]
};

function toSeconds(training) {
    if (typeof training.durationSeconds === 'number' && !Number.isNaN(training.durationSeconds)) {
        return training.durationSeconds;
    }

    const durationMinutes = typeof training.duration === 'number' ? training.duration : parseFloat(training.duration || '0');
    return Math.max(0, Math.round(durationMinutes * 60));
}

function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds / 60) % 60;
    const s = seconds % 60;
    const paddedMinutes = String(m).padStart(2, '0');
    const paddedSeconds = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${paddedMinutes}:${paddedSeconds} h` : `${paddedMinutes}:${paddedSeconds} min`;
}

function projectedTimeForTarget(training, targetDistance) {
    if (typeof training.distance !== 'number' || training.distance <= 0) return null;
    const durationSeconds = toSeconds(training);
    if (durationSeconds <= 0) return null;

    const speedKmh = training.distance / (durationSeconds / 3600);
    if (!Number.isFinite(speedKmh) || speedKmh <= 0) return null;

    if (training.distance < targetDistance) return null;

    const timeForTargetSeconds = Math.round((targetDistance / speedKmh) * 3600);
    return timeForTargetSeconds;
}

function findBestTime(trainings, sport, target) {
    const bestSeconds = trainings.reduce((currentBest, training) => {
        if (training.sport !== sport) return currentBest;
        const candidate = projectedTimeForTarget(training, target.distance);
        if (candidate === null) return currentBest;
        if (currentBest === null || candidate < currentBest) return candidate;
        return currentBest;
    }, null);

    return bestSeconds === null ? '--:--' : formatDuration(bestSeconds);
}

function calculatePersonalBests(trainings) {
    return Object.fromEntries(
        Object.entries(pbTargets).map(([sport, targets]) => [
            sport,
            targets.map(target => ({
                label: target.label,
                time: findBestTime(trainings, sport, target)
            }))
        ])
    );
}

export async function load({ locals, cookies }) {
    const userId = locals.user?.id || cookies.get('session');
    if (!userId) {
        throw redirect(303, '/login');
    }

    // Nur nach der User-ID filtern, damit das Dashboard alle Einheiten des Nutzers lädt.
    const filter = { userId };
    const allTrainings = await trainings.find(filter).sort({ _id: -1 }).toArray();
    
    const processedTrainings = allTrainings.map(t => ({
        ...t,
        _id: t._id.toString(),
        calories: calcCalories(t.sport, t.duration),
        isWarning: t.painLevel > 7
    }));

    const personalBests = calculatePersonalBests(processedTrainings);

    return { trainings: processedTrainings, personalBests };
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