# TaskChat — Chat-Based Task Manager

A MERN stack app for managing tasks through natural-language chat. Supports English, Hindi, and Hinglish.

## Features

- JWT authentication (register / login)
- Create, view, search, and update tasks via chat
- Follow-up questions when info is missing
- Role-based permissions enforced on the backend
- Clean, responsive UI

## Quick Start

### 1. Backend

```bash
cd backend
npm install
# Create a .env file based on env.template
node server.js      # or: npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev         # opens at http://localhost:5173
```

MongoDB must be running locally, or set `MONGO_URI` in your `.env`.

## Chat Commands

| Say | Action |
|-----|--------|
| `create task` / `task banao` | Start task creation |
| `show tasks` / `tasks dikhao` | List your tasks |
| `show pending tasks` | Filter by status |
| `search [keyword]` / `dhundo` | Search tasks |
| `update status` / `mark done` | Change task status |
| `help` | Show all commands |

## Permissions

| Role | Can do |
|------|--------|
| Creator | Edit all task fields |
| Assignee | Update status only |
| Others | Read-only (no edit) |

## Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs
- **Frontend**: React 18, Vite, Axios
