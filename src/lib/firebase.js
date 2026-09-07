import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Defensive check: If API key is missing (e.g. during Vercel static build compilation step),
// we fall back to a structural mock config to prevent initializeApp from throwing and crashing the build.
const hasValidConfig = !!firebaseConfig.apiKey;

const activeConfig = hasValidConfig 
  ? firebaseConfig 
  : {
      apiKey: "mock-api-key-for-build-time-pass",
      authDomain: "mock-domain.firebaseapp.com",
      projectId: "mock-project-id",
      storageBucket: "mock-bucket.appspot.com",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:0000000000000000000000",
    };

const app = getApps().length === 0 ? initializeApp(activeConfig) : getApps()[0];

export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;
