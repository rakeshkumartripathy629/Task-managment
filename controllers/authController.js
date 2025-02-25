const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Create a new user
    const user = new User({
      username,
      passwordHash: password // Will be hashed in the pre-save hook
    });
    
    await user.save();
    
    // Create audit log
    await AuditLog.create({
      action: 'CREATE',
      entityType: 'USER',
      entityId: user._id,
      userId: user._id,
      username: user.username,
      details: `User registered: ${username}`
    });
    
    logger.info(`New user registered: ${username}`);
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Login user and return a JWT token
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    
    // Create audit log for login
    await AuditLog.create({
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user._id,
      userId: user._id,
      username: user.username,
      details: `User logged in: ${username}`
    });
    
    logger.info(`User logged in: ${username}`);
    
    res.json({ token });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
