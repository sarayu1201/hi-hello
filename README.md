# KR Academy - Deployment Instructions

This repository is split into two independent folders for clean cloud deployment:
1. `frontend/` - React Vite Client (Deploy on Render)
2. `backend/` - Node Express API Server with Python Ingestion Engine (Deploy on Railway)

---

## 1. Frontend Deployment (Render)

Deploy `frontend` as a **Static Site** on Render:

- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - Add `VITE_API_URL` pointing to your Railway backend URL (e.g. `https://your-backend-url.railway.app`).

---

## 2. Backend Deployment (Railway)

Deploy `backend` as a **Node Service** on Railway:

- **Root Directory**: `backend`
- **Build Command**: Railway will automatically run `npm install` for Node packages.
- **Start Command**: `npm start` (defined as `node server.js`).
- **Environment Variables (Railway variables config)**:
  - Add `MONGODB_URI` (your cloud MongoDB Atlas connection URI).
  - Add `PORT` (usually `5000` or let Railway assign it dynamically).
  - Add `ALLOWED_ORIGINS` pointing to your Render frontend URL (e.g. `https://your-frontend-url.onrender.com`).
  - Add `PARSER_ENGINE` = `auto`.
  - Add `NODE_ENV` = `production`.
  - Add `BREVO_API_KEY` (your official Brevo API key, starting with `xkeysib-`).
  - Add `EMAIL_FROM` (your verified sender email in Brevo, e.g., `allampallisarayu64@gmail.com`).
  - Add `EMAIL_FROM_NAME` (e.g., `KR Institute of Learning`).
  - *Note: All old SMTP environment variables (SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS) are deprecated and must be removed from Railway.*

---

## 3. Local Development

To run locally from this repository:

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   # Configure your .env file
   npm start
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
