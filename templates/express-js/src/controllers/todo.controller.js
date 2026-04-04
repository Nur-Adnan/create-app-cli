const { asyncHandler } = require('../middlewares/asyncHandler');
const todoService = require('../services/todo.service');

const getAll = asyncHandler(async (_req, res) => {
  const todos = await todoService.getAllTodos();
  res.json({ success: true, data: todos });
});

const getOne = asyncHandler(async (req, res) => {
  const todo = await todoService.getTodoById(req.params.id);
  if (!todo) {
    res.status(404).json({ success: false, message: 'Not found' });
    return;
  }
  res.json({ success: true, data: todo });
});

const create = asyncHandler(async (req, res) => {
  const todo = await todoService.createTodo(req.body);
  res.status(201).json({ success: true, data: todo });
});

const update = asyncHandler(async (req, res) => {
  const todo = await todoService.updateTodo(req.params.id, req.body);
  if (!todo) {
    res.status(404).json({ success: false, message: 'Not found' });
    return;
  }
  res.json({ success: true, data: todo });
});

const remove = asyncHandler(async (req, res) => {
  await todoService.deleteTodo(req.params.id);
  res.json({ success: true, message: 'Deleted' });
});

module.exports = { getAll, getOne, create, update, remove };
