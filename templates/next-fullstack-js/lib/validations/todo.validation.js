const { z } = require('zod');

const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
});

const updateTodoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  completed: z.boolean().optional(),
});

module.exports = { createTodoSchema, updateTodoSchema };
