const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    remote: {
      type: Boolean,
      default: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      required: true,
      enum: ['remotive', 'remoteok', 'arbeitnow', 'jobicy'],
    },
    // Stable identity for dedup even if the same role gets re-posted with
    // slightly different wording — normalized "company::title". Uniqueness
    // is enforced via the schema.index() call below, not here.
    dedupeKey: {
      type: String,
      required: true,
    },
    postedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['new', 'interested', 'applied', 'rejected', 'hidden'],
      default: 'new',
    },
    aiScore: {
      type: Number,
      default: null,
    },
    aiReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

jobSchema.index({ dedupeKey: 1 }, { unique: true });
jobSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
