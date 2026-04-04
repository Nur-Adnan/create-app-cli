import { useState, useEffect } from 'react';
import * as api from '../lib/api';

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.fetchTodos()
      .then(setTodos)
      .finally(() => setLoading(false));
  }, []);

  /** @param {string} title */
  const addTodo = async (title) => {
    if (!title.trim()) return;
    const todo = await api.createTodo(title.trim());
    setTodos(prev => [todo, ...prev]);
  };

  /**
   * @param {string} id
   * @param {boolean} completed
   */
  const toggleTodo = async (id, completed) => {
    const todo = await api.updateTodo(id, { completed: !completed });
    setTodos(prev => prev.map(t => t._id === id ? todo : t));
  };

  /** @param {string} id */
  const deleteTodo = async (id) => {
    await api.deleteTodo(id);
    setTodos(prev => prev.filter(t => t._id !== id));
  };

  return { todos, loading, addTodo, toggleTodo, deleteTodo };
}
