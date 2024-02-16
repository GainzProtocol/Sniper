import admin from 'firebase-admin';
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin with service account or default credentials
initializeApp({
    credential: applicationDefault(), // replace with cert(serviceAccount) if you're using a service account
});

// Get Firestore instance
const db = getFirestore();

export { db };
