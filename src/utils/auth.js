import { setAuthToken } from '../services/api';
export function saveToken(token) {
  localStorage.setItem('iqplay_token', token);
  setAuthToken(token);
}
export function removeToken() {
  localStorage.removeItem('iqplay_token');
  setAuthToken(null);
}
export function getToken() {
  return localStorage.getItem('iqplay_token');
}
