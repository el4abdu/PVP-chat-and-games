// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbDDimyxwhKaXon4IQwZTpgP2Twb8bHMo",
  authDomain: "pvp-chat-fe5ab.firebaseapp.com",
  databaseURL: "https://pvp-chat-fe5ab-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pvp-chat-fe5ab",
  storageBucket: "pvp-chat-fe5ab.firebasestorage.app",
  messagingSenderId: "387500645051",
  appId: "1:387500645051:web:4a4428e53c637ec2e9a79e",
  measurementId: "G-90LCQ3SF9X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { app, analytics, auth, database, storage }; 