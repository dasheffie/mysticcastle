const express = require('express');
const path = require('path');
const { 
  requestLogger, 
  errorHandler, 
  createServer, 
  healthCheck 
} = require('../../../lib/server-utils');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(requestLogger({ skip: (req) => req.path === '/api/health' }));
app.use(express.static(path.join(__dirname, '../public')));

// Health check
app.get('/api/health', healthCheck({}));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handler (must be last)
app.use(errorHandler());

// Create server with graceful shutdown
createServer(app, { 
  port: PORT, 
  name: 'MysticCastle',
  emoji: '🏰'
});
