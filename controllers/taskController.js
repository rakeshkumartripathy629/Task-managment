const Task = require('../models/Task');
const { clearCache } = require('../middleware/cacheMiddleware');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Validate status enum
    if (status && !['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Create the task
    const task = new Task({
      title,
      description,
      status: status || 'Pending',
      dueDate: dueDate || null,
      userId: req.user.userId
    });
    
    const savedTask = await task.save();
    
    // Create audit log
    await AuditLog.create({
      action: 'CREATE',
      entityType: 'TASK',
      entityId: savedTask._id,
      userId: req.user.userId,
      username: req.user.username,
      details: `Created task: ${title}`
    });
    
    // Clear the tasks cache
    clearCache('/api/tasks');
    
    logger.info(`Task created: ${title} by user ${req.user.username}`);
    
    res.status(201).json({
      ID: savedTask._id,
      Title: savedTask.title,
      Description: savedTask.description,
      Status: savedTask.status,
      DueDate: savedTask.dueDate,
      CreatedAt: savedTask.createdAt,
      UpdatedAt: savedTask.updatedAt
    });
  } catch (error) {
    logger.error(`Task creation error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get all tasks with filtering, sorting, and pagination
exports.getTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      due_date_after,
      due_date_before,
      sort_by = 'createdAt',
      sort_order = 'desc',
      search
    } = req.query;
    
    // Validate limit
    const limitValue = parseInt(limit) > 50 ? 50 : parseInt(limit);
    const skip = (parseInt(page) - 1) * limitValue;
    
    // Build filter query
    const filter = { userId: req.user.userId };
    
    if (status) {
      filter.status = status;
    }
    
    if (due_date_after) {
      filter.dueDate = { ...filter.dueDate, $gte: new Date(due_date_after) };
    }
    
    if (due_date_before) {
      filter.dueDate = { ...filter.dueDate, $lte: new Date(due_date_before) };
    }
    
    // Add search query if provided
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Map sort_by from query param to model field
    const sortMapping = {
      due_date: 'dueDate',
      created_at: 'createdAt',
      updated_at: 'updatedAt',
      title: 'title',
      status: 'status'
    };
    
    const sortField = sortMapping[sort_by] || 'createdAt';
    const sortDirection = sort_order === 'asc' ? 1 : -1;
    
    // Query the database
    const tasks = await Task.find(filter)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limitValue);
    
    // Get total count
    const total = await Task.countDocuments(filter);
    
    // Format response
    const formattedTasks = tasks.map(task => ({
      ID: task._id,
      Title: task.title,
      Status: task.status,
      DueDate: task.dueDate,
      CreatedAt: task.createdAt,
      UpdatedAt: task.updatedAt
    }));
    
    logger.info(`Retrieved ${tasks.length} tasks for user ${req.user.username}`);
    
    res.json({
      tasks: formattedTasks,
      page: parseInt(page),
      limit: limitValue,
      total
    });
  } catch (error) {
    logger.error(`Task retrieval error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get a task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    logger.info(`Retrieved task ${task._id} for user ${req.user.username}`);
    
    res.json({
      ID: task._id,
      Title: task.title,
      Description: task.description,
      Status: task.status,
      DueDate: task.dueDate,
      CreatedAt: task.createdAt,
      UpdatedAt: task.updatedAt
    });
  } catch (error) {
    logger.error(`Error retrieving task: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    
    // Validate status enum
    if (status && !['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Find the task
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Update the task
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;
    
    // Update timestamp
    task.updatedAt = new Date();
    
    const updatedTask = await task.save();
    
    // Create audit log
    await AuditLog.create({
      action: 'UPDATE',
      entityType: 'TASK',
      entityId: updatedTask._id,
      userId: req.user.userId,
      username: req.user.username,
      details: `Updated task: ${updatedTask.title}`
    });
    
    // Clear the tasks cache
    clearCache('/api/tasks');
    clearCache(`/api/tasks/${req.params.id}`);
    
    logger.info(`Updated task ${task._id} by user ${req.user.username}`);
    
    res.json({
      ID: updatedTask._id,
      Title: updatedTask.title,
      Description: updatedTask.description,
      Status: updatedTask.status,
      DueDate: updatedTask.dueDate,
      CreatedAt: updatedTask.createdAt,
      UpdatedAt: updatedTask.updatedAt
    });
  } catch (error) {
    logger.error(`Task update error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Create audit log
    await AuditLog.create({
      action: 'DELETE',
      entityType: 'TASK',
      entityId: req.params.id,
      userId: req.user.userId,
      username: req.user.username,
      details: `Deleted task: ${task.title}`
    });
    
    // Clear the tasks cache
    clearCache('/api/tasks');
    clearCache(`/api/tasks/${req.params.id}`);
    
    logger.info(`Deleted task ${req.params.id} by user ${req.user.username}`);
    
    res.json({ message: 'Task successfully deleted' });
  } catch (error) {
    logger.error(`Task deletion error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};