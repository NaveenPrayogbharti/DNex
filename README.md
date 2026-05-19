# DNex Site — Project Structure

This project is split into two independent packages:

```
DNex_site/
├── frontend/          ← Vite + React + TypeScript (client-side app)
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── .env           ← Frontend secrets (VITE_* vars) — not committed
│   └── .env.example   ← Template — copy to .env and fill in values
│
├── backend/           ← Express + Nodemailer (email API server)
│   ├── server/
│   │   └── mailer.js
│   ├── package.json
│   ├── .env           ← Backend secrets (SMTP credentials) — not committed
│   └── .env.example   ← Template — copy to .env and fill in values
│
├── .gitignore         ← Ignores both .env files and node_modules
└── package.json       ← Root workspace scripts
```

---

## Quick Start

### Frontend
```bash
cd frontend
npm install
cp .env.example .env    # then fill in your values
npm run dev             # starts Vite dev server on http://localhost:5173
```

### Backend
```bash
cd backend
npm install
cp .env.example .env    # then fill in your SMTP credentials
npm run dev             # starts mailer API on http://localhost:3001
```

### Both from root (npm workspaces)
```bash
npm run dev:frontend
npm run dev:backend
```

---

## Environment Variables

### `frontend/.env`
| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous (public) key |
| `VITE_MOCK_AUTH` | `true` to bypass auth in dev, `false` for real auth |
| `VITE_BACKEND_API_URL` | URL of the backend mailer service |

### `backend/.env`
| Variable | Description |
|---|---|
| `MAILER_PORT` | Port the Express server listens on (default: 3001) |
| `ALLOWED_ORIGIN` | CORS allowed origin (your frontend URL) |
| `MAIL_HOST` | SMTP hostname (e.g. `mail.yourdomain.com`) |
| `MAIL_PORT` | SMTP port (587 for STARTTLS, 465 for SSL) |
| `MAIL_SECURE` | `true` for port 465, `false` for 587 |
| `MAIL_USER` | SMTP login email |
| `MAIL_PASS` | SMTP password |
| `MAIL_REPLY_TO` | Reply-to address (optional) |

> ⚠️ **Never commit `.env` files.** Both are listed in `.gitignore`.
> Use the `.env.example` templates as a safe reference.