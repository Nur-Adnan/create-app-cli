import { Router } from 'express';
import todoRouter from './todo.routes';

export const router = Router();
router.use('/api', todoRouter);
