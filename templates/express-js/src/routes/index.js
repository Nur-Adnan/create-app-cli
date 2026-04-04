const { Router } = require('express');
const todoRouter = require('./todo.routes');

const router = Router();
router.use('/api', todoRouter);

module.exports = { router };
