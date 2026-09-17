const Job = require('../models/Job');
const { getOrCreateJobCriteria } = require('../models/JobCriteria');
const { fetchFromSources } = require('./jobSources');
const { filterJobsByCriteria } = require('./jobMatcher');
const { filterJobsWithAI } = require('./aiJobFilter');

async function runJobFetchPipeline() {
  const criteria = await getOrCreateJobCriteria();
  const errors = [];

  const { jobs: rawJobs, errors: sourceErrors } = await fetchFromSources(criteria.sources);
  errors.push(...sourceErrors);

  const candidates = filterJobsByCriteria(rawJobs, criteria);

  // Drop anything we've already seen before spending an AI call on it.
  const existingKeys = new Set(
    (await Job.find({ dedupeKey: { $in: candidates.map((c) => c.dedupeKey) } }).select('dedupeKey').lean()).map(
      (j) => j.dedupeKey
    )
  );
  const newCandidates = candidates.filter((job) => !existingKeys.has(job.dedupeKey));

  const { results: aiFiltered, errors: aiErrors } = await filterJobsWithAI(
    newCandidates,
    criteria,
    process.env.GROQ_API_KEY
  );
  errors.push(...aiErrors);

  let inserted = 0;
  for (const job of aiFiltered) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await Job.create({
        title: job.title.slice(0, 200),
        company: job.company.slice(0, 150),
        location: job.location || '',
        remote: Boolean(job.remote),
        url: job.url,
        description: job.description || '',
        tags: job.tags || [],
        source: job.source,
        dedupeKey: job.dedupeKey,
        postedAt: job.postedAt,
        aiScore: job.aiScore,
        aiReason: job.aiReason,
      });
      inserted += 1;
    } catch (err) {
      // Duplicate key races (two candidates normalizing to the same key
      // within one run) are expected and harmless; anything else is worth
      // surfacing in the run summary.
      if (err.code !== 11000) errors.push(`Insert failed for "${job.title}": ${err.message}`);
    }
  }

  const summary = {
    fetched: rawJobs.length,
    matchedCriteria: candidates.length,
    newCandidates: newCandidates.length,
    inserted,
    errors,
    ranAt: new Date(),
  };

  criteria.lastRunAt = summary.ranAt;
  criteria.lastRunSummary = `Fetched ${summary.fetched}, ${summary.matchedCriteria} matched your criteria, ${summary.inserted} new job(s) added.${
    errors.length ? ` (${errors.length} warning(s) - see server logs.)` : ''
  }`;
  await criteria.save();

  if (errors.length) {
    // eslint-disable-next-line no-console
    console.warn('[jobPipeline] completed with warnings:', errors);
  }

  return summary;
}

module.exports = { runJobFetchPipeline };
