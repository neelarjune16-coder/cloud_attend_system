import { db, createSecondaryAuth } from "./firebase.js";
import { requireRole } from "./authGuard.js";
import {
    createUserWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

await requireRole(["admin"]);

const saveBtn = document.getElementById("saveTeacher");
const message = document.getElementById("message");
const secondaryAuth = createSecondaryAuth();

saveBtn.addEventListener("click", async () => {
    const name = document.getElementById("teacherName").value.trim();
    const email = document.getElementById("teacherEmail").value.trim();
    const department = document.getElementById("teacherDept").value.trim();
    const employeeid = document.getElementById("teacherID").value.trim();
    const password = document.getElementById("teacherPassword").value;

    if (!name || !email || !department || !employeeid || !password) {
        message.className = "error";
        message.textContent = "Please fill all fields.";
        return;
    }

    if (password.length < 6) {
        message.className = "error";
        message.textContent = "Password must be at least 6 characters.";
        return;
    }

    saveBtn.disabled = true;

    try {
        await createUserWithEmailAndPassword(secondaryAuth, email, password);
        await signOut(secondaryAuth);

        await setDoc(doc(db, "users", employeeid), {
            name,
            email,
            department,
            employeeid,
            role: "teacher"
        });

        message.className = "success";
        message.textContent = "Teacher added. They can now log in with this email and password.";

        document.getElementById("teacherName").value = "";
        document.getElementById("teacherEmail").value = "";
        document.getElementById("teacherDept").value = "";
        document.getElementById("teacherID").value = "";
        document.getElementById("teacherPassword").value = "";
    } catch (error) {
        message.className = "error";
        message.textContent = error.code === "auth/email-already-in-use"
            ? "This email is already registered."
            : error.message;
    } finally {
        saveBtn.disabled = false;
    }
});

document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "admin.html";
});
