const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export const fetchTodos = async () => {
  const res = await fetch(`${BASE_URL}/api/todos`);
  const data = await res.json();
  return data.data;
};

export const createTodo = async (title: string) => {
  const res = await fetch(`${BASE_URL}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  const data = await res.json();
  return data.data;
};

export const updateTodo = async (id: string, updates: Partial<{ title: string; completed: boolean }>) => {
  const res = await fetch(`${BASE_URL}/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  return data.data;
};

export const deleteTodo = async (id: string): Promise<void> => {
  await fetch(`${BASE_URL}/api/todos/${id}`, { method: 'DELETE' });
};
