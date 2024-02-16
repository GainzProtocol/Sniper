// helpers/retrieveAlias.js
import { db } from '../config/firebaseConfig.js';
import { cache } from './cache.js';

export const getOrCreateAlias = async (telegramId) => {
    // Check cache
    if (cache[telegramId]?.alias) {
        return cache[telegramId].alias
    }
    
    return db.runTransaction(async (transaction) => {
        const userRef = db.collection('users').doc(String(telegramId));
        const doc = await transaction.get(userRef);
    
        if (!doc.exists) {
            // If the user doesn't exist, create a new alias for them
            const newAlias = generateRandomAlias(8);
            transaction.set(userRef, { alias: newAlias });
            cache[telegramId].alias = newAlias
            console.log(`Created alias ${newAlias}`)
            return newAlias;
        } else {
            // If the user exists, return their alias
            const existingAlias = doc.data().alias;
            cache[telegramId].alias = existingAlias
            return existingAlias;
        }
    });
}

const generateRandomAlias = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}