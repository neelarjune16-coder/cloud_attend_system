import { auth, db } from "./firebase.js";
import { requireRole } from "./authGuard.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

await requireRole(["admin"]);

async function loadStats() {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const attendanceSnapshot = await getDocs(collection(db, "attendance"));

    let teachers = 0;
    let students = 0;

    usersSnapshot.forEach((docSnap) => {
        const role = docSnap.data().role;
        if (role === "teacher") teachers++;
        if (role === "student") students++;
    });

    let present = 0;
    attendanceSnapshot.forEach((docSnap) => {
        if (docSnap.data().status === "Present") present++;
    });

    const totalRecords = attendanceSnapshot.size;
    const percent = totalRecords > 0 ? Math.round((present / totalRecords) * 100) : 0;

    document.getElementById("teacherCount").textContent = teachers;
    document.getElementById("studentCount").textContent = students;
    document.getElementById("attendanceCount").textContent = totalRecords;
    document.getElementById("attendancePercent").textContent = percent + "%";
}

loadStats().catch((error) => {
    console.error(error);
});

document.getElementById("addTeacher").addEventListener("click", () => {
    window.location.href = "addTeacher.html";
});

document.getElementById("addStudent").addEventListener("click", () => {
    window.location.href = "addStudent.html";
});

document.getElementById("viewTeachers").addEventListener("click", () => {
    window.location.href = "viewTeachers.html";
});

document.getElementById("viewStudents").addEventListener("click", () => {
    window.location.href = "viewStudents.html";
});

document.getElementById("viewAttendance").addEventListener("click", () => {
    window.location.href = "attendance.html";
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
});
