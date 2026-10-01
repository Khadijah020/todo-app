# Todo app
Stack: client/ = Vite + React (JS, no TS). server/ = Express + better-sqlite3. Both use ESM.

## Commands
- Server: `cd server && npm run dev` (port 3001)
- Client: `cd client && npm run dev` (port 5173, proxies /api to 3001)
- Tests: `cd server && npm test`

## API
GET /api/todos, POST /api/todos, PATCH /api/todos/:id (title and/or done), DELETE /api/todos/:id
Todo = { id, title, done (0/1), createdAt }
DB path = process.env.DB_PATH or todos.db

## Rules
- Plain CSS in client/src/App.css. No UI libraries.
- No new dependencies without asking.
- Only do what is asked. Keep functions small. No comments that restate code.
- write a one line explanation every time you add a new function.
- Never read node_modules, lockfiles or dist.
- Do not start dev servers; I run them. Do not commit; I commit.
- Reply in 3 lines max. No summaries of what you changed.