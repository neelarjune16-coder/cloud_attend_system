import { auth, db } from "./firebase.js";
import { requireRole } from "./authGuard.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
    collection,
    doc,
    getDocs,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const { user, profile } = await requireRole(["teacher"]);

document.getElementById("welcome").textContent = `Welcome ${profile.name || "Teacher"}`;

const studentDropdown = document.getElementById("student");
const presentBtn = document.getElementById("presentBtn");
const absentBtn = document.getElementById("absentBtn");
const statusHint = document.getElementById("statusHint");

let attendanceStatus = "";

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

async function loadStudents() {
    studentDropdown.innerHTML = `<option value="">Select Student</option>`;

    const snapshot = await getDocs(collection(db, "users"));

    snapshot.forEach((docSnap) => {
        const student = docSnap.data();
        if (student.role !== "student") return;

        const option = document.createElement("option");
        option.value = student.email;
        option.textContent = student.name;
        option.dataset.name = student.name;
        studentDropdown.appendChild(option);
    });
}

function setStatus(status) {
    attendanceStatus = status;
    presentBtn.classList.toggle("active-present", status === "Present");
    absentBtn.classList.toggle("active-absent", status === "Absent");
    statusHint.textContent = `Selected: ${status}`;
}

presentBtn.addEventListener("click", () => setStatus("Present"));
absentBtn.addEventListener("click", () => setStatus("Absent"));

document.getElementById("saveAttendance").addEventListener("click", async () => {
    const subject = document.getElementById("subject").value;
    const studentEmail = studentDropdown.value;
    const selectedOption = studentDropdown.options[studentDropdown.selectedIndex];
    const studentName = selectedOption?.dataset.name || selectedOption?.textContent || "";

    if (!subject || !studentEmail || !attendanceStatus) {
        alert("Please select subject, student, and Present or Absent.");
        return;
    }

    const date = todayISO();
    const recordId = `${studentEmail}_${subject}_${date}`.replace(/[@.]/g, "_");

    try {
        await setDoc(doc(db, "attendance", recordId), {
            studentName,
            studentEmail,
            subject,
            status: attendanceStatus,
            teacher: user.email,
            date
        });

        alert("Attendance saved.");
        document.getElementById("subject").selectedIndex = 0;
        studentDropdown.selectedIndex = 0;
        attendanceStatus = "";
        presentBtn.classList.remove("active-present");
        absentBtn.classList.remove("active-absent");
        statusHint.textContent = "";
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});

document.getElementById("viewAttendance").addEventListener("click", () => {
    window.location.href = "attendance.html";
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
});

await loadStudents();
