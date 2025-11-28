import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration - replace with your actual config
const firebaseConfig = {
    apiKey: "AIzaSyC8l_3Qd4451CWCHZyJRTOBMgl2lXt_3FI",
    authDomain: "medicare-1880a.firebaseapp.com",
    projectId: "medicare-1880a",
    storageBucket: "medicare-1880a.firebasestorage.app",
    messagingSenderId: "61560022734",
    appId: "1:61560022734:web:75b902320e316281d7929f",
    measurementId: "G-ZW3S5LWM2B",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Verify Firebase initialization (development only)
if (import.meta.env.DEV) {
  console.log("Firebase initialized:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
  });
}

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;

