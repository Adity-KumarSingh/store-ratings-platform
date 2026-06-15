# Store Ratings Platform

A full-stack web application where users submit 1–5 star ratings for stores. A single
login serves three roles — **System Administrator**, **Normal User**, and **Store Owner** —
each with role-specific functionality.

## Tech stack

| Layer     | Technology                                   |
| --------- | -------------------------------------------- |
| Backend   | Express.js + TypeScript                       |
| Database  | PostgreSQL (local for dev, Render-managed in prod) |
| Frontend  | React + TypeScript (Vite)                     |
| Auth      | JWT (bcrypt-hashed passwords)                 |
| Hosting   | Render (API + Postgres + static site via `render.yaml`) |

## Project layout

```
.
├── render.yaml             # Render Blueprint: Postgres + API + static site
├── backend/                # Express + TypeScript API
│   └── src/
│       ├── config/         # env + db pool
│       ├── db/             # schema.sql, migrate, seed
│       ├── controllers/    # auth, users, stores, ratings
│       ├── routes/         # route definitions + validation
│       ├── middleware/     # auth (JWT + roles), error handling
│       └── utils/          # validation rules, jwt, sort whitelist
└── frontend/               # React + TypeScript (Vite)
    └── src/
        ├── api/            # axios client
        ├── context/        # auth context
        ├── components/     # Layout, DataTable, Modal, StarRating, ...
        └── pages/          # login, signup, admin/, user/, owner/
```

## Prerequisites

- Node.js 18+ (tested on Node 20)
- PostgreSQL 14+ running locally (no Docker required)

### Install PostgreSQL locally (macOS / Homebrew)

```bash
brew install postgresql@16
brew services start postgresql@16

# create the role + database used by the app
psql -d postgres -c "CREATE ROLE store_user LOGIN PASSWORD 'store_pass';"
psql -d postgres -c "CREATE DATABASE store_ratings OWNER store_user;"
```

(On Linux use your package manager; on Windows use the official installer or WSL.)

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env        # adjust JWT_SECRET / DATABASE_URL if needed
npm install
npm run seed                # creates the schema + demo data + default admin
npm run dev                 # API on http://localhost:4000
```

> `npm run seed` is idempotent — it applies the schema and inserts demo users,
> stores and ratings. Use `npm run migrate` if you only want the schema.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                 # app on http://localhost:5173
```

The Vite dev server proxies `/api` to the backend, so no extra config is needed.

## Deploying to Render

The repo includes a `render.yaml` Blueprint that provisions everything — the
**PostgreSQL database, the Express API, and the static React site** — in a single
Render project. There is no separate database vendor and no Docker.

1. Push the repo to GitHub.
2. In Render: **New → Blueprint** and select the repo. Render reads `render.yaml`
   and creates the database + both services.
3. The API gets `DATABASE_URL` injected automatically and runs
   `npm run start:prod`, which applies the schema, seeds the admin, then boots.
4. After the first deploy, set the two cross-reference URLs:
   - API service → `CLIENT_ORIGIN` = the static site URL.
   - Web service → `VITE_API_URL` = the API service URL, then redeploy the site.

Locally the frontend talks to the API through the Vite proxy; in production it
uses `VITE_API_URL`.

## Demo accounts (created by the seed)

| Role        | Email                        | Password    |
| ----------- | ---------------------------- | ----------- |
| Admin       | adityasingh112211@gmail.com  | Adity@123   |
| Normal User | john.normal@example.com      | User@1234   |
| Store Owner | owner.greene@example.com     | Owner@1234  |

## Roles & functionality

### System Administrator
- Dashboard with total users / stores / ratings.
- Add stores, normal users, admin users (and store owners).
- List users (Name, Email, Address, Role) and stores (Name, Email, Address, Rating).
- Filter every listing by Name, Email, Address, Role.
- View full user details, including the store rating for owners.

### Normal User
- Self sign-up and login; can change password.
- Browse all stores; search by Name and Address.
- See overall rating + their own submitted rating per store.
- Submit and modify a rating (1–5).

### Store Owner
- Login; can change password.
- Dashboard: average store rating + list of users who rated the store.

## Form validation rules

Enforced on **both** client and server:

- **Name** — required (no length limit).
- **Address** — max 400 characters.
- **Password** — 8–16 characters, ≥1 uppercase letter and ≥1 special character.
- **Email** — standard email format.

## Notable design decisions

- **Roles enforced in two layers** — `authorize()` middleware on the API, and
  role-aware routing/guards on the client.
- **Sorting** — every table supports ascending/descending sort (client-side in
  `DataTable`); the API also accepts `sortBy`/`order` with a column whitelist to
  prevent SQL injection.
- **Filtering** — server-side `ILIKE` filters, debounced from the UI.
- **Ratings** — a `UNIQUE (user_id, store_id)` constraint plus an upsert means
  "submit" and "modify" are the same idempotent operation.
- **Security** — passwords hashed with bcrypt, JWT auth, `helmet`, CORS locked
  to the client origin, parameterized SQL throughout.

## API overview

| Method | Endpoint                      | Role   | Purpose                              |
| ------ | ----------------------------- | ------ | ------------------------------------ |
| POST   | `/api/auth/signup`            | public | Normal-user registration             |
| POST   | `/api/auth/login`             | public | Login                                |
| GET    | `/api/auth/me`                | any    | Current user                         |
| PUT    | `/api/auth/password`          | any    | Change own password                  |
| GET    | `/api/users/dashboard`        | admin  | Counts for the admin dashboard       |
| GET    | `/api/users`                  | admin  | List/filter/sort users               |
| GET    | `/api/users/:id`              | admin  | User details (rating if owner)       |
| POST   | `/api/users`                  | admin  | Create a user of any role            |
| DELETE | `/api/users/:id`              | admin  | Delete a user (cannot delete self)   |
| GET    | `/api/stores`                 | any    | List stores (+ own rating for users) |
| POST   | `/api/stores`                 | admin  | Create a store                       |
| DELETE | `/api/stores/:id`             | admin  | Delete a store                       |
| GET    | `/api/stores/owner/dashboard` | owner  | Owner dashboard                      |
| POST   | `/api/ratings`                | user   | Submit / modify a rating             |
