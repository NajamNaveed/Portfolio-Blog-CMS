const mongoose = require('mongoose');

const askUsageSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
  },
  date: {
    // "YYYY-MM-DD" (UTC) — a plain day bucket is all this needs; exact
    // timezone of the reset doesn't matter for an abuse-prevention cap.
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

askUsageSchema.index({ ip: 1, date: 1 }, { unique: true });
// Auto-clean old daily counters after 3 days — nothing needs them past
// that. TTL indexes only work on a Date field, hence the separate
// createdAt rather than expiring on the "YYYY-MM-DD" string field.
askUsageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 });

module.exports = mongoose.model('AskUsage', askUsageSchema);
