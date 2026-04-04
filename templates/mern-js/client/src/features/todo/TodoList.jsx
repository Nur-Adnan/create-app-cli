import { useTodos } from '../../hooks/useTodos';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';

export function TodoList() {
  const { todos, loading, addTodo, toggleTodo, deleteTodo } = useTodos();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">My Todos</h1>
        <TodoForm onAdd={addTodo} />
        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading...</p>
        ) : (
          <div className="flex flex-col gap-2">
            {todos.length === 0 && (
              <p className="text-center text-gray-400 py-8">No tasks yet. Add one above!</p>
            )}
            {todos.map(todo => (
              <TodoItem key={todo._id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
            ))}
          </div>
        )}
        {todos.length > 0 && (
          <p className="text-center text-sm text-gray-400 mt-4">
            {todos.filter(t => t.completed).length}/{todos.length} completed
          </p>
        )}
      </div>
    </div>
  );
}
