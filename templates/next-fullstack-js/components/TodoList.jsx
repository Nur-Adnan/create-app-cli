'use client';
import { useState } from 'react';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';

export function TodoList({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);

  const addTodo = async (title) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const { data } = await res.json();
    setTodos(prev => [data, ...prev]);
  };

  const toggleTodo = async (id, completed) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    });
    const { data } = await res.json();
    setTodos(prev => prev.map(t => (t._id === id ? data : t)));
  };

  const deleteTodo = async (id) => {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    setTodos(prev => prev.filter(t => t._id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">My Todos</h1>
        <TodoForm onAdd={addTodo} />
        <div className="flex flex-col gap-2">
          {todos.length === 0 && (
            <p className="text-center text-gray-400 py-8">No tasks yet. Add one above!</p>
          )}
          {todos.map(todo => (
            <TodoItem key={todo._id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
          ))}
        </div>
        {todos.length > 0 && (
          <p className="text-center text-sm text-gray-400 mt-4">
            {todos.filter(t => t.completed).length}/{todos.length} completed
          </p>
        )}
      </div>
    </div>
  );
}
