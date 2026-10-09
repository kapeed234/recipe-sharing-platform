// Centralized API Base URL configuration
// 1. If VITE_API_URL is configured (e.g. your Vercel backend URL), it will use that.
// 2. Otherwise, it falls back to the live Render backend so the app remains connected.
export const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://recipe-sharing-backend-cltn.onrender.com";

