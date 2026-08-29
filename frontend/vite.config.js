import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  preview: {
    allowedHosts: [
      "recipe-sharing-frontend-ie0c.onrender.com"
    ]
  }
});