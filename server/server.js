require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { getJwtSecret } = require('./utils/generateToken');
const { startJobScheduler } = require('./services/jobScheduler');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    getJwtSecret();
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
    startJobScheduler();
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
