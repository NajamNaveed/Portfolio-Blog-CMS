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

function matchesWorkType(job, workType) {
  if (workType === 'remote') return job.remote;
  if (workType === 'onsite') return !job.remote;
  return true; // 'both'
}

function matchesLocation(job, locations) {
  if (job.remote) return true; // location filter only applies to on-site roles
  if (!locations?.length) return true;
  const haystack = normalize(job.location);
  return locations.some((loc) => haystack.includes(normalize(loc)));
}

// Applies the admin's saved criteria to raw listings and tags each
// survivor with a stable dedupeKey, before anything is sent to the AI
// pass or written to the database.
function filterJobsByCriteria(jobs, criteria) {
  return jobs
    .filter((job) => job.title && job.company && job.url)
    .filter((job) => matchesAnyKeyword(job, criteria.keywords))
    .filter((job) => matchesNoExcluded(job, criteria.excludeKeywords))
    .filter((job) => matchesWorkType(job, criteria.workType))
    .filter((job) => matchesLocation(job, criteria.locations))
    .map((job) => ({ ...job, dedupeKey: buildDedupeKey(job) }));
}

module.exports = { filterJobsByCriteria, buildDedupeKey, normalize };
