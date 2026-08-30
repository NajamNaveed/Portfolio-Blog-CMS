const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const publicPostRoutes = require('./routes/publicPostRoutes');
const adminPostRoutes = require('./routes/adminPostRoutes');
const corsOptions = require('./config/corsOptions');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Trust proxy headers for rate limiting and IP detection when behind reverse proxies
// (Render, Railway, Vercel, AWS ALB, etc.)
app.set('trust proxy', 1);

// Security headers middleware
app.use(helmet());

app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', publicPostRoutes);
app.use('/api/admin/posts', adminPostRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;