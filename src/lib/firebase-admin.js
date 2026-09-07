import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (clientEmail && privateKey && !clientEmail.includes('xxxxx')) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail,
          privateKey,
        }),
      });
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error.message);
  }
}

let authObj = null;
let dbObj = null;

try {
  if (admin.apps.length) {
    authObj = admin.auth();
  }
} catch (e) {
  console.warn('[adminAuth init warning]:', e.message);
}

try {
  if (admin.apps.length) {
    dbObj = admin.firestore();
  }
} catch (e) {
  console.warn('[adminDb init warning]:', e.message);
}

export const adminAuth = authObj;
export const adminDb = dbObj;
