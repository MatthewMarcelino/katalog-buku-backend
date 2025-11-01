// src/utils/auth.js
export const isLoggedIn = () => !!localStorage.getItem("token");
export const getRole = () => localStorage.getItem("role") || null;
export const logoutLocal = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};
