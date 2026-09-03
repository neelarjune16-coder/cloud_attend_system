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

    const profile = await getUserProfile(user.email);
    if (profile?.role) {
        window.location.href = dashboardForRole(profile.role);
    }
});

async function handleLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    message.textContent = "";

    if (!email || !password) {
        message.textContent = "Please enter email and password.";
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const profile = await getUserProfile(userCredential.user.email);

        if (!profile?.role) {
            await signOut(auth);
            message.textContent = "This account is not assigned a role. Contact the admin.";
            loginBtn.disabled = false;
            loginBtn.textContent = "Login";
            return;
        }

        window.location.href = dashboardForRole(profile.role);
    } catch (error) {
        message.textContent = friendlyAuthError(error);
        console.error(error);
        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }
}

function friendlyAuthError(error) {
    switch (error.code) {
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Incorrect email or password.";
        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";
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
