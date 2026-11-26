import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// App Check: every database and photo request carries a token proving it
// came from this app on its own website (checked with invisible reCAPTCHA
// v3). Off until VITE_FIREBASE_APPCHECK_SITE_KEY is set, and has no effect on
// the backend until enforcement is turned on in the Firebase console.
const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY;
export const appCheckEnabled = Boolean(appCheckSiteKey) && import.meta.env.VITE_USE_EMULATOR !== '1';
if (appCheckEnabled) {
  // On localhost, print a debug token in the browser console instead (it can
  // be registered in the console so local testing keeps working).
  if (import.meta.env.DEV) self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  initializeAppCheck(app, { provider: new ReCaptchaV3Provider(appCheckSiteKey), isTokenAutoRefreshEnabled: true });
}

export const db = getFirestore(app);
export const storage = getStorage(app);

// Test-only: VITE_USE_EMULATOR=1 points the app at a local Firestore
// emulator (used to check the security rules). Never set in the real build.
if (import.meta.env.VITE_USE_EMULATOR === '1') {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}
