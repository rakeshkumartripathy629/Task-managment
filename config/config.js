// const dotenv = require('dotenv');
// dotenv.config();

// module.exports = {
//   port: process.env.PORT || 3000,
//   env: process.env.NODE_ENV || 'development',
//   mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/task-manager',
//   jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
//   jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
//   rateLimit: {
//     windowMs: 60 * 1000, // 1 minute
//     max: 2 // 60 requests per minute
//   },
//   cache: {
//     ttl: 300 // 5 minutes
//   }
// };

const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/task-manager',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: 2 // Allow only 2 requests per minute
  },
  cache: {
    ttl: 300 // 5 minutes
  }
};
