import { db } from "./firebase.js";
import { requireRole } from "./authGuard.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

await requireRole(["admin"]);

const table = document.getElementById("usersTable");
const roleFilter = document.body.dataset.role;
const emptyText = roleFilter === "teacher" ? "No teachers found" : "No students found";

const snapshot = await getDocs(collection(db, "users"));
const rows = [];

snapshot.forEach((docSnap) => {
    const user = docSnap.data();
    if (user.role !== roleFilter) return;
    rows.push(user);
});

rows.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));

if (rows.length === 0) {
    table.innerHTML = `<tr><td colspan="4" style="text-align:center;">${emptyText}</td></tr>`;
} else if (roleFilter === "teacher") {
    table.innerHTML = rows.map((user) => `
        <tr>
            <td>${user.name || "-"}</td>
            <td>${user.email || "-"}</td>
            <td>${user.department || "-"}</td>
            <td>${user.employeeid || "-"}</td>
        </tr>
    `).join("");
} else {
    table.innerHTML = rows.map((user) => `
        <tr>
            <td>${user.name || "-"}</td>
            <td>${user.email || "-"}</td>
            <td>${user.department || user.class || "-"}</td>
            <td>${user.rollno || user.roll || "-"}</td>
        </tr>
    `).join("");
}

document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "admin.html";
});
