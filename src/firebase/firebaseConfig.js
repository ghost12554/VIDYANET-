import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseApiKey =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_API_KEY) || "";

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) || "vidyanet-f1520.firebaseapp.com",
  projectId: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_PROJECT_ID) || "vidyanet-f1520",
  storageBucket: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) || "vidyanet-f1520.firebasestorage.app",
  messagingSenderId: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) || "",
  appId: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_APP_ID) || "",
  measurementId: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID) || ""
};

export const isRealFirebaseConfigured = Boolean(firebaseApiKey && firebaseApiKey.trim());

let app = null;
let auth = null;
let db = null;
let storage = null;

if (isRealFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.warn("Firebase initialization warning (falling back to offline local storage mode):", err);
  }
}

export { app, auth, db, storage };
export default app;
