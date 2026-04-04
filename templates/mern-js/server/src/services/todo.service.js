const { Todo } = require('../models/todo.model');

const getAllTodos = () => Todo.find().sort({ createdAt: -1 });
const getTodoById = (id) => Todo.findById(id);
/** @param {{ title: string }} data */
const createTodo = (data) => Todo.create(data);
const updateTodo = (id, data) => Todo.findByIdAndUpdate(id, data, { new: true });
const deleteTodo = (id) => Todo.findByIdAndDelete(id);

module.exports = { getAllTodos, getTodoById, createTodo, updateTodo, deleteTodo };
