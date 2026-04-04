import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Todo } from '@/lib/models/todo.model';
import { updateTodoSchema } from '@/lib/validations/todo.validation';

export async function GET(_req, { params }) {
  await connectDB();
  const todo = await Todo.findById(params.id);
  if (!todo) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: todo });
}

export async function PUT(req, { params }) {
  await connectDB();
  const body = await req.json();
  const result = updateTodoSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ success: false, errors: result.error.flatten() }, { status: 400 });
  }
  const todo = await Todo.findByIdAndUpdate(params.id, result.data, { new: true });
  if (!todo) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: todo });
}

export async function DELETE(_req, { params }) {
  await connectDB();
  await Todo.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true, message: 'Deleted' });
}
