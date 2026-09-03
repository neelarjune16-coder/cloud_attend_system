import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAm6oQjahM57SJRgEfiQQQhtSEk8MiZi3M",
    authDomain: "cloud-attendance-system-e9d62.firebaseapp.com",
    projectId: "cloud-attendance-system-e9d62",
    storageBucket: "cloud-attendance-system-e9d62.firebasestorage.app",
    messagingSenderId: "528812123722",
    appId: "1:528812123722:web:accb6e861793365dff28b3",
    measurementId: "G-G1S8MY9JG2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let secondaryAuth;

function createSecondaryAuth() {
    if (!secondaryAuth) {
        const secondaryApp = initializeApp(firebaseConfig, "Secondary");
        secondaryAuth = getAuth(secondaryApp);
    }
    return secondaryAuth;
}

export { auth, db, firebaseConfig, createSecondaryAuth };
