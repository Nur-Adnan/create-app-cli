import { useState, useEffect } from 'react';
import * as api from '../lib/api';
import { Todo } from '../types/todo';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.fetchTodos()
      .then(setTodos)
      .finally(() => setLoading(false));
  }, []);

  const addTodo = async (title: string) => {
    if (!title.trim()) return;
    const todo = await api.createTodo(title.trim());
    setTodos(prev => [todo, ...prev]);
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    const todo = await api.updateTodo(id, { completed: !completed });
    setTodos(prev => prev.map(t => t._id === id ? todo : t));
  };

  const deleteTodo = async (id: string) => {
    await api.deleteTodo(id);
    setTodos(prev => prev.filter(t => t._id !== id));
  };

  return { todos, loading, addTodo, toggleTodo, deleteTodo };
}
