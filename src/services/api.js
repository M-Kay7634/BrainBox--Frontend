import axios from 'axios';

// const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});


export function setAuthToken(token) {
  if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete API.defaults.headers.common['Authorization'];
}

export const addScore = (payload) => API.post('/scores', payload);
export const submitScore = (payload) => {
  // server has /scores/secure
  return API.post('/scores/secure', payload);
};
export const getTop = (game) => API.get(`/scores/top${game ? ('?game=' + game) : ''}`);
export const getGlobalTop = (game) => API.get(`/scores/top${game ? ('?game=' + game) : ''}`);
export const getDailyTop = (game) => API.get(`/scores/top/daily${game ? ('?game=' + game) : ''}`);

export const signup = (payload) => API.post('/auth/signup', payload);
export const login = (payload) => API.post('/auth/login', payload);

export const getUserScores = () => API.get('/scores/user');
export const getAchievements = () => API.get('/achievements/me');
export const getProfileSummary = () => API.get("/profile/summary");
export const getProfileHistory = () => API.get("/profile/history");
export const getUserStreak = () => API.get("/profile/streak");

export default API;
