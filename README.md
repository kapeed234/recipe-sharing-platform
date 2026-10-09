# Recipe Sharing Platform

A full-stack recipe sharing platform built with Express.js, MongoDB (Mongoose), Cloudinary, and React (Vite).

## Project Structure

```
├── backend/
│   ├── api/index.js       # Vercel Serverless Function entrypoint
│   ├── config/            # Database and Cloudinary configurations
│   ├── controllers/       # Route controllers (Auth, Recipes, Reviews)
│   ├── middleware/        # JWT auth and Multer/Cloudinary upload middleware
│   ├── models/            # Mongoose schemas (User, Recipe, Review)
│   ├── routes/            # Express route endpoints
│   ├── server.js          # Express app definition
│   └── vercel.json        # Backend Vercel serverless configuration
├── frontend/
│   ├── src/               # React Vite source code
│   ├── vite.config.js     # Vite configuration
│   └── vercel.json        # Frontend SPA routing configuration
└── README.md
```

---

## Deploying to Vercel

### Step 1: Deploy the Backend
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository: `kapeed234/recipe-sharing-platform`.
4. In **Project Settings**:
   - Set **Project Name**: `recipe-sharing-backend` (or your choice).
   - Set **Root Directory**: Click "Edit" and choose `backend`.
5. Under **Environment Variables**, add the following:
   - `MONGO_URI`: `mongodb+srv://...` (your MongoDB connection string)
   - `JWT_SECRET`: (your JWT secret string)
   - `CLOUDINARY_CLOUD_NAME`: (your Cloudinary cloud name)
   - `CLOUDINARY_API_KEY`: (your Cloudinary API key)
   - `CLOUDINARY_API_SECRET`: (your Cloudinary API secret)
   - *(Optional SMTP)*: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`
6. Click **Deploy**.
7. Once deployed, copy your backend URL (e.g. `https://recipe-sharing-backend-kapeed.vercel.app`).

### Step 2: Deploy the Frontend
1. Back on [vercel.com](https://vercel.com), click **"Add New..."** -> **"Project"**.
2. Select the same repository: `kapeed234/recipe-sharing-platform`.
3. In **Project Settings**:
   - Set **Project Name**: `recipe-sharing-platform` (or your choice).
   - Set **Root Directory**: Click "Edit" and choose `frontend`.
   - Framework Preset should automatically detect **Vite**.
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: Paste the backend URL from Step 1 (e.g. `https://recipe-sharing-backend-kapeed.vercel.app` - without trailing slash).
5. Click **Deploy**.
6. Your application is live!
