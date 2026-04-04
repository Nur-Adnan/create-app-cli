import { useState } from 'react';

export function useTodos() {
  const [todos, setTodos] = useState([]);

  /** @param {string} title */
  const addTodo = (title) => {
    if (!title.trim()) return;
    setTodos(prev => [
      { id: Date.now().toString(), title: title.trim(), completed: false },
      ...prev,
    ]);
  };

  /** @param {string} id */
  const toggleTodo = (id) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  /** @param {string} id */
  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return { todos, addTodo, toggleTodo, deleteTodo };
}
