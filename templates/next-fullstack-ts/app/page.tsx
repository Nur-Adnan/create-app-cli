import { connectDB } from '@/lib/db';
import { Todo } from '@/lib/models/todo.model';
import { TodoList } from '@/components/TodoList';

export default async function Home() {
  await connectDB();
  const raw = await Todo.find().sort({ createdAt: -1 }).lean();
  const todos = raw.map((t: any) => ({
    _id: t._id.toString(),
    title: t.title as string,
    completed: t.completed as boolean,
    createdAt: (t.createdAt as Date).toISOString(),
  }));

  return (
    <main>
      <TodoList initialTodos={todos} />
    </main>
  );
}
