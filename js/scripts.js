console.log('project vyas loaded');

// ============================================
// GLOBAL STATE
// ============================================
let currentUser = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing Project Vyas...');

  // Load saved data
  loadUserSession();
  loadTheme();

  // Setup components
  setupAuthForms();
  setupDropdowns();

  // Initialize animations
  setTimeout(initializeAnimations, 500);

  // Handle initial page
  const { pageId, topicIndex } = parsePageHash();
  if (pageId) {
    showPage(pageId, topicIndex);
  }
});

// ============================================
// AUTHENTICATION
// ============================================
function loadUserSession(){
  try{
    const stored = sessionStorage.getItem('currentUser');
  if (stored) {
    currentUser = JSON.parse(stored);
    updateUIForLoggedInUser();
  }
  } catch (e) {
    console.error('Failed to load user session:', e);
  }
}

function setupAuthForms() {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      // Simple validation (in production, verify against backend)
      if (email && password.lenght >= 6) {
        currentUser = {
          name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
          email: email
        };
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUIForLoggedInUser();
        showPage('home');
        showToast('Welcome back, ', +currentUser.name + '!', 'success');
      } else {
        showToast('Please enter valid credentials', 'error');
      }
    });
  }

  // Signup form
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('signupName').value;
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if(!name || !email || !password){
        showToast('All fields are required', 'error');
        return;
      }

      if(password.length < 6){
        showToast('Password must be at least 6 charcters', 'error');
        return;
      }
      
      if (password !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
      }
      
      currentUser = { name, email };
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
      updateUIForLoggedInUser();
      showPage('home');
      showToast('Account created successfully! Welcome, ', +name+ '!', 'success');
    });
  }
}

function updateUIForLoggedInUser() {
  const userProfile = document.getElementById('userprofile');
  const authButtons = document.getElementById('authButtons');
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  
  if (currentUser) {
    if (userProfile) userProfile.style.display = 'flex';
    if (authButtons) authButtons.style.display = 'none';
    if (userName) userName.textContent = currentUser.name;
    if (userAvatar) {
      const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      userAvatar.textContent = initials;
    }
  }
}

function logout() {
  currentUser = null;
  sessionStorage.removeItem('currentUser');
  
  const userProfile = document.getElementById('userprofile');
  const authButtons = document.getElementById('authButtons');
  
  if (userProfile) userProfile.style.display = 'none';
  if (authButtons) authButtons.style.display = 'block';
  
  showPage('home');
  showToast('Logged out successfully', 'info');
}

// ============================================
// DROPDOWN FUNCTIONALITY
// ============================================
function setupDropdowns(){
  //Initialize Bootstrap dropdowns if available
  if(typeof bootstrap !== 'undefined'){
    const drpdownElementList = document.querySelectorAll('.dropdown-toggle');
    const dropdownList = [...drpdownElementList].map(dropdownToggleEl => {
      return new bootstrap.Dropdown(dropdownToggleEl);
    });
  }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 10000;
      max-width: 350px;
    `;
    document.body.appendChild(container);
  }
  
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#6366f1',
    warning: '#f59e0b'
  };
  
  const icons = {
    success: 'check-circle-fill',
    error: 'x-circle-fill',
    info: 'info-circle-fill',
    warning: 'exclamation-triangle-fill'
  };
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    background: ${colors[type]};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    animation: slideInRight 0.3s ease;
  `;
  
  toast.innerHTML = `
    <i class="bi bi-${icons[type]}" style="font-size: 1.25rem;"></i>
    <span style="flex: 1;">${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// PAGE NAVIGATION
// ============================================
function parsePageHash() {
  const raw = window.location.hash.replace("#", "");
  if (!raw) return { pageId: "", topicIndex: undefined };
  const [pageId, query] = raw.split("?");
  let topicIndex;
  if (query) {
    const params = new URLSearchParams(query);
    const t = params.get("topic");
    if (t !== null) topicIndex = Number(t);
  }
  return { pageId, topicIndex };
}

function updateHash(pageId, topicIndex) {
  const base = `#${pageId}`;
  const withTopic = typeof topicIndex === "number" ? `${base}?topic=${topicIndex}` : base;
  if (window.location.hash !== withTopic) {
    window.location.hash = withTopic;
  }
}

function showPage(pageId, topicIndex) {
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add("active");
  }
  
  // Update active nav link
  document.querySelectorAll(".navbar .nav-link").forEach(link => {
    link.classList.remove("active");
    link.removeAttribute("aria-current");
    
    const href = link.getAttribute("href");
    if (href === `#${pageId}`) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
  
  // Load dynamic content
  const src = target?.getAttribute("data-src");
  const contentContainer = target?.querySelector(".dynamic-content");
  if (src && contentContainer && contentContainer.childElementCount === 0) {
    contentContainer.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading content...</p>
    </div>`;
    
    fetch(src)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then(html => {
        contentContainer.innerHTML = html;
        setTimeout(() => {
          initializeSectionTopic(pageId, topicIndex);
        }, 200);
      })
      .catch(error => {
        console.error("Content load failed:", error);
        contentContainer.innerHTML = `
        <div class="alert alert-danger">
          <h5><i class="bi bi-exclamation-triangle"></i>Failed to load content</h5>
          <p>Please check your connection and try again.</p>
          <button class="btn btn-primary" onclick="location.reload()">Refresh Page</button>
        </div>`;
      });
  } else {
    initializeSectionTopic(pageId, topicIndex);
    setTimeout(() => {
    }, 100);
  }
  
  updateHash(pageId, topicIndex);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateToPath(sectionId) { showPage(sectionId); }
function navigateToLanguage(sectionId) { showPage(sectionId); }
function navigateToTech(sectionId) { showPage(sectionId); }

// ============================================
// TOPIC NAVIGATION
// ============================================
function getLanguageTopicContainers(langSectionId) {
  const section = document.getElementById(langSectionId);
  return section ? Array.from(section.querySelectorAll(".language-topic")) : [];
}

function setActiveLanguageTopic(langSectionId, newIndex) {
  const topics = getLanguageTopicContainers(langSectionId);
  if (newIndex < 0 || newIndex >= topics.length) return;
  
  topics.forEach(t => t.classList.remove("active"));
  topics[newIndex].classList.add("active");
  
  const sidebar = document.getElementById(`${langSectionId}-topics`);
  if (sidebar) {
    const buttons = Array.from(sidebar.querySelectorAll(".list-group-item"));
    buttons.forEach(b => b.classList.remove("active"));
    if (buttons[newIndex]) buttons[newIndex].classList.add("active");
  }
}


function showLanguageTopic(langSectionId, index) {
  setActiveLanguageTopic(langSectionId, index);
  try {
    sessionStorage.setItem(`sectionTopic:${langSectionId}`, String(index));
  } catch {}
  updateHash(langSectionId, index);
}

function nextLanguageTopic(langSectionId) {
  const topics = getLanguageTopicContainers(langSectionId);
  const activeIndex = topics.findIndex(t => t.classList.contains("active"));
  const nextIndex = Math.min(activeIndex + 1, topics.length - 1);
  showLanguageTopic(langSectionId, nextIndex);
}

function prevLanguageTopic(langSectionId) {
  const topics = getLanguageTopicContainers(langSectionId);
  const activeIndex = topics.findIndex(t => t.classList.contains("active"));
  const prevIndex = Math.max(activeIndex - 1, 0);
  showLanguageTopic(langSectionId, prevIndex);
}

function initializeSectionTopic(pageId, explicitIndex) {
  const topics = getLanguageTopicContainers(pageId);
  if (topics.length === 0) return;
  
  let index = typeof explicitIndex === "number" ? explicitIndex : undefined;
  if (typeof index !== "number" || isNaN(index)) {
    try {
      const stored = sessionStorage.getItem(`sectionTopic:${pageId}`);
      if (stored !== null) index = Number(stored);
    } catch {}
  }
  if (typeof index !== "number" || isNaN(index)) index = 0;
  index = Math.max(0, Math.min(index, topics.length - 1));
  setActiveLanguageTopic(pageId, index);
}

function toggleTopics(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  const sidebar = section.querySelector(".topics-sidebar-collapsible");
  if (sidebar) sidebar.classList.toggle("show");
}

// ============================================
// THEME MANAGEMENT
// ============================================
function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.setAttribute("data-theme", savedTheme);
  const icon = document.getElementById("theme-icon");
  if (icon) {
    icon.className = savedTheme === "light" ? "bi bi-moon-fill" : "bi bi-sun-fill";
  }
}

function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  body.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  
  const icon = document.getElementById("theme-icon");
  if (icon) {
    icon.className = newTheme === "light" ? "bi bi-moon-fill" : "bi bi-sun-fill";
  }
}


// ============================================
// ANIMATIONS
// ============================================
function animateCounter(element, target) {
  if (!element) return;
  let current = 0;
  const increment = target / 100;
  const suffix = element.textContent.includes("+") ? "+" : element.textContent.includes("%") ? "%" : "";
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current) + suffix;
  }, 20);
}

function initializeAnimations() {
  const observerOptions = { threshold: 0.5 };
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statNumbers = entry.target.querySelectorAll(".stat-number");
        statNumbers.forEach(num => {
          const text = num.textContent;
          const value = parseInt(text.replace(/\D/g, ""));
          if (value && !num.dataset.animated) {
            num.dataset.animated = "true";
            animateCounter(num, value);
          }
        });
        counterObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  const statsSection = document.querySelector(".stats-section");
  if (statsSection) {
    counterObserver.observe(statsSection);
  }
}


// ============================================
// WINDOW EVENT HANDLERS
// ============================================
window.addEventListener("hashchange", () => {
  const { pageId, topicIndex } = parsePageHash();
  if (pageId) {
    showPage(pageId, topicIndex);
  }
});

// ============================================
// EXPOSE GLOBAL FUNCTIONS
// ============================================
window.showLanguageTopic = showLanguageTopic;
window.nextLanguageTopic = nextLanguageTopic;
window.prevLanguageTopic = prevLanguageTopic;
window.toggleTopics = toggleTopics;
window.toggleTheme = toggleTheme;
window.showPage = showPage;
window.navigateToPath = navigateToPath;
window.navigateToLanguage = navigateToLanguage;
window.navigateToTech = navigateToTech;
window.logout = logout;

console.log('All functions loaded successfully');