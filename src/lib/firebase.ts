// src/lib/firebase.ts

// These imports are for initializing the Firebase App and Auth service
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, browserLocalPersistence, type Auth } from 'firebase/auth';

// Your Firebase project's configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_VaxhXVCPnoayz2uSoaOR52JRNWCqXhk",
  authDomain: "skillswap-j1sxu.firebaseapp.com",
  projectId: "skillswap-j1sxu",
  storageBucket: "skillswap-j1sxu.appspot.com",
  messagingSenderId: "260459217875",
  appId: "1:260459217875:web:b8c9d7f8a6b4c3e2f1a0b1",
};

// Initialize Firebase App
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // If already initialized, use the existing app instance
}

// Initialize Firebase Authentication with persistence
export const auth: Auth = initializeAuth(app, {
  persistence: browserLocalPersistence
});

// Initialize Cloud Firestore
export const db = getFirestore(app);


// You can also export the app instance if you need it elsewhere
export { app };
