import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const ADMIN_EMAIL = "admin@gmail.com";

export function dashboardForRole(role) {
    if (role === "admin") return "admin.html";
    if (role === "teacher") return "teacher.html";
    if (role === "student") return "student.html";
    return "index.html";
}

export async function getUserProfile(email) {
    if (!email) return null;

    if (email.toLowerCase() === ADMIN_EMAIL) {
        return { email, name: "Admin", role: "admin" };
    }

    const q = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    return snapshot.docs[0].data();
}

export function requireRole(allowedRoles) {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                window.location.href = "index.html";
                return;
            }

            try {
                const profile = await getUserProfile(user.email);

                if (!profile || !profile.role) {
                    window.location.href = "index.html";
                    return;
                }

                if (!allowedRoles.includes(profile.role)) {
                    window.location.href = dashboardForRole(profile.role);
                    return;
                }

                resolve({ user, profile });
            } catch (error) {
                console.error(error);
                window.location.href = "index.html";
            }
        });
    });
}
