import { useEffect, useState } from 'react'
import { addTodo, clearDone, deleteTodo, getTodos, updateTodo } from './api'
import './App.css'

const FILTERS = ['All', 'Active', 'Done']

// Reads the active filter from the URL hash, defaulting to All.
const filterFromHash = () =>
  FILTERS.find((f) => f.toLowerCase() === location.hash.slice(1)) ?? 'All'

// Returns whether a todo belongs in the given filter tab.
const matches = (todo, filter) =>
  filter === 'All' || (filter === 'Done') === Boolean(todo.done)

// Renders one todo row with toggle, inline title editing and delete.
function TodoItem({ todo, onToggle, onRename, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)

  // Saves the edited title unless it is empty or unchanged.
  const save = () => {
    const title = draft.trim()
    setEditing(false)
    if (title && title !== todo.title) onRename(todo.id, title)
    else setDraft(todo.title)
  }

  // Handles Enter to save and Escape to cancel while editing.
  const onKeyDown = (e) => {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') {
      setDraft(todo.title)
      setEditing(false)
    }
  }

  return (
    <li className={todo.done ? 'item done' : 'item'}>
      <input
        type="checkbox"
        checked={Boolean(todo.done)}
        onChange={() => onToggle(todo)}
        aria-label={`Mark "${todo.title}" as done`}
      />
      {editing ? (
        <input
          className="edit"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={onKeyDown}
        />
      ) : (
        <span className="title" onDoubleClick={() => setEditing(true)}>
          {todo.title}
        </span>
      )}
      <button
        className="delete"
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete "${todo.title}"`}
      >
        ×
      </button>
    </li>
  )
}

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState(filterFromHash)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Runs an async action and surfaces any failure in the error banner.
  const run = async (action) => {
    setError('')
    try {
      await action()
    } catch (err) {
      setError(err.message)
    }
  }

  // Loads todos from the server.
  const load = async () => {
    await run(async () => setTodos(await getTodos()))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const sync = () => setFilter(filterFromHash())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  // Deletes all done todos on the server, then locally.
  const clearCompleted = () =>
    run(async () => {
      await clearDone()
      setTodos((list) => list.filter((t) => !t.done))
    })

  // Adds the typed todo and clears the input.
  const add = (e) => {
    e.preventDefault()
    const text = title.trim()
    if (!text) return
    run(async () => {
      const todo = await addTodo(text)
      setTodos((list) => [...list, todo])
      setTitle('')
    })
  }

  // Applies changes to a todo on the server, then in local state.
  const change = (id, changes) =>
    run(async () => {
      const updated = await updateTodo(id, changes)
      setTodos((list) => list.map((t) => (t.id === id ? { ...t, ...updated } : t)))
    })

  // Deletes a todo on the server, then removes it locally.
  const remove = (id) =>
    run(async () => {
      await deleteTodo(id)
      setTodos((list) => list.filter((t) => t.id !== id))
    })

  const left = todos.filter((t) => !t.done).length
  const visible = todos.filter((t) => matches(t, filter))

  return (
    <main className="card">
      <h1>Todos</h1>
      <form className="add" onSubmit={add}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          aria-label="New todo"
        />
        <button type="submit">Add</button>
      </form>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <nav className="tabs">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={f === filter ? 'tab active' : 'tab'}
            onClick={() => {
              location.hash = f.toLowerCase()
            }}
          >
            {f}
          </button>
        ))}
      </nav>

      {loading ? (
        <p className="empty">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="empty">Nothing here yet.</p>
      ) : (
        <ul className="list">
          {visible.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={(t) => change(t.id, { done: t.done ? 0 : 1 })}
              onRename={(id, newTitle) => change(id, { title: newTitle })}
              onDelete={remove}
            />
          ))}
        </ul>
      )}

      <footer className="count">
        {left} {left === 1 ? 'item' : 'items'} left
        {todos.length > left && (
          <button className="clear" onClick={clearCompleted}>
            Clear completed
          </button>
        )}
      </footer>
    </main>
  )
}

export default App
