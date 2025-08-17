
import {initializeApp, getApps, getApp} from 'firebase/app';
import {getAuth, getIdToken} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Add an interceptor to add the auth token to fetch requests
const originalFetch = global.fetch;
global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const currentUser = auth.currentUser;
  if (currentUser && typeof input === 'object' && 'url' in input && input.url.startsWith('/api/')) {
      const token = await getIdToken(currentUser);
      const headers = new Headers(init?.headers);
      headers.set('Authorization', `Bearer ${token}`);
      init = { ...init, headers };
  }
  return originalFetch(input, init);
};

export {app, auth, db};
