const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const RequestLogger = require('./middleware/requestLogger');
const appConfig = require('./config/app');

const app = express();

// Middlewares
app.use(cors({ origin: appConfig.get('clientUrl'), credentials: true }));
app.use(express.json());
app.use(RequestLogger.logRequests);

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(RequestLogger.logErrors);

const PORT = appConfig.get('port');
app.listen(PORT, () => {
  console.log(`🚀 StackIt backend running at http://localhost:${PORT}`);
});
