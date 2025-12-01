// ==========================
// CONFIG
// ==========================
const API_BASE = "https://school-portal-backend-ar5x.onrender.com/api";

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
// ==========================
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  
  if (slides.length === 0) {
    console.log('No hero slides found');
    return;
  }
  
  let currentSlide = 0;
  const slideInterval = 8000;
  
  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
    console.log(`Showing slide ${index + 1} of ${slides.length}`);
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
// ==========================
function updateMenuForRole(role) {
  const allNavLinks = document.querySelectorAll('.nav-link');
  
  const rolePermissions = {
    admin: ['home', 'admin', 'timetable', 'assignments', 'notes', 'cbt', 'reports', 'payments'],
    teacher: ['home', 'teacher', 'timetable', 'assignments', 'notes', 'cbt', 'reports'],
    student: ['home', 'student', 'timetable', 'assignments', 'notes', 'cbt', 'reports', 'payments'],
    parent: ['home', 'parent', 'timetable', 'reports', 'payments']
  };
  
  allNavLinks.forEach(link => {
    const view = link.dataset.view;
    
    if (view === 'login') {
      link.style.display = role ? 'none' : 'flex';
    } else if (role && rolePermissions[role]) {
      link.style.display = rolePermissions[role].includes(view) ? 'flex' : 'none';
    } else {
      link.style.display = (view === 'home' || view === 'login') ? 'flex' : 'none';
    }
  });
  
  const navSections = document.querySelectorAll('.nav-section');
  navSections.forEach(section => section.style.display = role ? 'block' : 'none');
}

// ==========================
// PAGE TITLE UPDATES
// ==========================
function updatePageTitle(title, subtitle) {
  const titleEl = $("page-title");
  const subtitleEl = $("page-subtitle");
  if (titleEl) titleEl.textContent = title;
  if (subtitleEl) subtitleEl.textContent = subtitle;
}

// ==========================
// USER PROFILE DISPLAY
// ==========================
function updateUserProfile(username, role) {
  const profileEl = $("user-profile");
  const nameEl = $("user-name");
  const roleEl = $("user-role");
  const logoutBtn = $("btn-logout");
  
  if (username && role) {
    if (profileEl) profileEl.classList.remove("hidden");
    if (nameEl) nameEl.textContent = username;
    if (roleEl) roleEl.textContent = role.charAt(0).toUpperCase() + role.slice(1);
    if (logoutBtn) logoutBtn.classList.remove("hidden");
    updateMenuForRole(role);
  } else {
    if (profileEl) profileEl.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");
    updateMenuForRole(null);
  }
}

// ==========================
// NAVIGATION
// ==========================
const views = document.querySelectorAll(".view");
const navLinks = document.querySelectorAll(".nav-link");

function showView(name) {
  const currentRole = localStorage.getItem('userRole');
  const rolePermissions = {
    admin: ['home', 'admin', 'timetable', 'assignments', 'notes', 'cbt', 'reports', 'payments'],
    teacher: ['home', 'teacher', 'timetable', 'assignments', 'notes', 'cbt', 'reports'],
    student: ['home', 'student', 'timetable', 'assignments', 'notes', 'cbt', 'reports', 'payments'],
    parent: ['home', 'parent', 'timetable', 'reports', 'payments']
  };
  
  if (!currentRole && name !== 'home' && name !== 'login') {
    showView('login');
    return;
  }
  
  if (currentRole && rolePermissions[currentRole] && !rolePermissions[currentRole].includes(name)) {
    showView(currentRole);
    return;
  }
  
  views.forEach(v => v.classList.remove("active"));
  const view = $(`view-${name}`);
  if (view) view.classList.add("active");

  navLinks.forEach(link => link.classList.remove("active"));
  const activeLink = [...navLinks].find(l => l.dataset.view === name);
  if (activeLink) activeLink.classList.add("active");
  
  const titles = {
    home: ["Dashboard", currentRole ? `Welcome back, ${localStorage.getItem('username') || 'User'}!` : "Welcome to SchoolPortal"],
    login: ["Sign In", "Access your account"],
    admin: ["Admin Panel", "Manage school accounts and settings"],
    teacher: ["Teacher Dashboard", "Manage your classes and students"],
    student: ["Student Dashboard", "View your academic progress"],
    parent: ["Parent Dashboard", "Monitor your child's progress"],
    timetable: ["Class Timetable", "View class schedules"],
    assignments: ["Assignments", "View and manage assignments"],
    notes: ["Lesson Notes", "Access teaching materials"],
    cbt: ["CBT Exams", "Computer-Based Testing"],
    reports: ["Report Cards", "View academic reports"],
    payments: ["Fee Payment", "Manage school fee payments"]
  };
  
  if (titles[name]) updatePageTitle(titles[name][0], titles[name][1]);
  window.scrollTo(0, 0);
}

// ==========================
// DOM CONTENT LOADED
// ==========================
document.addEventListener('DOMContentLoaded', function() {
  
  navLinks.forEach(link => link.addEventListener("click", (e) => {
    e.preventDefault();
    showView(link.dataset.view);
  }));

  document.querySelectorAll("[data-view-btn]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      showView(e.target.dataset.viewBtn);
    });
  });

  // ==========================
  // LOAD CLASSES & SUBJECTS
  // ==========================
  async function loadClasses() {
    try {
      const res = await fetch(`${API_BASE}/classes`);
      const data = await res.json();
      
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
    } catch (err) {
      console.error("Error loading classes", err);
    }
  }

  async function loadSubjects() {
    try {
      const res = await fetch(`${API_BASE}/subjects`);
      const data = await res.json();
      
      const subjectSelects = [
        'admin-teacher-subjects',
        'teacher-subject',
        'student-subject',
        'notes-subject'
      ];
      
      subjectSelects.forEach(id => {
        const sel = $(id);
        if (sel) {
          sel.innerHTML = '<option value="">Select Subject</option>' + 
            data.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
        }
      });
    } catch (err) {
      console.error("Error loading subjects", err);
    }
  }

  loadClasses();
  loadSubjects();

  // ==========================
  // HERO SLIDER
  // ==========================
  setTimeout(() => {
    initHeroSlider();
    if (typeof feather !== 'undefined') feather.replace();
  }, 500);

  // ==========================
  // CHECK LOGIN STATE
  // ==========================
  const storedUser = localStorage.getItem('user');
  const storedRole = localStorage.getItem('userRole');
  const storedUsername = localStorage.getItem('username');
  
  if (storedUser && storedRole) {
    updateUserProfile(storedUsername || 'User', storedRole);
    updateMenuForRole(storedRole);
  } else {
    updateMenuForRole(null);
  }

  console.log("Frontend script loaded successfully.");
});
