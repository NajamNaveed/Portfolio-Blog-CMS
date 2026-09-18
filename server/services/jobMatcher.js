function normalize(str = '') {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function buildDedupeKey(job) {
  return `${normalize(job.company)}::${normalize(job.title)}`.slice(0, 300);
}

function matchesAnyKeyword(job, keywords) {
  if (!keywords?.length) return true;
  const haystack = normalize(`${job.title} ${job.description} ${(job.tags || []).join(' ')}`);
  return keywords.some((kw) => haystack.includes(normalize(kw)));
}

function matchesNoExcluded(job, excludeKeywords) {
  if (!excludeKeywords?.length) return true;
  const haystack = normalize(`${job.title} ${job.description}`);
  return !excludeKeywords.some((kw) => haystack.includes(normalize(kw)));
}

function matchesCompanyBlocklist(job, excludeCompanies) {
  if (!excludeCompanies?.length) return true;
  const company = normalize(job.company);
  return !excludeCompanies.some((blocked) => company.includes(normalize(blocked)));
}

function matchesWorkType(job, workType) {
  if (workType === 'remote') return job.remote;
  if (workType === 'onsite') return !job.remote;
  return true; // 'both'
}

// Only applies to on-site roles — remote jobs skip location matching
// entirely, since "location" for a remote job is usually meaningless
// ("Worldwide", a HQ address, etc.). Each saved location filter can
// specify country only, country+state, or country+city — every field
// that IS specified on a given filter entry must match (AND), but a job
// only needs to satisfy ONE filter entry (OR) to pass, since the admin
// might list several acceptable cities/countries.
function matchesLocation(job, locations) {
  if (job.remote) return true;
  if (!locations?.length) return true;

  const haystack = normalize(job.location);

  return locations.some((loc) => {
    const parts = [loc.country, loc.state, loc.city].filter((p) => p && p.trim());
    if (!parts.length) return true; // an empty filter entry matches everything
    return parts.every((part) => haystack.includes(normalize(part)));
  });
}

// Applies the admin's saved criteria to raw listings and tags each
// survivor with a stable dedupeKey, before anything is sent to the AI
// pass or written to the database.
function filterJobsByCriteria(jobs, criteria) {
  return jobs
    .filter((job) => job.title && job.company && job.url)
    .filter((job) => matchesAnyKeyword(job, criteria.mustKeywords))
    .filter((job) => matchesNoExcluded(job, criteria.excludeKeywords))
    .filter((job) => matchesCompanyBlocklist(job, criteria.excludeCompanies))
    .filter((job) => matchesWorkType(job, criteria.workType))
    .filter((job) => matchesLocation(job, criteria.locations))
    .map((job) => ({ ...job, dedupeKey: buildDedupeKey(job) }));
}

// Cheap, dependency-free near-duplicate detector: token (word) overlap
// ratio between two titles, from the same or a very similarly-named
// company. Catches "Senior React Developer" vs "Senior React Dev" style
// re-posts that an exact dedupeKey match would miss.
function titleSimilarity(a, b) {
  const tokensA = new Set(normalize(a).split(' ').filter(Boolean));
  const tokensB = new Set(normalize(b).split(' ').filter(Boolean));
  if (!tokensA.size || !tokensB.size) return 0;
  let shared = 0;
  tokensA.forEach((t) => {
    if (tokensB.has(t)) shared += 1;
  });
  return shared / Math.max(tokensA.size, tokensB.size);
}

function isLikelyDuplicate(candidate, existingJob, { titleThreshold = 0.75 } = {}) {
  const sameCompany = normalize(candidate.company) === normalize(existingJob.company);
  if (!sameCompany) return false;
  return titleSimilarity(candidate.title, existingJob.title) >= titleThreshold;
}

module.exports = {
  filterJobsByCriteria,
  buildDedupeKey,
  normalize,
  titleSimilarity,
  isLikelyDuplicate,
};
