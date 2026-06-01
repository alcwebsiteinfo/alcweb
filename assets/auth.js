const ALC_AUTH_KEY = 'alcwebMember';
const ALC_MEMBERS = [
  { username: '12369', password: 'member123' },
  { username: 'samiya', password: 'member123' },
  { username: 'hridda', password: 'member123' }
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

function findMember(username, password) {
  return ALC_MEMBERS.some((member) => member.username === username && member.password === password);
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

function handleLoginForm(event) {
  event.preventDefault();
  const username = document.getElementById('username')?.value?.trim();
  const password = document.getElementById('password')?.value?.trim();
  const feedback = document.getElementById('loginFeedback');

  if (!username || !password) {
    if (feedback) feedback.textContent = 'Please enter both username and password.';
    return;
  }

  if (findMember(username, password)) {
    saveMember(username);
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect') || 'index.html';
    window.location.href = redirect;
    return;
  }

  if (feedback) {
    feedback.textContent = 'Invalid username or password. Please try again.';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.replace(/^.*\//, '');
  if (currentPage !== LOGIN_PAGE) {
    requireAuth();
  }
  updateAuthLink();
  if (currentPage === LOGIN_PAGE) {
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', handleLoginForm);
  }
});
