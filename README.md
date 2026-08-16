# Pine Frontend

Frontend web application for **Pine** – a private, calm personal journal & diary app built with React, TypeScript, Vite, Tailwind CSS, and TipTap.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18 or higher (v20+ recommended)
- **npm**: v9 or higher

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Edit `.env` to configure your backend API base URL:
```env
# Backend Base URL (leave empty for same-origin proxy during local dev)
VITE_BACKEND_URL=http://localhost:8080
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
The compiled static output will be generated in the `dist/` directory.

---

## 🌐 Deployment

### Deploying to Cloudflare Pages (Recommended)

1. Connect your repository to **Cloudflare Pages**.
2. Set the build configuration:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: `20` (in Environment Variables: `NODE_VERSION=20`)
3. Add your Production Environment Variables in Cloudflare Pages dashboard:
   - `VITE_BACKEND_URL`: `https://api.yourdomain.com`
4. *SPA Routing*: The `public/_redirects` file (`/* /index.html 200`) is already included to handle client-side routing.

---

### Deploying to Render (Static Site)

1. Create a new **Static Site** on [Render](https://render.com).
2. Connect your Git repository.
3. Configure the static site settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Add your Environment Variables:
   - `VITE_BACKEND_URL`: `https://api.yourdomain.com`
5. Configure Redirects / Rewrites in Render settings:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Editor**: [TipTap Editor](https://tiptap.dev/)
- **Icons**: [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

---

## 📜 Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local development server with HMR |
| `npm run build` | Type-checks with `tsc` and builds production bundle in `dist/` |
| `npm run preview` | Locally previews production build |
| `npm run lint` | Runs ESLint |
