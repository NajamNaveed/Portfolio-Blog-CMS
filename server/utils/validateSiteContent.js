const ALLOWED_TOP_FIELDS = ['brand', 'hero', 'about', 'focusAreas', 'skills', 'socialLinks', 'contact', 'footer'];

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isNonEmptyString(value, maxLength) {
  return typeof value === 'string' && value.trim().length > 0 && (!maxLength || value.length <= maxLength);
}

function isOptionalString(value, maxLength) {
  return value === undefined || value === null || value === '' || (typeof value === 'string' && value.length <= maxLength);
}

// Every branch below only checks fields that are present — the endpoint
// accepts partial updates, merging onto the existing singleton document.
function validateSiteContentInput(body) {
  const errors = [];

  if (!isPlainObject(body)) return ['Request body must be a JSON object'];

  const unexpectedFields = Object.keys(body).filter((field) => !ALLOWED_TOP_FIELDS.includes(field));
  if (unexpectedFields.length) errors.push(`Unexpected field(s): ${unexpectedFields.join(', ')}`);

  if (body.brand !== undefined) {
    if (!isPlainObject(body.brand)) errors.push('brand must be an object');
    else {
      if (body.brand.name !== undefined && !isOptionalString(body.brand.name, 120)) errors.push('brand.name is invalid');
      if (body.brand.role !== undefined && !isOptionalString(body.brand.role, 120)) errors.push('brand.role is invalid');
    }
  }

  if (body.hero !== undefined) {
    if (!isPlainObject(body.hero)) {
      errors.push('hero must be an object');
    } else {
      const { eyebrow, headline, roles, description, primaryCta, secondaryCta } = body.hero;
      if (eyebrow !== undefined && !isOptionalString(eyebrow, 120)) errors.push('hero.eyebrow is invalid');
      if (headline !== undefined && !isOptionalString(headline, 150)) errors.push('hero.headline is invalid');
      if (description !== undefined && !isOptionalString(description, 1000)) errors.push('hero.description is invalid');
      if (roles !== undefined) {
        if (!Array.isArray(roles) || roles.length > 10 || !roles.every((r) => isNonEmptyString(r, 80))) {
          errors.push('hero.roles must be an array of up to 10 short strings');
        }
      }
      [
        ['primaryCta', primaryCta],
        ['secondaryCta', secondaryCta],
      ].forEach(([key, cta]) => {
        if (cta !== undefined) {
          if (!isPlainObject(cta)) errors.push(`hero.${key} must be an object`);
          else {
            if (cta.label !== undefined && !isOptionalString(cta.label, 60)) errors.push(`hero.${key}.label is invalid`);
            if (cta.href !== undefined && !isOptionalString(cta.href, 300)) errors.push(`hero.${key}.href is invalid`);
          }
        }
      });
    }
  }

  if (body.about !== undefined) {
    if (!isPlainObject(body.about)) {
      errors.push('about must be an object');
    } else {
      const { intro, approachTitle, approachText, resumeUrl, yearsExperience, projectsCompleted } = body.about;
      if (intro !== undefined && !isOptionalString(intro, 2000)) errors.push('about.intro is invalid');
      if (approachTitle !== undefined && !isOptionalString(approachTitle, 120)) errors.push('about.approachTitle is invalid');
      if (approachText !== undefined && !isOptionalString(approachText, 2000)) errors.push('about.approachText is invalid');
      if (resumeUrl !== undefined && !isOptionalString(resumeUrl, 500)) errors.push('about.resumeUrl is invalid');
      if (yearsExperience !== undefined && (typeof yearsExperience !== 'number' || yearsExperience < 0 || yearsExperience > 80)) {
        errors.push('about.yearsExperience must be a number between 0 and 80');
      }
      if (
        projectsCompleted !== undefined &&
        (typeof projectsCompleted !== 'number' || projectsCompleted < 0 || projectsCompleted > 100000)
      ) {
        errors.push('about.projectsCompleted must be a valid number');
      }
    }
  }

  if (body.focusAreas !== undefined) {
    if (!Array.isArray(body.focusAreas) || body.focusAreas.length > 12) {
      errors.push('focusAreas must be an array of up to 12 items');
    } else {
      body.focusAreas.forEach((area, i) => {
        if (!isPlainObject(area) || !isNonEmptyString(area.title, 120) || !isNonEmptyString(area.description, 400)) {
          errors.push(`focusAreas[${i}] must include a title and description`);
        }
        if (area?.icon !== undefined && !isOptionalString(area.icon, 60)) errors.push(`focusAreas[${i}].icon is invalid`);
      });
    }
  }

  if (body.skills !== undefined) {
    if (!Array.isArray(body.skills) || body.skills.length > 12) {
      errors.push('skills must be an array of up to 12 groups');
    } else {
      body.skills.forEach((group, i) => {
        if (!isPlainObject(group) || !isNonEmptyString(group.label, 60)) {
          errors.push(`skills[${i}] must include a label`);
        }
        if (!Array.isArray(group?.items) || group.items.length > 40) {
          errors.push(`skills[${i}].items must be an array of up to 40 items`);
        } else {
          group.items.forEach((item, j) => {
            if (!isPlainObject(item) || !isNonEmptyString(item.name, 60) || !isNonEmptyString(item.icon, 60)) {
              errors.push(`skills[${i}].items[${j}] must include a name and icon`);
            }
          });
        }
      });
    }
  }

  if (body.socialLinks !== undefined) {
    if (!Array.isArray(body.socialLinks) || body.socialLinks.length > 20) {
      errors.push('socialLinks must be an array of up to 20 items');
    } else {
      body.socialLinks.forEach((link, i) => {
        if (!isPlainObject(link) || !isNonEmptyString(link.label, 60) || !isNonEmptyString(link.url, 500) || !isNonEmptyString(link.icon, 60)) {
          errors.push(`socialLinks[${i}] must include a label, url, and icon`);
        }
      });
    }
  }

  if (body.contact !== undefined) {
    if (!isPlainObject(body.contact)) {
      errors.push('contact must be an object');
    } else {
      const { email, phone, location, availability } = body.contact;
      if (email !== undefined && !isOptionalString(email, 254)) errors.push('contact.email is invalid');
      if (phone !== undefined && !isOptionalString(phone, 40)) errors.push('contact.phone is invalid');
      if (location !== undefined && !isOptionalString(location, 120)) errors.push('contact.location is invalid');
      if (availability !== undefined && !isOptionalString(availability, 120)) errors.push('contact.availability is invalid');
    }
  }

  if (body.footer !== undefined) {
    if (!isPlainObject(body.footer)) errors.push('footer must be an object');
    else if (body.footer.tagline !== undefined && !isOptionalString(body.footer.tagline, 300)) {
      errors.push('footer.tagline is invalid');
    }
  }

  return errors;
}

module.exports = { validateSiteContentInput };
