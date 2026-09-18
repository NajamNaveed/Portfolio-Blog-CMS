const mongoose = require('mongoose');

const jobShareLinkSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      trim: true,
      default: '',
      maxlength: 100,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    passcodeHash: {
      type: String,
      default: null,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    lastViewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

jobShareLinkSchema.index({ token: 1 }, { unique: true });

module.exports = mongoose.model('JobShareLink', jobShareLinkSchema);
