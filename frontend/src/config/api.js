// Centralized API Base URL configuration
// In Vercel: set VITE_API_URL environment variable to your deployed backend URL (e.g. https://recipe-sharing-backend-xxx.vercel.app)
// If empty, requests are made relatively (useful for unified full-stack Vercel deployments).
export const API_URL = import.meta.env.VITE_API_URL || "";
