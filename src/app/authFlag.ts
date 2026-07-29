let isLoggedOutGlobally = false;

export function markLoggedOut() {
  isLoggedOutGlobally = true;
}

export function markLoggedIn() {
  isLoggedOutGlobally = false;
}

export function getIsLoggedOutGlobally() {
  return isLoggedOutGlobally;
}