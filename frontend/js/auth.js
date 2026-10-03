/**
 * RedPoint - Authentication Manager
 * Handles user sessions, role checks, and redirects.
 */

const TOKEN_KEY = 'redpoint_token';
const USER_KEY = 'redpoint_user';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

function saveAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function logout() {
  clearAuth();
  window.location.href = '/login.html';
}

function requireAuth(expectedRole = null) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    clearAuth();
    window.location.href = '/login.html';
    return false;
  }

  if (expectedRole && user.role !== expectedRole) {
    if (user.role === 'ADMIN') {
      window.location.href = '/admin/dashboard.html';
    } else {
      window.location.href = '/participant/dashboard.html';
    }
    return false;
  }

  return user;
}

function redirectIfLoggedIn() {
  const token = getToken();
  const user = getUser();

  if (token && user) {
    if (user.role === 'ADMIN') {
      window.location.href = '/admin/dashboard.html';
    } else {
      window.location.href = '/participant/dashboard.html';
    }
    return true;
  }
  return false;
}

window.RedPointAuth = {
  getToken,
  getUser,
  saveAuth,
  clearAuth,
  logout,
  requireAuth,
  redirectIfLoggedIn
};
