import express from 'express';
import Database from 'better-sqlite3';

const db = new Database(process.env.DB_PATH || 'todos.db');
db.exec(`create table if not exists todos(
  id integer primary key autoincrement,
  title text not null,
  done integer default 0,
  createdAt text default current_timestamp
)`);

// Returns true when title is a non-empty string of at most 200 chars.
const validTitle = (t) => typeof t === 'string' && t.trim().length > 0 && t.length <= 200;

// Returns true when done is a boolean or 0/1.
const validDone = (d) => typeof d === 'boolean' || d === 0 || d === 1;

// Fetches a single todo row by id.
const getTodo = (id) => db.prepare('select * from todos where id = ?').get(id);

const app = express();
app.use(express.json());

app.get('/api/todos', (req, res) => {
  res.json(db.prepare('select * from todos order by id').all());
});

app.post('/api/todos', (req, res) => {
  const { title } = req.body ?? {};
  if (!validTitle(title)) return res.status(400).json({ error: 'invalid title' });
  const { lastInsertRowid } = db.prepare('insert into todos(title) values (?)').run(title);
  res.status(201).json(getTodo(lastInsertRowid));
});

app.patch('/api/todos/:id', (req, res) => {
  const todo = getTodo(req.params.id);
  if (!todo) return res.status(404).json({ error: 'not found' });
  const { title, done } = req.body ?? {};
  if (title === undefined && done === undefined) return res.status(400).json({ error: 'nothing to update' });
  if (title !== undefined && !validTitle(title)) return res.status(400).json({ error: 'invalid title' });
  if (done !== undefined && !validDone(done)) return res.status(400).json({ error: 'invalid done' });
  db.prepare('update todos set title = ?, done = ? where id = ?').run(
    title ?? todo.title,
    done === undefined ? todo.done : Number(done),
    todo.id,
  );
  res.json(getTodo(todo.id));
});

// Deletes every done todo; only ?done=1 is accepted.
app.delete('/api/todos', (req, res) => {
  if (req.query.done !== '1') return res.status(400).json({ error: 'done=1 required' });
  db.prepare('delete from todos where done = 1').run();
  res.status(204).end();
});

app.delete('/api/todos/:id', (req, res) => {
  const { changes } = db.prepare('delete from todos where id = ?').run(req.params.id);
  if (!changes) return res.status(404).json({ error: 'not found' });
  res.status(204).end();
});

// Catches errors thrown by route handlers (e.g. DB failures) and returns a JSON 500.
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'internal error' });
});

export default app;
