import { Todo } from '../models/todo.model';
import { CreateTodoInput, UpdateTodoInput } from '../validations/todo.validation';

export const getAllTodos = () => Todo.find().sort({ createdAt: -1 });
export const getTodoById = (id: string) => Todo.findById(id);
export const createTodo = (data: CreateTodoInput) => Todo.create(data);
export const updateTodo = (id: string, data: UpdateTodoInput) =>
  Todo.findByIdAndUpdate(id, data, { new: true });
export const deleteTodo = (id: string) => Todo.findByIdAndDelete(id);
