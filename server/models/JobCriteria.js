const mongoose = require('mongoose');

const locationFilterSchema = new mongoose.Schema(
  {
    country: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' }, // optional
    city: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const jobCriteriaSchema = new mongoose.Schema(
  {
    mustKeywords: {
      // A listing must match at least one of these (title/description/tags)
      // to be considered at all — a hard filter.
      type: [String],
      default: [],
    },
    niceKeywords: {
      // Not a filter — passed to the AI pass as a "prefer these" signal so
      // it can rank/boost otherwise-qualifying listings that also mention
      // these, without excluding ones that don't.
      type: [String],
      default: [],
    },
    workType: {
      type: String,
      enum: ['remote', 'onsite', 'both'],
      default: 'both',
    },
    locations: {
      // Structured, so the admin can filter by country alone, or narrow to
      // a state/city — state is optional, city is optional. Only applied
      // to on-site listings; remote jobs ignore this entirely.
      type: [locationFilterSchema],
      default: [],
    },
    excludeKeywords: {
      type: [String],
      default: [],
    },
    excludeCompanies: {
      // Case-insensitive substring blocklist — a quick "block this company"
      // action from a job card appends here.
      type: [String],
      default: [],
    },
    sources: {
      type: [String],
      enum: ['remotive', 'remoteok', 'arbeitnow', 'jobicy', 'himalayas', 'weworkremotely'],
      default: ['remotive', 'remoteok', 'arbeitnow', 'jobicy', 'himalayas', 'weworkremotely'],
    },
    scheduleTime: {
      // 24h "HH:mm" — read by the local scheduler (server/services/jobScheduler.js)
      // in the timezone set by JOB_SCHEDULE_TIMEZONE. Also used as a
      // reminder value for whatever you set in the GitHub Actions cron file.
      type: String,
      default: '09:00',
    },
    autoFetchEnabled: {
      // Turns off BOTH the local scheduler and the external GitHub
      // Actions cron trigger. The admin "Run Now" button always works
      // regardless of this flag, since that's an explicit manual action.
      type: Boolean,
      default: true,
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