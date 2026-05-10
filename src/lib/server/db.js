// src/lib/server/db.js
import { MongoClient } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

// Erstelle einen Singleton-Client, um zu verhindern, dass bei jedem 
// Neuladen der App (Hot Reload) eine neue Verbindung geöffnet wird.
const client = new MongoClient(MONGODB_URI);

/**
 * Stellt die Verbindung zur MongoDB her.
 * Diese Funktion rufen wir idealerweise in der hooks.server.js auf.
 */
export async function connectDB() {
    try {
        await client.connect();
        console.log('>>> MongoDB verbunden: TriBalance Database läuft');
    } catch (error) {
        console.error('MongoDB Verbindungsfehler:', error);
    }
}

// Zugriff auf die Datenbank (Standardname: 'tribalance')
const db = client.db('tribalance');

// Exportiere die Collections, damit du sie in deinen Form Actions nutzen kannst
export const users = db.collection('users');
export const trainings = db.collection('trainings');

export default client;