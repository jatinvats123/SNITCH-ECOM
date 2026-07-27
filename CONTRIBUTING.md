# Contributing to Aveniq

Thanks for taking a look. This is a two-package repository (`backend/` Express API,
`frontend/` React SPA) orchestrated by root-level scripts.

## Prerequisites

- Node.js **>= 20** (a `.nvmrc` pins 22; run `nvm use`)
- npm 10+
- A MongoDB **replica set** for the order flow (MongoDB Atlas, or `docker compose up`
  which starts a single-node replica set for you)

## Getting started

```bash
# install root + backend + frontend deps
make install            # or: npm run install:all

# configure the backend
cp backend/.env.example backend/.env   # then fill in real values

# run both servers (API :3000, web :5173)
make dev                # or: npm run dev
```

Or run the whole stack in containers (no local Node/Mongo needed):

```bash
docker compose up --build   # web on http://localhost:8080
```

## Common commands

| Command          | What it does                              |
| ---------------- | ----------------------------------------- |
| `npm run dev`    | Run backend + frontend together           |
| `npm test`       | Backend test suite with the coverage gate |
| `npm run lint`   | ESLint both packages                      |
| `npm run format` | Prettier-format the repo                  |
| `npm run build`  | Production build of the frontend          |

API docs (Swagger UI) are served at `http://localhost:3000/api/docs` in non-production.

## Workflow

1. **Branch** off `main` — one logical change per branch (e.g. `fix/cart-total`).
2. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   `feat:`, `fix:`, `refactor:`, `test:`, `chore:`, `docs:`, `perf:`. Keep commits
   small and focused.
3. Before opening a PR, make sure these pass locally (CI runs them too):
   ```bash
   npm run lint && npm run format:check && npm test && npm run build
   ```
4. Add or update tests for any behaviour change — the backend enforces a coverage
   gate.
5. Never commit secrets. `backend/.env` is git-ignored; only `*.example` files are
   committed.

## Project layout

```
backend/
  src/
    routes/        HTTP routes
    controller/    thin request/response handlers
    services/      business logic
    dao/           database queries
    models/        Mongoose schemas + indexes
    middleware/    auth, validation, error handling, security
    utils/         AppError, asyncHandler, response helper
  tests/           Jest + Supertest integration tests
frontend/
  src/
    app/           routing + store
    features/      feature folders (auth, products, cart, orders)
    components/    shared UI
docs/adr/          architecture decision records
```

See [`docs/adr/`](docs/adr/) for the reasoning behind the key architectural choices.
