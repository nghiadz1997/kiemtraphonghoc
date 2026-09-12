import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getMessaging, Messaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAm9GKZHeL7UyfiVnERuxqXh0HkT0qSTyk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "qttb-76e62.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "qttb-76e62",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "qttb-76e62.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "44922156213",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:44922156213:web:73df7cedd0e6ff7f6f7afc",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-L20E52MVZN"
};

export const isFirebaseConfigured = true;

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const databaseId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || "default";
const db: Firestore = getFirestore(app, databaseId);

export { app, auth, db };

// Khởi tạo Firebase Cloud Messaging (chỉ hỗ trợ trên browser client)
export async function getFCM(): Promise<Messaging | null> {
  if (typeof window === "undefined" || !app) return null;
  try {
    const supported = await isSupported();
    if (supported) {
      return getMessaging(app);
    }
  } catch (err) {
    console.warn("Firebase Cloud Messaging not supported in this browser:", err);
  }
  return null;
}
