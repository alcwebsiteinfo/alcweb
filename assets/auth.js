const ALC_AUTH_KEY = 'alcwebMember';
const ALC_AUTH_EXPIRES_KEY = 'alcwebMemberExpires';
const ALC_SESSION_DURATION = 10 * 60 * 1000;
const ALC_AUTH_ENDPOINT = window.ALC_AUTH_ENDPOINT || '';
const ALC_MEMBERS = [
  {
    username: '12369',
    displayName: 'Raihan',
    role: 'IT Department President',
    photo: 'images/raihan.jpg',
    bio: 'Raihan oversees ALC technology operations, coordinates member systems, and ensures secure, reliable IT services for the community.',
    class: '2nd',
    status: 'level 0'
  },
  {
    username: '12399',
    displayName: 'Rabiya Alam',
    role: 'IT Department President',
    photo: 'WhatsApp Image 2026-06-05 at 12.18.44 AM.jpeg',
    bio: '',
    class: '',
    status: ''
  },
  {
    username: 'samiya',
    displayName: 'Samiya',
    role: 'Head Chef',
    photo: 'images/samiya.jpg.jpg',
    bio: 'Samiya leads ALC culinary events, plans menus, manages kitchen logistics, and creates memorable dining experiences for the community.',
    class: '',
    status: ''
  },
  {
    username: 'hridda',
    displayName: 'Hridda',
    role: 'Vice President, IT Dept. and President, Arts & Crafts Club',
    photo: 'images/hridda.jpg',
    bio: 'Hridda supports ALC technology leadership as IT vice president, leads the Arts & Crafts club, and documents community life through photography.',
    class: '',
    status: ''
  }
];
const LOGIN_PAGE = 'index.html';

function getSavedMember() {
  const member = localStorage.getItem(ALC_AUTH_KEY);
  const expiresAt = Number(localStorage.getItem(ALC_AUTH_EXPIRES_KEY));
  if (!member || !expiresAt || Date.now() >= expiresAt) {
    clearAuth();
    return null;
  }
  return member;
}

function isAuthenticated() {
  return Boolean(getSavedMember());
}

function saveMember(username) {
  localStorage.setItem(ALC_AUTH_KEY, username);
  localStorage.setItem(ALC_AUTH_EXPIRES_KEY, String(Date.now() + ALC_SESSION_DURATION));
}

function clearAuth() {
  localStorage.removeItem(ALC_AUTH_KEY);
  localStorage.removeItem(ALC_AUTH_EXPIRES_KEY);
}

function findMember(identifier) {
  if (!identifier) return null;
  const q = String(identifier).trim();
  // exact username match
  let member = ALC_MEMBERS.find((m) => m.username === q);
  if (member) return member;
  // exact displayName match (case-insensitive)
  member = ALC_MEMBERS.find((m) => m.displayName && m.displayName.toLowerCase() === q.toLowerCase());
  if (member) return member;
  // partial displayName match (e.g., first name)
  member = ALC_MEMBERS.find((m) => m.displayName && m.displayName.toLowerCase().includes(q.toLowerCase()));
  return member || null;
}

function getCurrentMember() {
  const username = getSavedMember();
  return username ? findMember(username) : null;
}

function redirectToLogin() {
  const target = window.location.pathname.replace(/^.*\//, '') || 'index.html';
  if (target === LOGIN_PAGE || target === 'login.html') return;
  const query = `?redirect=${encodeURIComponent(target)}`;
  window.location.replace(LOGIN_PAGE + query);
}

function requireAuth() {
  const currentPage = window.location.pathname.replace(/^.*\//, '');
  if (currentPage === LOGIN_PAGE || currentPage === 'login.html') return;
  if (!isAuthenticated()) {
    redirectToLogin();
  }
}

// Immediate protection: run as soon as the script is parsed to avoid a visible bypass
;(function immediateCheck() {
  try {
    const currentPage = (typeof window !== 'undefined') ? window.location.pathname.replace(/^.*\//, '') : '';
    if (currentPage && currentPage !== LOGIN_PAGE && currentPage !== 'login.html') {
      if (!isAuthenticated()) {
        redirectToLogin();
      }
    }
  } catch (e) {
    // silent fallback
  }
})();

function updateAuthLink() {
  const authLink = document.getElementById('authLink');
  if (!authLink) return;
  authLink.textContent = 'Profile';
  authLink.href = 'profile.html';
}

function initializeLogout() {
  const logoutButton = document.getElementById('logoutButton');
  if (!logoutButton) return;
  logoutButton.addEventListener('click', () => {
    clearAuth();
    window.location.assign(LOGIN_PAGE);
  });
}

function initializeSessionExpiry() {
  if (!isAuthenticated()) return;
  const expiresAt = Number(localStorage.getItem(ALC_AUTH_EXPIRES_KEY));
  const remaining = expiresAt - Date.now();
  window.setTimeout(() => {
    clearAuth();
    window.location.assign(LOGIN_PAGE);
  }, Math.max(0, remaining));
}

function updateActiveNavLink() {
  const currentPage = window.location.pathname.replace(/^.*\//, '') || 'index.html';
  document.querySelectorAll('.navbar-nav .nav-link').forEach((link) => {
    const href = link.getAttribute('href')?.replace(/^.*\//, '') || '';
    if (href === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

async function verifyMember(identifier) {
  if (!ALC_AUTH_ENDPOINT) {
    throw new Error('Login service is not configured.');
  }

  const response = await fetch(`${ALC_AUTH_ENDPOINT}?memberID=${encodeURIComponent(identifier)}`);
  if (!response.ok) throw new Error('Login service request failed.');

  const result = await response.json();
  return result.authenticated === true && result.memberID === identifier;
}

async function handleLoginForm(event) {
  event.preventDefault();
  const username = document.getElementById('username')?.value?.trim();
  const feedback = document.getElementById('loginFeedback');
  const submitButton = event.target.querySelector('button[type="submit"]');

  if (!username) {
    if (feedback) feedback.textContent = 'Please enter your member ID.';
    return;
  }

  if (submitButton) submitButton.disabled = true;
  if (feedback) feedback.textContent = '';

  try {
    const isApproved = await verifyMember(username);
    if (isApproved) {
      saveMember(username);
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect') || 'home.html';
      const redirectTarget = redirect.startsWith('http') ? redirect : new URL(redirect, window.location.href).toString();
      try {
        window.location.assign(redirectTarget);
      } catch (error) {
        window.location.href = redirectTarget;
      }
      return;
    }

    if (feedback) feedback.textContent = 'Invalid member ID. Please try again.';
  } catch (error) {
    if (feedback) feedback.textContent = error.message;
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

function initializeAuth() {
  const currentPage = window.location.pathname.replace(/^.*\//, '') || 'index.html';
  if (currentPage !== LOGIN_PAGE && currentPage !== 'login.html') {
    requireAuth();
  }
  updateAuthLink();
  updateActiveNavLink();
  initializeLogout();
  initializeSessionExpiry();
  if (currentPage === LOGIN_PAGE || currentPage === 'login.html') {
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', handleLoginForm);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAuth, { once: true });
} else {
  initializeAuth();
}
