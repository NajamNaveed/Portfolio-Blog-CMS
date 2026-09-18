const mongoose = require('mongoose');

const ALLOWED_EVENTS = ['resume_download', 'contact_cta', 'view_projects_cta', 'project_view', 'hero_cta'];

const analyticsEventSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    enum: ALLOWED_EVENTS,
  },
  path: {
    type: String,
    trim: true,
    default: '',
    maxlength: 200,
  },
  meta: {
    type: String,
    trim: true,
    default: '',
    maxlength: 200,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-expire after 180 days — this is lightweight usage-trend tracking,
// not a data warehouse, so the collection shouldn't grow unbounded.
analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });
analyticsEventSchema.index({ event: 1, createdAt: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
module.exports.ALLOWED_EVENTS = ALLOWED_EVENTS;
