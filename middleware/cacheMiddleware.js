const NodeCache = require('node-cache');
const config = require('../config/config');

const cache = new NodeCache({ stdTTL: config.cache.ttl });

const cacheMiddleware = (req, res, next) => {
  // Skip caching for non-GET requests
  if (req.method !== 'GET') {
    return next();
  }
  
  const cacheKey = req.originalUrl || req.url;
  const cachedResponse = cache.get(cacheKey);
  
  if (cachedResponse) {
    return res.json(cachedResponse);
  }
  
  // Store the original res.json method
  const originalJson = res.json;
  
  // Override the res.json method to cache the response
  res.json = function(data) {
    cache.set(cacheKey, data);
    originalJson.call(this, data);
  };
  
  next();
};

// Function to clear cache keys that match a pattern
const clearCache = (pattern) => {
  const keys = cache.keys();
  for (const key of keys) {
    if (key.includes(pattern)) {
      cache.del(key);
    }
  }
};

module.exports = {
  cacheMiddleware,
  clearCache,
  cache
};
