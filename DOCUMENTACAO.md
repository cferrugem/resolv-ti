# 📘 ResolvTI — Complete Technical Documentation

> **Version:** 1.0.0  
> **Authors:** Cleiton Ferrugem, Lucas Gades  
> **Stack:** React + Node.js/Express + Supabase (PostgreSQL)  
> **Last updated:** March 2026

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Folder Structure](#3-folder-structure)
4. [Setup and Installation](#4-setup-and-installation)
5. [Environment Variables](#5-environment-variables)
6. [Backend — Node.js Server](#6-backend--nodejs-server)
7. [Frontend — React Client](#7-frontend--react-client)
8. [Database — Supabase](#8-database--supabase)
9. [Authentication and Authorization](#9-authentication-and-authorization)
10. [Features by Role](#10-features-by-role)
11. [REST API — Endpoints](#11-rest-api--endpoints)
12. [Frontend Components](#12-frontend-components)
13. [Frontend Pages](#13-frontend-pages)
14. [Deploying with Render](#14-deploying-with-render)
15. [Known Issues and Future Improvements](#15-known-issues-and-future-improvements)

---

## 1. Project Overview

**ResolvTI** is a web platform for managing technical support tickets. The project was born from the real need to digitize and organize the IT support of the Procuradoria-Geral da Fazenda Nacional (4th Region), where support was handled entirely over the phone — with no record, traceability, or analysis.

### Problems ResolvTI solves

| Problem (Previous Scenario) | ResolvTI Solution |
|---|---|
| Phone-based tickets, no record | Ticket creation via web form |
| No status tracking | Real-time panel with the status of each ticket |
| No category or priority | Classification by category (10 types) and priority |
| No performance metrics | Dashboard with team charts and KPIs |
| Hard to assign an owner | Assignment of tickets to specific technicians |
| No communication history | Per-ticket comment system |

---

## 2. System Architecture

```
┌──────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                 │
│            React 19 + TailwindCSS + Chart.js         │
│      Routing: React Router DOM v7                    │
│      Auth Client: Supabase JS SDK                    │
└─────────────────────┬────────────────────────────────┘
                      │ HTTP (REST) — port 5000
                      │ (ticket and comment creation)
┌─────────────────────▼────────────────────────────────┐
│                   BACKEND (Server)                   │
│         Node.js + Express 5 (ES Modules)            │
│         Default port: 5000                           │
│         Routes:                                      │
│          - /api/tickets  (GET categories, POST, PUT)│
│          - /api/comments (POST)                      │
└──────────────────────┬───────────────────────────────┘
                       │ @supabase/supabase-js
┌──────────────────────▼───────────────────────────────┐
│               SUPABASE (BaaS)                        │
│  PostgreSQL: tickets, users, ticket_comments tables  │
│  Auth: Supabase Auth (JWT)                           │
│  RLS (Row Level Security): enabled per user          │
│  RPC Function: create_ticket_comment                 │
└──────────────────────────────────────────────────────┘
```

> **Note on direct connection:** In addition to calls through the backend, the frontend also accesses Supabase **directly** for reading tickets, listing tickets, the Dashboard, and comments (using the Supabase SDK in the browser with RLS). The backend is used mainly for **authenticated writes** of tickets and comments.

---

## 3. Folder Structure

```
resolv-ti-master/
├── client/                        # React frontend
│   ├── public/
│   │   └── logo.png               # Application logo
│   ├── src/
│   │   ├── components/            # Reusable components
│   │   │   ├── Card.js            # Generic card
│   │   │   ├── CreateTicket.js    # Ticket creation form
│   │   │   ├── LoadingSpinner.js  # Loading spinner
│   │   │   ├── Login.js           # Login form
│   │   │   ├── NavBar.js          # Navigation bar
│   │   │   ├── PageContainer.js   # Page layout wrapper
│   │   │   ├── PageHeader.js      # Section header
│   │   │   ├── Register.js        # Sign-up form
│   │   │   ├── RequireAuth.js     # Authenticated route guard
│   │   │   ├── StatusBadge.js     # Colored status badge
│   │   │   └── TicketItem.js      # Ticket item in the list
│   │   ├── pages/                 # Main pages
│   │   │   ├── Dashboard.js       # KPI panel (staff only)
│   │   │   ├── MyTickets.js       # My tickets (customer only)
│   │   │   ├── TicketDetails.js   # Details of a ticket
│   │   │   └── TicketList.js      # List of all tickets (staff)
│   │   ├── App.js                 # Route configuration
│   │   ├── AuthContext.js         # Global authentication context
│   │   ├── index.js               # React entry point
│   │   ├── index.css              # Global styles (TailwindCSS input)
│   │   ├── output.css             # Compiled CSS (TailwindCSS output)
│   │   └── supabase.js            # Supabase client initialization
│   ├── .env.local                 # Client environment variables (not committed)
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                        # Express backend
│   ├── routes/
│   │   ├── tickets.js             # Ticket routes
│   │   └── comments.js            # Comment routes
│   ├── app.js                     # Server entry point
│   ├── .env                       # Server environment variables (not committed)
│   └── package.json
│
├── render.yaml                    # Deploy configuration (Render.com)
├── README.md                      # Project executive summary
├── DOCUMENTACAO.md                # ← This file
└── .gitignore
```

---

## 4. Setup and Installation

### Prerequisites

- Node.js **18+** (recommended) or 14+
- npm 8+
- A [Supabase](https://supabase.com) account with a created project
- Git

### Step by step (local development)

#### 1. Clone the repository

```bash
git clone https://github.com/cferrugem/resolv-.git
cd resolv-ti-master
```

#### 2. Configure the server (backend)

```bash
cd server
npm install
```

Create the `.env` file in the `server/` folder (see the [Environment Variables](#5-environment-variables) section):

```bash
# server/.env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
PORT=5000
```

```bash
# Start the server in development mode (with hot-reload)
npm run dev

# Or in production
npm start
```

The server will be available at `http://localhost:5000`.

#### 3. Configure the client (frontend)

```bash
cd ../client
npm install
```

Create the `.env.local` file in the `client/` folder:

```bash
# client/.env.local
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
REACT_APP_API_URL=http://localhost:5000
```

```bash
# Start the React client + CSS compilation in parallel
npm run dev

# Or just React without CSS watch
npm start
```

The frontend will be at `http://localhost:3000`.

---

## 5. Environment Variables

### Server (`server/.env`)

| Variable | Description | Required |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL | ✅ Yes |
| `SUPABASE_ANON_KEY` | Supabase public anon key | ✅ Yes |
| `PORT` | Express server port | No (default: 5000) |

### Client (`client/.env.local`)

| Variable | Description | Required |
|---|---|---|
| `REACT_APP_SUPABASE_URL` | Supabase project URL | ✅ Yes |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase public anon key | ✅ Yes |
| `REACT_APP_API_URL` | Backend base URL (e.g. `http://localhost:5000`) | No (currently hardcoded) |

> ⚠️ **Warning:** The `.env` and `.env.local` files are in `.gitignore` and **must never be committed**. Never use the `service_role` key in the frontend.

---

## 6. Backend — Node.js Server

### Configuration (`server/app.js`)

The server uses **Express 5** with ES modules (`"type": "module"`). The main settings are:

- **CORS** enabled for all origins (in production, this should be restricted)
- **JSON body parsing** via `express.json()`
- **Global error middleware** that catches unhandled exceptions and returns HTTP 500
- Port configurable via the `PORT` env (default: 5000)

### Available routes

| Method | Route | File | Authentication |
|---|---|---|---|
| GET | `/api/tickets/categories` | `routes/tickets.js` | No |
| POST | `/api/tickets` | `routes/tickets.js` | JWT Bearer |
| PUT | `/api/tickets/:id` | `routes/tickets.js` | JWT Bearer (staff only) |
| POST | `/api/comments` | `routes/comments.js` | JWT Bearer |

### Backend authentication pattern

All protected routes extract the JWT token from the `Authorization: Bearer <token>` header. The token is obtained via `supabase.auth.getSession()` on the client and sent in the header.

The backend validates the token by creating a **new Supabase client** with the user's token, ensuring the database data is filtered by RLS:

```js
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { Authorization: `Bearer ${token}` } }
});
const { data: { user } } = await supabase.auth.getUser();
```

---

## 7. Frontend — React Client

### Routing Configuration (`src/App.js`)

Routing uses **React Router DOM v7** with role-based protection:

| Route | Component | Access |
|---|---|---|
| `/login` | `Login` | Public |
| `/register` | `Register` | Public |
| `/dashboard` | `Dashboard` | `staff` |
| `/tickets` | `TicketList` | `staff` |
| `/my-tickets` | `MyTickets` | `customer` |
| `/create-ticket` | `CreateTicket` | `customer` |
| `/ticket/:id` | `TicketDetails` | Authenticated |
| `/unauthorized` | `Unauthorized` | Everyone |
| `*` | Redirect to `/` | — |

#### `RequireAuth` component

Protects routes based on the user's authentication state and role. Redirects to `/login` if not authenticated, or to `/unauthorized` if the role does not match.

#### `PublicRoute` component

Redirects already-authenticated users to their correct home page (`/dashboard` for staff, `/my-tickets` for customers), preventing them from accessing login/register again.

### Main libraries used

| Library | Version | Purpose |
|---|---|---|
| `react` | 19.x | UI Framework |
| `react-router-dom` | 7.x | SPA routing |
| `@supabase/supabase-js` | 2.49.x | Communication with Supabase |
| `chart.js` + `react-chartjs-2` | 4.x / 5.x | Dashboard charts |
| `framer-motion` | 12.x | Animations |
| `react-icons` | 5.x | Icons |
| `date-fns` | 4.x | Date formatting |
| `tailwindcss` | 3.x | Utility-first CSS styling |
| `@tailwindcss/forms` | 0.5.x | Form styling |

---

## 8. Database — Supabase

### Tables

#### `users`
User profile table (complements Supabase Auth's `auth.users`).

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` (PK, FK → auth.users) | User ID |
| `email` | `text` | User email |
| `role` | `text` | Role: `'customer'` or `'staff'` |

#### `tickets`
Main support ticket table.

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` (PK) | Ticket ID |
| `title` | `text` | Ticket title |
| `description` | `text` | Detailed description |
| `status` | `text` | `'open'`, `'in progress'`, `'closed'` |
| `priority` | `text` | `'low'`, `'medium'`, `'high'` |
| `category` | `text` | Problem category (see below) |
| `user_id` | `uuid` (FK → users) | User who opened it |
| `assigned_to` | `uuid` (FK → users, nullable) | Responsible technician |
| `created_at` | `timestamptz` | Creation date |
| `updated_at` | `timestamptz` | Last update |

#### `ticket_comments`
Comments on tickets.

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` (PK) | Comment ID |
| `ticket_id` | `uuid` (FK → tickets) | Related ticket |
| `user_id` | `uuid` (FK → users) | Comment author |
| `comment` | `text` | Comment text |
| `created_at` | `timestamptz` | Creation date |

### Ticket categories

Categories are **predefined on the server** (route `GET /api/tickets/categories`) and are not stored in a separate database table:

| ID | Name | Description |
|---|---|---|
| `hardware` | Hardware | Issues with physical equipment |
| `software` | Software | Issues with programs and OSes |
| `rede` | Network/Internet | Connectivity and network issues |
| `email` | Email/Communication | Email and communication issues |
| `impressora` | Printers | Printer issues |
| `seguranca` | Security | Digital security matters |
| `acesso` | Access/Accounts | Password and permission issues |
| `sistemas` | Internal Systems | Company systems |
| `aplicacao` | Application Error | Errors in specific applications |
| `outro` | Other | Other issues not listed |

### Row Level Security (RLS)

Supabase RLS ensures that:
- **Customers** see only their own tickets
- **Staff** has access to all tickets
- Comments can only be created by authenticated users

### RPC Functions

#### `create_ticket_comment(p_ticket_id uuid, p_comment_text text)`

A function stored in Supabase for creating comments with authentication guaranteed by the session context. The frontend tries to use this function first; if it fails, it falls back to a direct `insert`.

---

## 9. Authentication and Authorization

### Authentication flow

```
1. User logs in → Supabase Auth → returns a session (JWT)
2. AuthContext.js reads the session → fetches the role from the `users` table
3. The role is stored in the global Context
4. RequireAuth uses the role to control route access
5. Backend operations send the JWT in the Authorization header
```

### `AuthContext.js`

Global provider that exposes:

| Value | Type | Description |
|---|---|---|
| `user` | `object \| null` | Supabase Auth user object |
| `role` | `'staff' \| 'customer' \| null` | User role |
| `isLoading` | `boolean` | Whether the auth check is still in progress |

**Lifecycle:**
- On mount: checks for an existing session via `supabase.auth.getSession()`
- Registers an `onAuthStateChange` listener to react to login/logout in real time
- On logout: sets `user` and `role` to `null`

---

## 10. Features by Role

### 👤 Customer (`customer`)

| Feature | Description |
|---|---|
| **Register** | Create an account with email/password |
| **Login** | Authentication via Supabase Auth |
| **Open ticket** | Form with title, description, priority, and category |
| **View my tickets** | List filtered to only their own tickets |
| **Filter tickets** | By status, with text search and sorting |
| **View details** | View all information of one of their tickets |
| **Comment** | Add comments on their ticket |

### 🔧 Support/Staff (`staff`)

All customer features, plus:

| Feature | Description |
|---|---|
| **Dashboard** | Panel with KPIs, charts, and performance metrics |
| **View all tickets** | Complete list of all tickets in the system |
| **Advanced filters** | Status, priority, assignment, category, search, sorting |
| **Assign tickets** | Set the technician responsible for a ticket |
| **Update status** | Move a ticket through open → in progress → closed |
| **Delete tickets** | Permanently remove a ticket and its comments |
| **View metrics** | Trends, top users, performance per technician |

---

## 11. REST API — Endpoints

### `GET /api/tickets/categories`

Returns the list of categories available for ticket classification.

**Authentication:** Not required

**Response (200):**
```json
[
  { "id": "hardware", "name": "Hardware", "description": "Issues with physical equipment" },
  { "id": "software", "name": "Software", "description": "Issues with programs and operating systems" },
  ...
]
```

---

### `POST /api/tickets`

Creates a new support ticket.

**Authentication:** JWT Bearer required

**Body:**
```json
{
  "title": "Computer won't turn on",
  "description": "When pressing the power button, nothing happens.",
  "priority": "high",
  "category": "hardware"
}
```

**Validations:**
- `title` and `description` are required
- `priority` must be `"low"`, `"medium"`, or `"high"` (default: `"medium"`)
- `category` default: `"outro"`

**Response (201):** The created ticket object

**Errors:**
- `401` — Missing or invalid token
- `400` — Missing required fields or invalid priority
- `500` — Internal error

---

### `PUT /api/tickets/:id`

Updates the status and/or owner of a ticket. **Staff only.**

**Authentication:** JWT Bearer required + `staff` role

**Parameters:** `:id` — Ticket UUID

**Body (optional fields):**
```json
{
  "status": "in progress",
  "assigned_to": "technician-uuid"
}
```

**Response (200):** The updated ticket object

**Errors:**
- `401` — Missing or invalid token
- `403` — User is not staff
- `400` — Missing ticket ID
- `404` — Ticket not found

---

### `POST /api/comments`

Adds a comment to a ticket.

**Authentication:** JWT Bearer required

**Body:**
```json
{
  "ticket_id": "ticket-uuid",
  "comment": "We checked and the problem is in the power supply."
}
```

**Validations:**
- `ticket_id` required and must be a valid UUID
- `comment` required and cannot be empty

**Response (201):** The created comment object

---

## 12. Frontend Components

### `NavBar.js`
Responsive navigation bar with role-contextual links:
- **Staff:** links to Dashboard and All Tickets
- **Customer:** links to My Tickets and Create Ticket
- Shows the user's email and a logout button

### `RequireAuth.js`
Route guard. Accepts an optional `role` prop for role restriction. While auth is loading, it shows a spinner. Redirects to `/login` or `/unauthorized` as appropriate.

### `CreateTicket.js`
Complete ticket creation form with:
- Category selection (fetched via `/api/tickets/categories`)
- Priority selection
- Client-side field validation
- Submission via `POST /api/tickets` with a JWT token

### `TicketItem.js`
Ticket list item component with:
- Colored status badge
- Priority badge
- For staff: list of available technicians for assignment
- For staff: status change dropdown
- Link to the ticket details

### `StatusBadge.js`
Status display badge with semantic colors:
- 🟡 Open (`open`)
- 🔵 In Progress (`in progress`)
- 🟢 Closed (`closed`)

### `PageContainer.js`
Layout wrapper that centers content with `max-w-7xl` and applies standard padding.

### `LoadingSpinner.js`
Reusable animated spinner for loading states.

---

## 13. Frontend Pages

### `Dashboard.js` (Staff)

Control panel with:

**KPIs (statistics cards):**
- Total tickets, Open, In Progress, Closed
- Urgent (high priority)
- Average Response Time (hours until the 1st comment)
- Most Frequent Category

**Charts (`chart.js`):**
- 📈 **Trends** (Line Chart): New tickets in the last 7 days
- 🍩 **Distribution by Status** (Doughnut Chart)
- 📊 **Distribution by Category** (Bar Chart)
- 📊 **Top 10 Users** (Bar Chart): who opens the most tickets
- 📊 **Team Performance** (Bar Chart): assigned vs. closed per technician

**Controls:**
- Period selector: Week / Month / Quarter

**Category table:** detailed ranking with percentage and progress bar.

### `TicketList.js` (Staff)

Complete list of all tickets with:
- Quick statistics cards (Total, Open, In Progress, Closed, Urgent, Unassigned)
- Combined filters: Status, Priority, Assignment, Category
- Text search (title, description, email)
- Sorting by: Newest, Oldest, Priority, Status
- "Clear Filters" button

### `MyTickets.js` (Customer)

List of the user's own tickets with:
- Status filter
- Sorting by date and priority
- Text search
- Link to create a new ticket when empty

### `TicketDetails.js` (Everyone)

Ticket details screen with:
- Title, status, priority with colored badges
- Abbreviated ticket ID
- Side information: submitted by, assigned to, dates, category
- Description section
- Comment history with avatar and role badge (Support/Customer)
- New comment form
- For staff: ticket deletion button

---

## 14. Deploying with Render

The `render.yaml` file configures two services on [Render.com](https://render.com):

### Backend API (`resolv-ti-api`)
- **Type:** Web Service (Node.js)
- **Root folder:** `server/`
- **Build:** `npm install`
- **Start:** `npm start`
- **Environment variables to configure on Render:**
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`

### Frontend (`resolv-ti-client`)
- **Type:** Static Site
- **Root folder:** `client/`
- **Build:** `npm install && npm run build`
- **Published folder:** `build/`
- **Rewrite:** all routes point to `/index.html` (SPA)
- **Environment variables to configure on Render:**
  - `REACT_APP_SUPABASE_URL`
  - `REACT_APP_SUPABASE_ANON_KEY`
  - `REACT_APP_API_URL` (URL of the deployed backend service)

### Deployment steps

1. Push the code to GitHub
2. Create an account on [Render.com](https://render.com)
3. In the Render Dashboard, click **"New → Blueprint"** and select the repository — the `render.yaml` will be detected automatically
4. Configure the environment variables marked as `sync: false` in the Render panel
5. After deploying, update `REACT_APP_API_URL` with the deployed backend URL and redeploy the frontend

---

## 15. Known Issues and Future Improvements

### 🐛 Known Issues

| Issue | Location | Description |
|---|---|---|
| Hardcoded backend URL | `Dashboard.js`, `TicketDetails.js`, `TicketList.js` | The `http://localhost:5000` URL is embedded in the code. In production, it should use `REACT_APP_API_URL`. |
| Open CORS | `server/app.js` | `cors()` with no configuration allows any origin. In production, it should be restricted to the frontend domain. |
| NavBar without mobile responsiveness | `NavBar.js` | The navigation menu disappears on small screens (`hidden sm:flex`) without a hamburger menu. |

### ✅ Improvements Already Implemented

| Improvement | Description |
|---|---|
| `MyTickets.js` translation | The whole UI was in English; it is now in Portuguese like the rest of the system. |
| Bug in `AuthContext.js` | On the `SIGNED_OUT` event, `role` was incorrectly set to `'customer'` instead of `null`, which could cause wrong redirects. |
| Dashboard with duplicated card | The "Main Category" card appeared twice and there was an empty grid. Both were removed. |
| `render.yaml` configured | The file was empty; it now has a complete deployment configuration. |
| `server/package.json` | Added a `dev` script with `nodemon` for hot-reload during development. |

### 🚀 Roadmap — Future Improvements

| Priority | Improvement |
|---|---|
| 🔴 High | Replace the hardcoded backend URL with an environment variable |
| 🔴 High | Restrict CORS to the production domain |
| 🟡 Medium | Hamburger menu for mobile in the NavBar |
| 🟡 Medium | Email notifications when comments are received |
| 🟡 Medium | Automatic Dashboard refresh (polling or WebSocket) |
| 🟢 Low | Period filters on the Dashboard (the logic exists but the `startDate` filter is not applied in the query) |
| 🟢 Low | Automated tests (Jest + React Testing Library) |
| 🟢 Low | Pagination in `TicketList` for large data volumes |

---

*This document was generated in March 2026 and represents the current state of the project.*
