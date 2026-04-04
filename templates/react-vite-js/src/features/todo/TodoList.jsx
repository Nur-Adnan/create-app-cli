import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTodos } from '@/hooks/useTodos';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';

export function TodoList() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
  const completed = todos.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Todos</CardTitle>
          {todos.length > 0 && (
            <Badge variant="secondary">{completed}/{todos.length} done</Badge>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TodoForm onAdd={addTodo} />
          <div className="flex flex-col gap-2">
            {todos.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No tasks yet. Add one above!
              </p>
            ) : (
              todos.map(todo => (
                <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
