import { auth, db } from "./firebase.js";
import { requireRole } from "./authGuard.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const { user, profile } = await requireRole(["student"]);

document.getElementById("welcome").textContent = `Welcome ${profile.name || "Student"}`;
document.getElementById("studentName").textContent = profile.name || "-";
document.getElementById("rollNo").textContent = profile.rollno || profile.roll || "-";
document.getElementById("studentClass").textContent = profile.class || profile.department || "-";

const table = document.getElementById("attendanceTable");

const attendanceQuery = query(
    collection(db, "attendance"),
    where("studentEmail", "==", user.email)
);

const attendanceSnapshot = await getDocs(attendanceQuery);

const records = [];
attendanceSnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.subject && data.status && data.date) {
        records.push(data);
    }
});

records.sort((a, b) => String(b.date).localeCompare(String(a.date)));

let present = 0;
records.forEach((record) => {
    if (record.status === "Present") present++;
});

const percentage = records.length > 0 ? Math.round((present / records.length) * 100) : 0;
document.getElementById("percentage").textContent = percentage + "%";
document.getElementById("recordCount").textContent = records.length;
document.getElementById("presentCount").textContent = present;

if (records.length === 0) {
    table.innerHTML = `
        <tr>
            <td colspan="3" style="text-align:center;">No attendance records yet</td>
        </tr>
    `;
} else {
    table.innerHTML = records.map((record) => `
        <tr>
            <td>${record.subject}</td>
            <td class="${record.status === "Present" ? "status-present" : "status-absent"}">${record.status}</td>
            <td>${record.date}</td>
        </tr>
    `).join("");
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
});
