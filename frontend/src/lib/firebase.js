import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCUWuroauo-dhoSBcaO_Weg0PUZo4HBLXE",
    authDomain: "learnsphere-fe4c2.firebaseapp.com",
    projectId: "learnsphere-fe4c2",
    storageBucket: "learnsphere-fe4c2.firebasestorage.app",
    messagingSenderId: "813038174684",
    appId: "1:813038174684:web:a1eba96b22f2861c680f19"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
