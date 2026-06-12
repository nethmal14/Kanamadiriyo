import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCfB3v0KUKDJFBXPPFWVjQAnsp9KmiQc2o",
  authDomain: "altn-6fe1d.firebaseapp.com",
  databaseURL: "https://altn-6fe1d-default-rtdb.firebaseio.com",
  projectId: "altn-6fe1d",
  storageBucket: "altn-6fe1d.firebasestorage.app",
  messagingSenderId: "768410289641",
  appId: "1:768410289641:web:74a648cc028a2da36e7778",
  measurementId: "G-87TCL67DHQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);
