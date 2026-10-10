// Centralized API base URL for production and local development.
// Set VITE_API_URL in Vercel to override this value when needed.
export const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://recipe-sharing-platform-pied.vercel.app"
).replace(/\/+$/, "");
