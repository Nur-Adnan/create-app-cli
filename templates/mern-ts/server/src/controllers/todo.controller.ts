import { Request, Response } from 'express';
import * as todoService from '../services/todo.service';
import { asyncHandler } from '../middlewares/asyncHandler';

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
  const todos = await todoService.getAllTodos();
  res.json({ success: true, data: todos });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const todo = await todoService.getTodoById(req.params.id);
  if (!todo) { res.status(404).json({ success: false, message: 'Not found' }); return; }
  res.json({ success: true, data: todo });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const todo = await todoService.createTodo(req.body);
  res.status(201).json({ success: true, data: todo });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const todo = await todoService.updateTodo(req.params.id, req.body);
  if (!todo) { res.status(404).json({ success: false, message: 'Not found' }); return; }
  res.json({ success: true, data: todo });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await todoService.deleteTodo(req.params.id);
  res.json({ success: true, message: 'Deleted' });
});
