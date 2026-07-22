const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

function runLoginScenario() {
  const html = `<!doctype html>
  <html>
    <body>
      <form id="loginForm">
        <input id="username" />
        <div id="loginFeedback"></div>
        <button type="submit">Log in</button>
      </form>
    </body>
  </html>`;

  const dom = new JSDOM(html, {
    url: 'http://localhost/login.html',
    runScripts: 'outside-only'
  });

  const { window } = dom;
  const script = fs.readFileSync(path.join(__dirname, '..', 'assets', 'auth.js'), 'utf8');

  const storage = {};
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem(key) { return storage[key] ?? null; },
      setItem(key, value) { storage[key] = String(value); },
      removeItem(key) { delete storage[key]; },
      clear() { Object.keys(storage).forEach((key) => delete storage[key]); }
    }
  });

  let assignedUrl = null;
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      href: 'http://localhost/login.html',
      pathname: '/login.html',
      search: '',
      assign(url) {
        assignedUrl = url;
        this.href = url;
      },
      replace(url) {
        assignedUrl = url;
        this.href = url;
      }
    }
  });

  window.eval(script);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));

  window.document.getElementById('username').value = '12369';
  window.document.getElementById('loginForm').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

  return {
    savedMember: window.localStorage.getItem('alcwebMember'),
    redirect: assignedUrl
  };
}

const result = runLoginScenario();
assert.strictEqual(result.savedMember, '12369', 'Login should save the authenticated member on submit');
assert.strictEqual(result.redirect, 'http://localhost/profile.html', 'Login should redirect to the profile page after a successful sign-in');
console.log('auth login regression test passed');
