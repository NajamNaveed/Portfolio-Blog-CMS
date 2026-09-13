const mongoose = require('mongoose');

// Singleton document — every field the public site renders outside of
// blog posts and projects lives here, so the admin can control the whole
// portfolio (hero, about, focus areas, skills, socials, contact info,
// footer) without touching code. Only one document of this collection
// should ever exist; getOrCreateSiteContent() below enforces that.

const ctaSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: '' },
    href: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const focusAreaSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true, maxlength: 120 },
    description: { type: String, trim: true, required: true, maxlength: 400 },
    icon: { type: String, trim: true, default: 'Code2' },
  },
  { _id: false }
);

const skillItemSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true, maxlength: 60 },
    icon: { type: String, trim: true, required: true, maxlength: 60 },
  },
  { _id: false }
);

const skillGroupSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, required: true, maxlength: 60 },
    items: { type: [skillItemSchema], default: [] },
  },
  { _id: false }
);

const socialLinkSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, required: true, maxlength: 60 },
    url: { type: String, trim: true, required: true, maxlength: 500 },
    icon: { type: String, trim: true, required: true, maxlength: 60 },
  },
  { _id: false }
);

const siteContentSchema = new mongoose.Schema(
  {
    brand: {
      name: { type: String, trim: true, default: 'Najam Naveed' },
      role: { type: String, trim: true, default: 'Full Stack Developer' },
    },
    hero: {
      eyebrow: { type: String, trim: true, default: 'Full Stack Developer' },
      headline: { type: String, trim: true, default: 'Najam Naveed' },
      roles: { type: [String], default: ['Full Stack Developer', 'React & Node Engineer'] },
      description: { type: String, trim: true, default: '' },
      primaryCta: { type: ctaSchema, default: () => ({ label: 'View Projects', href: '/projects' }) },
      secondaryCta: { type: ctaSchema, default: () => ({ label: 'Get In Touch', href: '/contact' }) },
    },
    about: {
      intro: { type: String, trim: true, default: '' },
      approachTitle: { type: String, trim: true, default: 'Approach' },
      approachText: { type: String, trim: true, default: '' },
      resumeUrl: { type: String, trim: true, default: '' },
      yearsExperience: { type: Number, default: 0, min: 0, max: 80 },
      projectsCompleted: { type: Number, default: 0, min: 0, max: 100000 },
    },
    focusAreas: { type: [focusAreaSchema], default: [] },
    skills: { type: [skillGroupSchema], default: [] },
    socialLinks: { type: [socialLinkSchema], default: [] },
    contact: {
      email: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
      location: { type: String, trim: true, default: '' },
      availability: { type: String, trim: true, default: 'Open to new projects' },
    },
    footer: {
      tagline: { type: String, trim: true, default: '' },
    },
  },
  { timestamps: true }
);

async function getOrCreateSiteContent() {
  let content = await SiteContent.findOne();
  if (!content) {
    content = await SiteContent.create({});
  }
  return content;
}

const SiteContent = mongoose.model('SiteContent', siteContentSchema);

module.exports = SiteContent;
module.exports.getOrCreateSiteContent = getOrCreateSiteContent;
