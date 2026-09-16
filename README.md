# InventoryHub — Full-Stack Integration

A minimal full-stack inventory management app demonstrating a React frontend
talking to an Express/Node backend over a REST API.

```
InventoryHub-FullStack-Integration/
├── package.json          # root scripts to install/run both apps
├── README.md
├── backend/               # Express REST API (port 5000)
│   ├── package.json
│   └── server.js
└── frontend/              # React app (port 3000)
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js
        └── index.js
```

## Features

- **Backend**: Express REST API with in-memory inventory data store
  - `GET    /api/items`       – list all items
  - `GET    /api/items/:id`   – get one item
  - `POST   /api/items`       – create an item
  - `PUT    /api/items/:id`   – update an item
  - `DELETE /api/items/:id`   – delete an item
  - `GET    /api/health`      – health check
- **Frontend**: React single-page app that fetches from the API to list,
  add, edit, and delete inventory items, with quantity/price totals.

## Getting started

### 1. Install dependencies

From the project root:

```bash
npm run install:all
```

This installs dependencies separately inside `backend/` and `frontend/`.

(Alternatively, `cd backend && npm install` and `cd frontend && npm install`.)

### 2. Run both apps together

```bash
npm run dev
```

This uses `concurrently` to start:
- the backend API at **http://localhost:5000**
- the React dev server at **http://localhost:3000** (proxies API calls to the backend)

### 3. Run them separately (optional)

```bash
# Terminal 1
npm run start:backend

# Terminal 2
npm run start:frontend
```

## Configuration

- Backend port defaults to `5000` (override with `PORT` env var).
- The frontend's `package.json` includes a `"proxy": "http://localhost:5000"`
  entry so `fetch('/api/...')` calls from React are forwarded to the backend
  during development without CORS issues.

## Next steps / ideas

- Swap the in-memory array for a real database (MongoDB, PostgreSQL, etc.).
- Add authentication and per-user inventories.
- Add pagination, search, and filtering on the items list.
- Add automated tests (Jest/Supertest for backend, React Testing Library for frontend).
