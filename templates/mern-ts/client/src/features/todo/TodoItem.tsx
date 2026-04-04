import { Todo } from '../../types/todo';

interface Props {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo._id, todo.completed)}
        className="w-4 h-4 accent-blue-500 cursor-pointer"
      />
      <span className={`flex-1 text-gray-800 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
        {todo.title}
      </span>
      <button
        onClick={() => onDelete(todo._id)}
        className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors"
      >
        Delete
      </button>
    </div>
  );
}
