const { Router } = require('express');
const { validate } = require('../middlewares/validate');
const { createTodoSchema, updateTodoSchema } = require('../validations/todo.validation');
const { getAll, getOne, create, update, remove } = require('../controllers/todo.controller');

const todoRouter = Router();

todoRouter.get('/todos', getAll);
todoRouter.get('/todos/:id', getOne);
todoRouter.post('/todos', validate(createTodoSchema), create);
todoRouter.put('/todos/:id', validate(updateTodoSchema), update);
todoRouter.delete('/todos/:id', remove);

module.exports = todoRouter;
