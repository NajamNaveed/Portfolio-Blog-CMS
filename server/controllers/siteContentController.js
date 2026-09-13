const SiteContent = require('../models/SiteContent');
const { getOrCreateSiteContent } = SiteContent;
const asyncHandler = require('../utils/asyncHandler');
const { validateSiteContentInput } = require('../utils/validateSiteContent');

const getPublicSiteContent = asyncHandler(async (req, res) => {
  const content = await getOrCreateSiteContent();
  res.status(200).json({ success: true, content });
});

const getAdminSiteContent = asyncHandler(async (req, res) => {
  const content = await getOrCreateSiteContent();
  res.status(200).json({ success: true, content });
});

// Deep-merges only the allowed, validated nested objects/arrays onto the
// existing singleton — arrays (focusAreas, skills, socialLinks) are
// replaced wholesale when provided, since partial array edits are
// meaningless without item identifiers from the client.
const updateSiteContent = asyncHandler(async (req, res) => {
  const errors = validateSiteContentInput(req.body);
  if (errors.length) {
    const error = new Error(errors.join('; '));
    error.statusCode = 400;
    throw error;
  }

  const content = await getOrCreateSiteContent();
  const { brand, hero, about, focusAreas, skills, socialLinks, contact, footer } = req.body;

  if (brand) Object.assign(content.brand, brand);
  if (hero) {
    const { primaryCta, secondaryCta, ...rest } = hero;
    Object.assign(content.hero, rest);
    if (primaryCta) Object.assign(content.hero.primaryCta, primaryCta);
    if (secondaryCta) Object.assign(content.hero.secondaryCta, secondaryCta);
  }
  if (about) Object.assign(content.about, about);
  if (focusAreas) content.focusAreas = focusAreas;
  if (skills) content.skills = skills;
  if (socialLinks) content.socialLinks = socialLinks;
  if (contact) Object.assign(content.contact, contact);
  if (footer) Object.assign(content.footer, footer);

  await content.save();

  res.status(200).json({ success: true, content });
});

module.exports = { getPublicSiteContent, getAdminSiteContent, updateSiteContent };
