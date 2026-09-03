import { db, createSecondaryAuth } from "./firebase.js";
import { requireRole } from "./authGuard.js";
import {
    createUserWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

await requireRole(["admin"]);

const saveBtn = document.getElementById("saveStudent");
const message = document.getElementById("message");
const secondaryAuth = createSecondaryAuth();

saveBtn.addEventListener("click", async () => {
    const name = document.getElementById("studentName").value.trim();
    const email = document.getElementById("studentEmail").value.trim();
    const department = document.getElementById("studentDept").value.trim();
    const rollno = document.getElementById("studentRoll").value.trim();
    const studentid = document.getElementById("studentID").value.trim();
    const password = document.getElementById("studentPassword").value;

    if (!name || !email || !department || !rollno || !studentid || !password) {
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

        await setDoc(doc(db, "users", studentid), {
            name,
            email,
            department,
            class: department,
            roll: rollno,
            rollno,
            studentid,
            role: "student"
        });

        message.className = "success";
        message.textContent = "Student added. They can now log in with this email and password.";

        document.getElementById("studentName").value = "";
        document.getElementById("studentEmail").value = "";
        document.getElementById("studentDept").value = "";
        document.getElementById("studentRoll").value = "";
        document.getElementById("studentID").value = "";
        document.getElementById("studentPassword").value = "";
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
