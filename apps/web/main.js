import './style.css';
import './src/toast.js';
import { getToken, getUserRole, logout } from './src/api.js';
import { renderAuth } from './src/views/auth.js';
import { renderCustomer } from './src/views/customer.js';
import { renderAdmin } from './src/views/admin.js';
import { renderAbout } from './src/views/about.js';
import { renderEvents } from './src/views/events.js';
import { renderGallery } from './src/views/gallery.js';
import { renderContact } from './src/views/contact.js';
import { initChatbot } from './src/views/chatbot.js';

const app = document.querySelector('#app');

function renderEventoraNavbar() {
  const token = getToken();
  const role = getUserRole();
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  
  let actionHtml = '';
  if (token) {
    actionHtml = `
      <div class="nav-actions">
        <span class="role-badge">${role}</span>
        <button class="btn secondary small" id="logout-btn">Logout</button>
      </div>
    `;
  } else {
    actionHtml = `
      <div class="nav-actions">
        <a href="#auth" class="btn primary small">Make an Appointment</a>
      </div>
    `;
  }

  nav.innerHTML = `
    <div class="nav-brand" style="cursor: pointer;">Eventora</div>
    <div class="nav-links">
      <a href="#home">Home</a>
      <a href="#about">About</a>
      <a href="#events">Events</a>
      <a href="#gallery">Gallery</a>
      <a href="#contact">Contact</a>
    </div>
    ${actionHtml}
  `;
  app.appendChild(nav);
  
  nav.querySelector('.nav-brand').onclick = () => window.location.hash = '#home';

  if (token) {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.onclick = logout;
  }
}

function renderLanding() {
  const hero = document.createElement('div');
  hero.className = 'hero-wrapper animate-fade-in';
  hero.innerHTML = `
    <h1>MAKE YOUR WEDDING <br> MEMORABLE</h1>
    <p>We make your wedding best memorable for life time.</p>
    <a href="#auth" class="btn primary pulse" id="hero-btn">Make an Appointment</a>
  `;
  app.appendChild(hero);
}

function handleRoute() {
  const hash = window.location.hash || '#home';
  const token = getToken();
  const role = getUserRole();

  app.innerHTML = ''; // Clear app
  
  // Dashboard override: If user is logged in and tries to go home/auth, redirect to dashboard or show nav
  if (token && (hash === '#home' || hash === '#auth')) {
    renderEventoraNavbar();
    const mainContent = document.createElement('div');
    mainContent.className = 'container main-content';
    app.appendChild(mainContent);
    if (role === 'ADMIN') renderAdmin(mainContent);
    else renderCustomer(mainContent);
    return;
  }

  // Regular routes
  if (hash === '#auth') {
    renderEventoraNavbar();
    const authContainer = document.createElement('div');
    app.appendChild(authContainer);
    renderAuth(authContainer);
    return;
  }

  renderEventoraNavbar();
  const mainContent = document.createElement('div');
  mainContent.className = 'container main-content';
  app.appendChild(mainContent);

  // Highlight active link
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === hash) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  switch (hash) {
    case '#home':
      renderLanding();
      break;
    case '#about':
      renderAbout(mainContent);
      break;
    case '#events':
      renderEvents(mainContent);
      break;
    case '#gallery':
      renderGallery(mainContent);
      break;
    case '#contact':
      renderContact(mainContent);
      break;
    default:
      renderLanding();
  }
}

// Initial render and routing
window.addEventListener('hashchange', handleRoute);
handleRoute();

// Initialize chatbot for customer view
if (getToken() && getUserRole() === 'CUSTOMER') {
  initChatbot();
}
