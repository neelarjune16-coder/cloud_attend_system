import { auth } from "./firebase.js";
import { dashboardForRole, getUserProfile } from "./authGuard.js";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    try {
        const profile = await getUserProfile(user.email);
        if (profile?.role) {
            window.location.href = dashboardForRole(profile.role);
        }
    } catch (err) {
        console.error("Auth state profile check error:", err);
    }
});

async function handleLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    message.className = "";
    message.textContent = "";

    if (!email || !password) {
        message.className = "error";
        message.textContent = "Please enter both email and password.";
        return;
    }

    loginBtn.disabled = true;
    loginBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Signing In...`;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const profile = await getUserProfile(userCredential.user.email);

        if (!profile?.role) {
            await signOut(auth);
            message.className = "error";
            message.textContent = "This account is not assigned a role in Firestore. Contact admin.";
            loginBtn.disabled = false;
            loginBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Sign In`;
            return;
        }

        window.location.href = dashboardForRole(profile.role);
    } catch (error) {
        message.className = "error";
        message.textContent = friendlyAuthError(error);
        console.error("Login error:", error);
        loginBtn.disabled = false;
        loginBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Sign In`;
    }
}

function friendlyAuthError(error) {
    if (!error || !error.code) return error?.message || "An unknown authentication error occurred.";
    switch (error.code) {
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Incorrect email or password.";
        case "auth/too-many-requests":
            return "Too many failed attempts. Please try again later.";
        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";
        default:
            return error.message;
    }
}

loginBtn.addEventListener("click", handleLogin);

passwordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleLogin();
});

emailInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleLogin();
});
