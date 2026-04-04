export function getTodoTypeContent(language: string): string {
  if (language === 'typescript') {
    return `export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}
`;
  }
  return `/**
 * @typedef {Object} Todo
 * @property {string} id
 * @property {string} title
 * @property {boolean} completed
 */
`;
}

export function getUseTodosContent(language: string): string {
  if (language === 'typescript') {
    return `import { useState } from 'react';
import { Todo } from '../types/todo';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (title: string) => {
    if (!title.trim()) return;
    setTodos(prev => [...prev, { id: Date.now().toString(), title: title.trim(), completed: false }]);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return { todos, addTodo, toggleTodo, deleteTodo };
}
`;
  }
  return `import { useState } from 'react';

export function useTodos() {
  const [todos, setTodos] = useState([]);

  /** @param {string} title */
  const addTodo = (title) => {
    if (!title.trim()) return;
    setTodos(prev => [...prev, { id: Date.now().toString(), title: title.trim(), completed: false }]);
  };

  /** @param {string} id */
  const toggleTodo = (id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  /** @param {string} id */
  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return { todos, addTodo, toggleTodo, deleteTodo };
}
`;
}

export function getTodoItemContent(language: string): string {
  if (language === 'typescript') {
    return `import { Todo } from '../../types/todo';

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="w-4 h-4 accent-blue-500 cursor-pointer"
      />
      <span className={\`flex-1 text-gray-800 \${todo.completed ? 'line-through text-gray-400' : ''}\`}>
        {todo.title}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors"
      >
        Delete
      </button>
    </div>
  );
}
`;
  }
  return `/**
 * @param {{ todo: {id: string, title: string, completed: boolean}, onToggle: (id: string) => void, onDelete: (id: string) => void }} props
 */
export function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="w-4 h-4 accent-blue-500 cursor-pointer"
      />
      <span className={\`flex-1 text-gray-800 \${todo.completed ? 'line-through text-gray-400' : ''}\`}>
        {todo.title}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors"
      >
        Delete
      </button>
    </div>
  );
}
`;
}

export function getTodoFormContent(language: string): string {
  if (language === 'typescript') {
    return `import { useState } from 'react';

interface Props {
  onAdd: (title: string) => void;
}

export function TodoForm({ onAdd }: Props) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(value);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Add a new task..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
      >
        Add
      </button>
    </form>
  );
}
`;
  }
  return `import { useState } from 'react';

/** @param {{ onAdd: (title: string) => void }} props */
export function TodoForm({ onAdd }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(value);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Add a new task..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
      >
        Add
      </button>
    </form>
  );
}
`;
}

export function getTodoListContent(language: string): string {
  if (language === 'typescript') {
    return `import { useTodos } from '../../hooks/useTodos';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';

export function TodoList() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();

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
            <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
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
`;
  }
  return `import { useTodos } from '../../hooks/useTodos';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';

export function TodoList() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();

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
            <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
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
`;
}

export function getTodoIndexContent(language: string): string {
  // Same for both TS and JS — named re-exports work in both
  return `export { TodoList } from './TodoList';
export { TodoForm } from './TodoForm';
export { TodoItem } from './TodoItem';
`;
}

export function getAppContent(language: string): string {
  if (language === 'typescript') {
    return `import { TodoList } from './features/todo';

function App() {
  return <TodoList />;
}

export default App;
`;
  }
  return `import { TodoList } from './features/todo';

function App() {
  return <TodoList />;
}

export default App;
`;
}

export function getNextPageContent(language: string): string {
  if (language === 'typescript') {
    return `import { TodoList } from '@/components/TodoList';

export default function Home() {
  return (
    <main>
      <TodoList />
    </main>
  );
}
`;
  }
  return `import { TodoList } from '@/components/TodoList';

export default function Home() {
  return (
    <main>
      <TodoList />
    </main>
  );
}
`;
}

export function getTailwindConfig(framework: string, language: string): string {
  const isTs = language === 'typescript';
  const contentPaths = framework === 'react-vite'
    ? `['./src/**/*.{js,jsx,ts,tsx}', './index.html']`
    : `['./src/**/*.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}']`;

  if (isTs) {
    return `import type { Config } from 'tailwindcss';

const config: Config = {
  content: ${contentPaths},
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
`;
  }
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ${contentPaths},
  theme: {
    extend: {},
  },
  plugins: [],
};
`;
}

export function getPostcssConfig(): string {
  return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
}

export function getTailwindCSS(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
}
