# Todo app

A simple todo list. Client: Vite + React. Server: Express + better-sqlite3 (SQLite).

## Run

```
cd server && npm install && npm run dev   # http://localhost:3001
cd client && npm install && npm run dev   # http://localhost:5173 (proxies /api)
```

Tests: `cd server && npm test`. Set `DB_PATH` to change the database file (default `todos.db`).

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/todos | List todos |
| POST | /api/todos | Create a todo |
| PATCH | /api/todos/:id | Update `title` and/or `done` |
| DELETE | /api/todos/:id | Delete a todo |

Todo shape: `{ id, title, done (0/1), createdAt }`

## How it was built

- Built in one Claude Code session using Sonnet.
- Project rules live in `CLAUDE.md`.
- `settings.json` holds the model choice and deny rules that stop Claude reading `node_modules` and lockfiles.
- Work was done in 3 prompts (backend, frontend, extras), with `/clear` and a git commit between each to keep context small.
- One custom subagent (`reviewer`, runs on Haiku, read-only tools) reviewed the code; the main session fixed its HIGH issues.


### Loop / Harness / Orchestrator

- **Loop:** Claude's read-edit-test cycle.
- **Harness:** `CLAUDE.md` plus `settings.json` permissions.
- **Orchestrator:** the main session delegating to the `reviewer` subagent.
