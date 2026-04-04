import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdL0b91F-jxaShHYGwz0_Wv4K9XEfNzuE",
  authDomain: "assetflow-3a878.firebaseapp.com",
  projectId: "assetflow-3a878",
  storageBucket: "assetflow-3a878.firebasestorage.app",
  messagingSenderId: "463525101080",
  appId: "1:463525101080:web:fc218faeb5ecd3adfe0d6d",
  measurementId: "G-7V9ES8PEJ2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);