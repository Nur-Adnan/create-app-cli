import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { createTodoSchema, updateTodoSchema } from '../validations/todo.validation';
import { getAll, getOne, create, update, remove } from '../controllers/todo.controller';

const todoRouter = Router();

todoRouter.get('/todos', getAll);
todoRouter.get('/todos/:id', getOne);
todoRouter.post('/todos', validate(createTodoSchema), create);
todoRouter.put('/todos/:id', validate(updateTodoSchema), update);
todoRouter.delete('/todos/:id', remove);

export default todoRouter;
