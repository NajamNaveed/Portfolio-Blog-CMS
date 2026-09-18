const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const publicPostRoutes = require('./routes/publicPostRoutes');
const adminPostRoutes = require('./routes/adminPostRoutes');
const publicSiteContentRoutes = require('./routes/publicSiteContentRoutes');
const adminSiteContentRoutes = require('./routes/adminSiteContentRoutes');
const publicProjectRoutes = require('./routes/publicProjectRoutes');
const adminProjectRoutes = require('./routes/adminProjectRoutes');
const publicMessageRoutes = require('./routes/publicMessageRoutes');
const adminMessageRoutes = require('./routes/adminMessageRoutes');
const adminJobRoutes = require('./routes/adminJobRoutes');
const jobRunRoutes = require('./routes/jobRunRoutes');
const publicAskRoutes = require('./routes/publicAskRoutes');
const publicAnalyticsRoutes = require('./routes/publicAnalyticsRoutes');
const adminAnalyticsRoutes = require('./routes/adminAnalyticsRoutes');
const adminJobShareRoutes = require('./routes/adminJobShareRoutes');
const publicJobShareRoutes = require('./routes/publicJobShareRoutes');
const seoRoutes = require('./routes/seoRoutes');
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
app.use('/api/site-content', publicSiteContentRoutes);
app.use('/api/admin/site-content', adminSiteContentRoutes);
app.use('/api/projects', publicProjectRoutes);
app.use('/api/admin/projects', adminProjectRoutes);
app.use('/api/contact', publicMessageRoutes);
app.use('/api/admin/messages', adminMessageRoutes);
app.use('/api/admin/jobs', adminJobRoutes);
app.use('/api/jobs-cron', jobRunRoutes);
app.use('/api/ask', publicAskRoutes);
app.use('/api/analytics', publicAnalyticsRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/admin/job-shares', adminJobShareRoutes);
app.use('/api/shared/jobs', publicJobShareRoutes);
app.use('/', seoRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;