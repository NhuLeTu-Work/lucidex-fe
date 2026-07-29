// authFlag.ts (file mới, cùng cấp hoặc trong /utils, /lib)
import axios from "axios";

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

export function isCancelledError(error: any) {
  return axios.isCancel(error);
}