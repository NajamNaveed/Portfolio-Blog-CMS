const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    longDescription: {
      type: String,
      trim: true,
      default: '',
    },
    technologies: {
      type: [String],
      default: [],
    },
    coverImage: {
      type: String,
      trim: true,
      default: null,
    },
    githubUrl: {
      type: String,
      trim: true,
      default: null,
    },
    liveUrl: {
      type: String,
      trim: true,
      default: null,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

projectSchema.index({ status: 1, order: 1, publishedAt: -1 });
projectSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
