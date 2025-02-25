const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create a task
router.post('/tasks', taskController.createTask);

// Get all tasks with filtering and pagination (with caching)
router.get('/tasks', cacheMiddleware, taskController.getTasks);

// Get a task by ID (with caching)
router.get('/tasks/:id', cacheMiddleware, taskController.getTaskById);

// Update a task
router.put('/tasks/:id', taskController.updateTask);

// Delete a task
router.delete('/tasks/:id', taskController.deleteTask);

module.exports = router;