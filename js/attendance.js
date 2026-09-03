import { db } from "./firebase.js";
import { dashboardForRole, requireRole } from "./authGuard.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const { user, profile } = await requireRole(["admin", "teacher"]);

const table = document.getElementById("attendanceTable");
const searchStudent = document.getElementById("searchStudent");
const filterSubject = document.getElementById("filterSubject");
const filterDate = document.getElementById("filterDate");

let attendanceData = [];

function toISODate(value) {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const parts = String(value).split("/");
    if (parts.length === 3) {
        const [month, day, year] = parts;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    return value;
}

async function loadAttendance() {
    attendanceData = [];
    const snapshot = await getDocs(collection(db, "attendance"));

    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.studentName || !data.studentEmail || !data.subject || !data.status || !data.date) {
            return;
        }

        if (profile.role === "teacher" && data.teacher && data.teacher !== user.email) {
            return;
        }

        attendanceData.push(data);
    });

    attendanceData.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    displayAttendance(attendanceData);
}

function displayAttendance(records) {
    if (records.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">No attendance records found</td>
            </tr>
        `;
        return;
    }

    table.innerHTML = records.map((record) => `
        <tr>
            <td>${record.studentName}</td>
            <td>${record.studentEmail}</td>
            <td>${record.subject}</td>
            <td class="${record.status === "Present" ? "status-present" : "status-absent"}">${record.status}</td>
            <td>${record.date}</td>
        </tr>
    `).join("");
}

function filterAttendance() {
    const student = searchStudent.value.toLowerCase().trim();
    const subject = filterSubject.value;
    const date = filterDate.value;

    const filtered = attendanceData.filter((record) => {
        const matchStudent =
            record.studentName.toLowerCase().includes(student) ||
            record.studentEmail.toLowerCase().includes(student);
        const matchSubject = subject === "" || record.subject === subject;
        const matchDate = date === "" || toISODate(record.date) === date;
        return matchStudent && matchSubject && matchDate;
    });

    displayAttendance(filtered);
}

searchStudent.addEventListener("keyup", filterAttendance);
filterSubject.addEventListener("change", filterAttendance);
filterDate.addEventListener("change", filterAttendance);

document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = dashboardForRole(profile.role);
});

try {
    await loadAttendance();
} catch (error) {
    console.error(error);
    alert(error.message);
}
