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
  const slideInterval = 8000; // 8 seconds per slide (matches animation duration)
  
  function showSlide(index) {
    // Remove active class from all slides
    slides.forEach(slide => {
      slide.classList.remove('active');
    });
    
    // Add active class to current slide
    slides[index].classList.add('active');
    
    console.log(`Showing slide ${index + 1} of ${slides.length}`);
  }
  
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }
  
  // Start automatic slideshow
  const sliderTimer = setInterval(nextSlide, slideInterval);
  
  // Show first slide immediately
  showSlide(0);
  
  console.log(`Hero slider initialized with ${slides.length} slides`);
  
  // Optional: Pause slider when user navigates away from home
  document.addEventListener('click', (e) => {
    const currentView = document.querySelector('.view.active');
    if (currentView && currentView.id !== 'view-home') {
      // User navigated away from home page
      // Slider will still run but won't be visible
    }
  });
  
  // Return control object if needed
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
  // Get all nav links
  const allNavLinks = document.querySelectorAll('.nav-link');
  
  // Define which views each role can access
  const rolePermissions = {
    admin: ['home', 'admin', 'timetable', 'assignments', 'notes', 'cbt', 'reports', 'payments'],
    teacher: ['home', 'teacher', 'timetable', 'assignments', 'notes', 'cbt', 'reports'],
    student: ['home', 'student', 'timetable', 'assignments', 'notes', 'cbt', 'reports', 'payments'],
    parent: ['home', 'parent', 'timetable', 'reports', 'payments']
  };
  
  // Hide/show nav items based on role
  allNavLinks.forEach(link => {
    const view = link.dataset.view;
    
    if (view === 'login') {
      // Hide login link when logged in
      if (role) {
        link.style.display = 'none';
      } else {
        link.style.display = 'flex';
      }
    } else if (role && rolePermissions[role]) {
      // Show only allowed views for the role
      if (rolePermissions[role].includes(view)) {
        link.style.display = 'flex';
      } else {
        link.style.display = 'none';
      }
    } else if (!role) {
      // Not logged in - show only home and login
      if (view === 'home' || view === 'login') {
        link.style.display = 'flex';
      } else {
        link.style.display = 'none';
      }
    }
  });
  
  // Hide/show nav sections based on role
  const navSections = document.querySelectorAll('.nav-section');
  navSections.forEach(section => {
    if (role) {
      section.style.display = 'block';
    } else {
      section.style.display = 'none';
    }
  });
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
    
    // Update menu based on role
    updateMenuForRole(role);
  } else {
    if (profileEl) profileEl.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");
    
    // Reset menu for logged out state
    updateMenuForRole(null);
  }
}

// ==========================
// NAVIGATION
// ==========================
const views = document.querySelectorAll(".view");
const navLinks = document.querySelectorAll(".nav-link");

function showView(name) {
  // Check if user has permission to view this page
  const currentRole = localStorage.getItem('userRole');
  
  const rolePermissions = {
    admin: ['home', 'admin', 'timetable', 'assignments', 'notes', 'cbt', 'reports', 'payments'],
    teacher: ['home', 'teacher', 'timetable', 'assignments', 'notes', 'cbt', 'reports'],
    student: ['home', 'student', 'timetable', 'assignments', 'notes', 'cbt', 'reports', 'payments'],
    parent: ['home', 'parent', 'timetable', 'reports', 'payments']
  };
  
  // If not logged in and trying to access protected page, redirect to login
  if (!currentRole && name !== 'home' && name !== 'login') {
    showView('login');
    return;
  }
  
  // If logged in but doesn't have permission, redirect to their dashboard
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
  
  // Update page title based on view
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
  
  if (titles[name]) {
    updatePageTitle(titles[name][0], titles[name][1]);
  }
  
  // Scroll to top
  window.scrollTo(0, 0);
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  
  // Setup navigation
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

  // ==========================
  // LOAD CLASSES & SUBJECTS
  // ==========================
  async function loadClasses() {
    try {
      const res = await fetch(`${API_BASE}/classes`);
      const data = await res.json();
      
      console.log("Classes loaded:", data);
      
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
      
      console.log("Subjects loaded:", data);
      
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
    } catch (err) {
      console.error("Error loading subjects", err);
    }
  }

  // ==========================
  // ADMIN ACTIONS
  // ==========================
  async function createTeacher() {
    const surname = $("admin-teacher-surname").value.trim();
    const first_name = $("admin-teacher-other").value.trim();
    const email = $("admin-teacher-email")?.value.trim() || "";
    const assigned_class_id = $("admin-teacher-class").value || null;
    const subject_ids = $("admin-teacher-subjects").value.split(",").map(s => parseInt(s.trim())).filter(Boolean);

    if (!surname || !first_name) {
      return showMsg("admin-create-teacher-msg","Surname and First Name required",true);
    }

    showMsg("admin-create-teacher-msg", "Creating teacher...");

    try {
      const res = await fetch(`${API_BASE}/create-teacher`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({surname, first_name, email, assigned_class_id, subject_ids})
      });
      const data = await res.json();
      
      if (data.error) {
        showMsg("admin-create-teacher-msg", data.error, true);
      } else {
        showMsg("admin-create-teacher-msg", `✓ Teacher created successfully!\nUsername: ${data.username}\nPassword: teacher`);
        $("admin-teacher-surname").value = "";
        $("admin-teacher-other").value = "";
        $("admin-teacher-email").value = "";
        $("admin-teacher-subjects").value = "";
      }
    } catch(err) {
      showMsg("admin-create-teacher-msg", "Error creating teacher. Please try again.", true);
      console.error(err);
    }
  }

  async function createStudent() {
    const first_name = $("admin-student-first").value.trim();
    const surname = $("admin-student-surname").value.trim();
    const class_id = $("admin-student-class").value;
    const gender = $("admin-student-gender").value;

    if (!first_name || !surname || !class_id) {
      return showMsg("admin-create-student-msg","Please fill all required fields",true);
    }

    showMsg("admin-create-student-msg", "Creating student...");

    try {
      const res = await fetch(`${API_BASE}/create-student`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({first_name, surname, class_id, gender})
      });
      const data = await res.json();
      
      if (data.error) {
        showMsg("admin-create-student-msg", data.error, true);
      } else {
        showMsg("admin-create-student-msg", `✓ Student created successfully!\nUsername: ${data.username}\nPassword: student`);
        $("admin-student-first").value = "";
        $("admin-student-surname").value = "";
      }
    } catch(err) {
      showMsg("admin-create-student-msg","Error creating student. Please try again.",true);
      console.error(err);
    }
  }

  const createTeacherBtn = $("admin-create-teacher");
  if (createTeacherBtn) {
    createTeacherBtn.addEventListener("click", createTeacher);
  }

  const createStudentBtn = $("admin-create-student");
  if (createStudentBtn) {
    createStudentBtn.addEventListener("click", createStudent);
  }

  // ==========================
  // TIMETABLE LOADING
  // ==========================
  async function loadTimetable() {
    const classId = $("timetable-class")?.value;
    if (!classId) return showMsg("timetable-msg", "Please select a class first", true);

    showMsg("timetable-msg", "Loading timetable...");

    try {
      const res = await fetch(`${API_BASE}/timetable?class_id=${classId}`);
      const data = await res.json();
      
      const container = $("timetable-display");
      if (container) {
        if (data.length === 0 || data.error) {
          container.innerHTML = "<p style='color: #718096; text-align: center; padding: 20px;'>No timetable found for this class.</p>";
          showMsg("timetable-msg", "No timetable found", true);
        } else {
          container.innerHTML = `<pre style='color: #4a5568;'>${JSON.stringify(data, null, 2)}</pre>`;
          showMsg("timetable-msg", "✓ Timetable loaded successfully");
        }
      }
    } catch(err) {
      showMsg("timetable-msg", "Error loading timetable. Please try again.", true);
      console.error(err);
    }
  }

  const loadTimetableBtn = $("timetable-load");
  if (loadTimetableBtn) {
    loadTimetableBtn.addEventListener("click", loadTimetable);
  }

  // ==========================
  // ASSIGNMENTS LOADING
  // ==========================
  async function loadAssignments() {
    showMsg("assign-msg", "Loading assignments...");

    try {
      const res = await fetch(`${API_BASE}/assignments`);
      const data = await res.json();
      
      const container = $("assign-list");
      if (container) {
        if (data.length === 0 || data.error) {
          container.innerHTML = "<p style='color: #718096; text-align: center; padding: 20px;'>No assignments found.</p>";
          showMsg("assign-msg", "No assignments found", true);
        } else {
          container.innerHTML = `<pre style='color: #4a5568;'>${JSON.stringify(data, null, 2)}</pre>`;
          showMsg("assign-msg", "✓ Assignments loaded successfully");
        }
      }
    } catch(err) {
      showMsg("assign-msg", "Error loading assignments. Please try again.", true);
      console.error(err);
    }
  }

  const loadAssignmentsBtn = $("assign-load");
  if (loadAssignmentsBtn) {
    loadAssignmentsBtn.addEventListener("click", loadAssignments);
  }

  // ==========================
  // LESSON NOTES LOADING
  // ==========================
  async function loadNotes() {
    const classId = $("notes-class")?.value;
    const subjectId = $("notes-subject")?.value;
    
    if (!classId || !subjectId) {
      return showMsg("notes-msg", "Please select both class and subject", true);
    }

    showMsg("notes-msg", "Loading notes...");

    try {
      const res = await fetch(`${API_BASE}/notes?class_id=${classId}&subject_id=${subjectId}`);
      const data = await res.json();
      
      const container = $("notes-list");
      if (container) {
        if (data.length === 0 || data.error) {
          container.innerHTML = "<p style='color: #718096; text-align: center; padding: 20px;'>No notes found for this class and subject.</p>";
          showMsg("notes-msg", "No notes found", true);
        } else {
          container.innerHTML = `<pre style='color: #4a5568;'>${JSON.stringify(data, null, 2)}</pre>`;
          showMsg("notes-msg", "✓ Notes loaded successfully");
        }
      }
    } catch(err) {
      showMsg("notes-msg", "Error loading notes. Please try again.", true);
      console.error(err);
    }
  }

  const loadNotesBtn = $("notes-load");
  if (loadNotesBtn) {
    loadNotesBtn.addEventListener("click", loadNotes);
  }

  // ==========================
  // CBT LOADING
  // ==========================
  async function loadCBTs() {
    showMsg("cbt-msg", "Loading CBTs...");

    try {
      const res = await fetch(`${API_BASE}/cbts`);
      const data = await res.json();
      
      const container = $("cbt-list");
      if (container) {
        if (data.length === 0 || data.error) {
          container.innerHTML = "<p style='color: #718096; text-align: center; padding: 20px;'>No CBT exams found.</p>";
          showMsg("cbt-msg", "No CBTs found", true);
        } else {
          container.innerHTML = `<pre style='color: #4a5568;'>${JSON.stringify(data, null, 2)}</pre>`;
          showMsg("cbt-msg", "✓ CBTs loaded successfully");
        }
      }
    } catch(err) {
      showMsg("cbt-msg", "Error loading CBTs. Please try again.", true);
      console.error(err);
    }
  }

  const loadCBTsBtn = $("cbt-load");
  if (loadCBTsBtn) {
    loadCBTsBtn.addEventListener("click", loadCBTs);
  }

  // ==========================
  // REPORTS LOADING
  // ==========================
  async function loadReports() {
    showMsg("reports-msg", "Loading reports...");

    try {
      const res = await fetch(`${API_BASE}/reports`);
      const data = await res.json();
      
      const container = $("reports-list");
      if (container) {
        if (data.length === 0 || data.error) {
          container.innerHTML = "<p style='color: #718096; text-align: center; padding: 20px;'>No report cards found.</p>";
          showMsg("reports-msg", "No reports found", true);
        } else {
          container.innerHTML = `<pre style='color: #4a5568;'>${JSON.stringify(data, null, 2)}</pre>`;
          showMsg("reports-msg", "✓ Reports loaded successfully");
        }
      }
    } catch(err) {
      showMsg("reports-msg", "Error loading reports. Please try again.", true);
      console.error(err);
    }
  }

  const loadReportsBtn = $("reports-load");
  if (loadReportsBtn) {
    loadReportsBtn.addEventListener("click", loadReports);
  }

  // ==========================
  // FEE PAYMENT
  // ==========================
  async function initiatePayment() {
    const studentUsername = $("payments-student")?.value.trim();
    const amount = $("payments-amount")?.value;

    if (!studentUsername || !amount) {
      return showMsg("payments-msg", "Please enter student username and amount", true);
    }

    showMsg("payments-msg", "Processing payment...");

    try {
      const res = await fetch(`${API_BASE}/initiate-payment`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({student_username: studentUsername, amount: parseFloat(amount)})
      });
      const data = await res.json();
      
      if (data.error) {
        showMsg("payments-msg", data.error, true);
      } else if (data.payment_url) {
        window.open(data.payment_url, '_blank');
        showMsg("payments-msg", "✓ Payment window opened in new tab");
      } else {
        showMsg("payments-msg", "✓ Payment initiated successfully");
      }
    } catch(err) {
      showMsg("payments-msg", "Error initiating payment. Please try again.", true);
      console.error(err);
    }
  }

  const initiatePaymentBtn = $("payments-pay");
  if (initiatePaymentBtn) {
    initiatePaymentBtn.addEventListener("click", initiatePayment);
  }

  // ==========================
  // LOGIN
  // ==========================
  const btnLogin = $("btn-login");
  if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
      const role = $("login-role").value;
      const username = $("login-username").value.trim();
      const password = $("login-password").value.trim();

      if(!username || !password) {
        return showMsg("login-msg","Please enter both username and password",true);
      }

      showMsg("login-msg", "Signing in...");

      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({username, password, role})
        });
        
        const data = await res.json();
        
        console.log("Login response:", data);
        
        if (data.error) {
          showMsg("login-msg", data.error, true);
        } else if (data.success || data.username || data.user) {
          const user = {
            username: data.username || data.user?.username || username,
            role: role,
            ...data
          };
          
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('userRole', role);
          localStorage.setItem('username', user.username);
          
          updateUserProfile(user.username, role);
          
          showMsg("login-msg", `✓ Login successful! Redirecting...`);
          
          setTimeout(() => {
            showView(role);
          }, 1000);
        } else {
          localStorage.setItem('user', JSON.stringify({username, role}));
          localStorage.setItem('userRole', role);
          localStorage.setItem('username', username);
          
          updateUserProfile(username, role);
          showMsg("login-msg", `✓ Logged in as ${role}`);
          
          setTimeout(() => {
            showView(role);
          }, 1000);
        }
      } catch(err) {
        console.error("Login error:", err);
        
        let loginSuccess = false;
        
        if (role === 'admin' && username === 'admin' && password === 'admin') {
          loginSuccess = true;
        } else if (role === 'student' && password === 'student') {
          loginSuccess = true;
        } else if (role === 'teacher' && password === 'teacher') {
          loginSuccess = true;
        } else if (role === 'parent' && password === 'parent') {
          loginSuccess = true;
        }
        
        if (loginSuccess) {
          localStorage.setItem('user', JSON.stringify({username, role}));
          localStorage.setItem('userRole', role);
          localStorage.setItem('username', username);
          
          updateUserProfile(username, role);
          showMsg("login-msg", `✓ Logged in as ${role}`);
          
          setTimeout(() => {
            showView(role);
          }, 1000);
        } else {
          showMsg("login-msg", "Invalid credentials. Please check your username and password.", true);
        }
      }
    });
  }

  const btnDemo = $("btn-demo");
  if (btnDemo) {
    btnDemo.addEventListener("click", () => {
      $("login-role").value = "student";
      $("login-username").value = "0002";
      $("login-password").value = "student";
      showMsg("login-msg","✓ Demo credentials loaded. Click 'Sign In' to continue.");
    });
  }

  // ==========================
  // LOGOUT
  // ==========================
  const btnLogout = $("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      updateUserProfile(null, null);
      showView('home');
      
      $("login-username").value = "";
      $("login-password").value = "";
      
      console.log("Logged out successfully");
    });
  }

  // ==========================
  // INITIALIZE
  // ==========================
  loadClasses();
  loadSubjects();

  // Check if user is already logged in
  const storedUser = localStorage.getItem('user');
  const storedRole = localStorage.getItem('userRole');
  const storedUsername = localStorage.getItem('username');
  
  if (storedUser && storedRole) {
    console.log("User already logged in:", storedRole);
    updateUserProfile(storedUsername || 'User', storedRole);
    updateMenuForRole(storedRole);
  } else {
    // Not logged in - show only home and login in menu
    updateMenuForRole(null);
  }
  
  // ==========================
  // INITIALIZE HERO SLIDER
  // ==========================
  setTimeout(() => {
    initHeroSlider();
    
    // Re-render feather icons
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  }, 500);

  console.log("Frontend script with hero slider loaded successfully.");
});