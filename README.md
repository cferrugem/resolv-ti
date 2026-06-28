# ResolvTI 🚀

> **IT support ticket management portal (Helpdesk / Servicedesk)**

**ResolvTI** is a full-stack web application for opening, tracking, and resolving technical support tickets. It centralizes communication between customers and the support team, organizes the workflow by status and priority, and provides a metrics dashboard for the support staff.

> 📚 Built as a portfolio/study project. See [DOCUMENTACAO.md](DOCUMENTACAO.md) for deeper technical details.

---

## ✨ Features

- **Role-based authentication:** the interface adapts depending on whether the logged-in user is a **Customer** or a **Staff** technician.
- **Full ticket management:** creation, status changes (Open, In Progress, Closed), priority levels (High, Medium, Low), and categorization (Hardware, Software, Network, etc.).
- **Per-ticket comments:** communication history recorded inside each ticket.
- **Metrics dashboard (Chart.js):** ticket creation trends, average response time, performance per technician, and most frequent categories.
- **Responsive interface:** mobile-first design with dark mode support, built with Tailwind CSS.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **React 19** — SPA interface
- **React Router 7** — client-side routing
- **Tailwind CSS** — responsive styling
- **TanStack Query** — async state management and caching
- **Chart.js / react-chartjs-2** — dashboard charts
- **Framer Motion** — animations

### Backend (`/server`)
- **Node.js + Express 5** — RESTful API
- **TypeScript** (run via `tsx`)
- **Prisma ORM 5** with the **LibSQL** adapter — data modeling and access
- **Zod** — schema validation
- **Supabase JS** — auxiliary data/auth client

### Database & Infrastructure
- **Turso (LibSQL)** — distributed (edge) SQLite database in production
- **Local SQLite** — for development
- **Render** — hosting for the API (web service) and the frontend (static site), see [`render.yaml`](render.yaml)

> 💡 The backend ships with a **mock mode** (`USE_MOCK_DB` / `REACT_APP_USE_MOCK`) that lets you run the app without a real database configured — handy for quick tests and demos.

---

## 📁 Project Structure

```
resolv-ti/
├── client/              # React frontend
│   └── src/
│       ├── components/  # UI components
│       ├── hooks/       # Custom hooks (useTickets, useDebounce)
│       └── pages/       # Screens (Dashboard, MyTickets, TicketList, ...)
├── server/              # Express + TypeScript backend
│   ├── routes/          # Routes (tickets, comments) + mock variants
│   ├── middleware/      # auth, ownership
│   ├── schemas/         # Zod schemas
│   └── prisma/          # schema.prisma
└── render.yaml          # Infrastructure as code (Render)
```

---

## 🚀 Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- [Git](https://git-scm.com/)

### 1. Clone and install dependencies
```bash
git clone https://github.com/cferrugem/resolv-ti.git
cd resolv-ti

# Backend
cd server
npm install

# Frontend (in another terminal)
cd ../client
npm install --legacy-peer-deps
```

### 2. Configure environment variables
Each part ships a `.env.example` file as a reference. Copy and fill it in:

```bash
# Backend
cp server/.env.example server/.env

# Frontend
cp client/.env.example client/.env.local
```

To get started **without configuring external services**, just keep mock mode enabled:
- `server/.env` → `USE_MOCK_DB=true`
- `client/.env.local` → `REACT_APP_USE_MOCK=true`

### 3. (Optional) Initialize the local database
Skippable if you're using mock mode. From the `server/` folder:
```bash
npx prisma db push   # create the tables in the local SQLite file
npx tsx seed.ts      # seed with sample data
```

> **Login tip (after seeding):** `staff@resolv.com` (Staff) or `joao@empresa.com` (Customer), password `senha123`.

### 4. Start the application
```bash
# Terminal 1 — API
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm start
```

The app will be available at **http://localhost:3000** and the API at **http://localhost:5000**.

---

## 🔒 Security

This project was conceived for **portfolio and study** purposes. Before any production use, note that:

- Demo passwords are **not hashed** — implement **bcrypt** (or similar).
- The data layer acts as a proxy **without Row Level Security** — configure RLS and/or **JWT** authentication with validation in the Express routes.
- **Never** commit secrets. Sensitive variables live in `.env` / `.env.local` (already covered by `.gitignore`); use only the `.env.example` files as a public reference.

---

## 👥 Authors

- Cleiton Ferrugem
- Lucas Gades

---

## 📄 License

Distributed under the ISC License. See [LICENSE](LICENSE) for details.
