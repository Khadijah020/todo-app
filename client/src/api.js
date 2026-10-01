// Sends a JSON request and returns the parsed body (null when empty).
async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

// Fetches all todos.
export const getTodos = () => request('/api/todos')

// Creates a todo with the given title.
export const addTodo = (title) =>
  request('/api/todos', { method: 'POST', body: JSON.stringify({ title }) })

// Updates a todo's title and/or done fields.
export const updateTodo = (id, changes) =>
  request(`/api/todos/${id}`, { method: 'PATCH', body: JSON.stringify(changes) })

// Deletes all completed todos.
export const clearDone = () => request('/api/todos?done=1', { method: 'DELETE' })

// Deletes a todo by id.
export const deleteTodo = (id) => request(`/api/todos/${id}`, { method: 'DELETE' })
