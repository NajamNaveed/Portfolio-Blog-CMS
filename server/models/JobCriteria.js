const mongoose = require('mongoose');

const jobCriteriaSchema = new mongoose.Schema(
  {
    keywords: {
      // e.g. ["React", "Node.js", "Full Stack"] — a listing must match
      // at least one to be considered at the fetch stage (the AI pass
      // does the finer-grained judgment call after that).
      type: [String],
      default: [],
    },
    workType: {
      type: String,
      enum: ['remote', 'onsite', 'both'],
      default: 'both',
    },
    locations: {
      // Only relevant for on-site matching (Arbeitnow supports a location
      // filter); ignored for remote-only sources.
      type: [String],
      default: [],
    },
    excludeKeywords: {
      type: [String],
      default: [],
    },
    sources: {
      type: [String],
      enum: ['remotive', 'remoteok', 'arbeitnow', 'jobicy'],
      default: ['remotive', 'remoteok', 'arbeitnow', 'jobicy'],
    },
    scheduleTime: {
      // 24h "HH:mm" the admin wants the daily fetch to run — informational
      // for now (used to configure the external GitHub Actions cron), not
      // enforced by the server itself, since a sleeping free-tier host
      // can't run its own internal timer reliably.
      type: String,
      default: '09:00',
    },
    lastRunAt: {
      type: Date,
      default: null,
    },
    lastRunSummary: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

async function getOrCreateJobCriteria() {
  let criteria = await JobCriteria.findOne();
  if (!criteria) {
    criteria = await JobCriteria.create({});
  }
  return criteria;
}

const JobCriteria = mongoose.model('JobCriteria', jobCriteriaSchema);

module.exports = JobCriteria;
module.exports.getOrCreateJobCriteria = getOrCreateJobCriteria;
