import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Todo } from '@/lib/models/todo.model';
import { createTodoSchema } from '@/lib/validations/todo.validation';

export async function GET() {
  await connectDB();
  const todos = await Todo.find().sort({ createdAt: -1 });
  return NextResponse.json({ success: true, data: todos });
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const result = createTodoSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ success: false, errors: result.error.flatten() }, { status: 400 });
  }
  const todo = await Todo.create(result.data);
  return NextResponse.json({ success: true, data: todo }, { status: 201 });
}
