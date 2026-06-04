const ALC_AUTH_KEY = 'alcwebMember';
const ALC_MEMBERS = [
  { username: '12369' },
  { username: 'samiya' },
  { username: 'hridda' }
];
const LOGIN_PAGE = 'login.html';

function getSavedMember() {
  return localStorage.getItem(ALC_AUTH_KEY);
}

function isAuthenticated() {
  return Boolean(getSavedMember());
}

function saveMember(username) {
  localStorage.setItem(ALC_AUTH_KEY, username);
}

function clearAuth() {
  localStorage.removeItem(ALC_AUTH_KEY);
}

function findMember(username) {
  return ALC_MEMBERS.some((member) => member.username === username);
}

function redirectToLogin() {
  const target = window.location.pathname.replace(/^.*\//, '') || 'index.html';
  if (target === LOGIN_PAGE) return;
  const query = `?redirect=${encodeURIComponent(target)}`;
  window.location.replace(LOGIN_PAGE + query);
}

function requireAuth() {
  const currentPage = window.location.pathname.replace(/^.*\//, '');
  if (currentPage === LOGIN_PAGE) return;
  if (!isAuthenticated()) {
    redirectToLogin();
  }
}

// Immediate protection: run as soon as the script is parsed to avoid a visible bypass
;(function immediateCheck() {
  try {
    const currentPage = (typeof window !== 'undefined') ? window.location.pathname.replace(/^.*\//, '') : '';
    if (currentPage && currentPage !== LOGIN_PAGE) {
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
  if (isAuthenticated()) {
    authLink.textContent = 'Log out';
    authLink.href = '#';
    authLink.addEventListener('click', (event) => {
      event.preventDefault();
      clearAuth();
      window.location.href = LOGIN_PAGE;
    });
  } else {
    authLink.textContent = 'Log in';
    authLink.href = LOGIN_PAGE;
  }
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

function handleLoginForm(event) {
  event.preventDefault();
  const username = document.getElementById('username')?.value?.trim();
  const feedback = document.getElementById('loginFeedback');

  if (!username) {
    if (feedback) feedback.textContent = 'Please enter your member ID.';
    return;
  }

  if (findMember(username)) {
    saveMember(username);
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect') || 'index.html';
    window.location.href = redirect;
    return;
  }

  if (feedback) {
    feedback.textContent = 'Invalid member ID. Please try again.';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.replace(/^.*\//, '');
  if (currentPage !== LOGIN_PAGE) {
    requireAuth();
  }
  updateAuthLink();
  updateActiveNavLink();
  if (currentPage === LOGIN_PAGE) {
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', handleLoginForm);
  }
});
