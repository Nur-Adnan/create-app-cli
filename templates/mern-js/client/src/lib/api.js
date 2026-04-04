const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export const fetchTodos = async () => {
  const res = await fetch(`${BASE_URL}/api/todos`);
  const data = await res.json();
  return data.data;
};

/** @param {string} title */
export const createTodo = async (title) => {
  const res = await fetch(`${BASE_URL}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  const data = await res.json();
  return data.data;
};

/**
 * @param {string} id
 * @param {{ title?: string, completed?: boolean }} updates
 */
export const updateTodo = async (id, updates) => {
  const res = await fetch(`${BASE_URL}/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  return data.data;
};

/** @param {string} id */
export const deleteTodo = async (id) => {
  await fetch(`${BASE_URL}/api/todos/${id}`, { method: 'DELETE' });
};
