// ==========================
// CONFIG
// ==========================
const API_BASE = "https://school-portal-backend-ar5x.onrender.com/api";

// Demo fallback data if backend fails or returns empty
const DEMO_CLASSES = [
  { id: 1, name: 'JSS 1' },
  { id: 2, name: 'JSS 2' },
  { id: 3, name: 'SSS 1' },
  { id: 4, name: 'SSS 2' }
];
const DEMO_SUBJECTS = [
  { id: 1, name: 'Mathematics' },
  { id: 2, name: 'English' },
  { id: 3, name: 'Basic Science' },
  { id: 4, name: 'Biology' },
  { id: 5, name: 'Chemistry' }
];

// ==========================
// UTILITY FUNCTIONS
// ==========================
function $(id) { return document.getElementById(id); }

function showMsg(id, msg, isError = false) {
  const el = $(id);
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? "#f56565" : "#48bb78";
  el.style.padding = "12px 16px";
  el.style.borderRadius = "8px";
  el.style.background = isError ? "#fff5f5" : "#f0fff4";
  el.style.border = `1px solid ${isError ? "#feb2b2" : "#9ae6b4"}`;
  el.style.marginTop = "16px";
}

// ==========================
// HERO BACKGROUND SLIDER
// (Unchanged)
// ==========================
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length === 0) return;
  let currentSlide = 0;
  const slideInterval = 8000;
  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
  }
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }
  const sliderTimer = setInterval(nextSlide, slideInterval);
  showSlide(0);
  return {
    pause: () => clearInterval(sliderTimer),
    resume: () => setInterval(nextSlide, slideInterval),
    goto: (index) => {
      currentSlide = index;
      showSlide(currentSlide);
    }
  };
}

// ==========================
// ROLE-BASED MENU CONTROL
// (Unchanged)
// ==========================
function updateMenuForRole(role) { /* ... Unchanged ... */ }

// ==========================
// PAGE TITLE UPDATES
// (Unchanged)
// ==========================
function updatePageTitle(title, subtitle) { /* ... Unchanged ... */ }

// ==========================
// USER PROFILE DISPLAY
// (Unchanged)
// ==========================
function updateUserProfile(username, role) { /* ... Unchanged ... */ }

// ==========================
// NAVIGATION
// (Unchanged)
// ==========================
const views = document.querySelectorAll(".view");
const navLinks = document.querySelectorAll(".nav-link");
function showView(name) { /* ... Unchanged ... */ }

// ==========================
// LOAD CLASSES & SUBJECTS with Fallback Demo Data
// ==========================
async function loadClasses() {
  let data = [];
  try {
    const res = await fetch(`${API_BASE}/classes`);
    data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("No class data from API—loading demo classes.");
      data = DEMO_CLASSES;
    }
  } catch (err) {
    console.error("Error loading classes from API, using demo data", err);
    data = DEMO_CLASSES;
  }
  const classSelects = [
    'admin-teacher-class',
    'admin-student-class',
    'timetable-class',
    'notes-class'
  ];
  classSelects.forEach(id => {
    const sel = $(id);
    if (sel) {
      sel.innerHTML = '<option value="">Select Class</option>' +
        data.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    }
  });
  console.log("Class selects populated:", classSelects.map(id => !!$(id)));
}

async function loadSubjects() {
  let data = [];
  try {
    const res = await fetch(`${API_BASE}/subjects`);
    data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("No subject data from API—loading demo subjects.");
      data = DEMO_SUBJECTS;
    }
  } catch (err) {
    console.error("Error loading subjects from API, using demo data", err);
    data = DEMO_SUBJECTS;
  }
  const subjectSelects = [
    'notes-subject'
  ];
  subjectSelects.forEach(id => {
    const sel = $(id);
    if (sel) {
      sel.innerHTML = '<option value="">Select Subject</option>' +
        data.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
    }
  });
  console.log("Subject selects populated:", subjectSelects.map(id => !!$(id)));
}

// ==========================
// Remainder of your script...
// (Unchanged except loadClasses/loadSubjects!)
// ==========================
document.addEventListener('DOMContentLoaded', function() {
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showView(link.dataset.view);
    });
  });

  document.querySelectorAll("[data-view-btn]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      showView(e.target.dataset.viewBtn);
    });
  });

  // REPLACED: Load classes/subjects with robust fallback
  loadClasses();
  loadSubjects();

  // ...The rest of your existing code...
  // ADMIN ACTIONS, TIMETABLE, ASSIGNMENTS, NOTES, CBT, REPORTS, PAYMENTS, LOGIN, LOGOUT, INITIALIZE HERO SLIDER, ETC
  // No changes needed, since dropdown is now robust.
  // For clarity, you do not need to change any other part.

  // Your hero slider init etc:
  setTimeout(() => {
    initHeroSlider();
    if (typeof feather !== 'undefined') feather.replace();
  }, 500);

  console.log("Frontend script with robust dropdown loaded successfully.");
});
