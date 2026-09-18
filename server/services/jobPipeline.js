const Job = require('../models/Job');
const { getOrCreateJobCriteria } = require('../models/JobCriteria');
const { fetchFromSources } = require('./jobSources');
const { filterJobsByCriteria, isLikelyDuplicate } = require('./jobMatcher');
const { filterJobsWithAI } = require('./aiJobFilter');
const { checkStaleJobs } = require('./staleJobChecker');
const { sendTelegramMessage } = require('./notifyTelegram');

const FUZZY_DEDUPE_WINDOW_DAYS = 45;

async function runJobFetchPipeline() {
  const criteria = await getOrCreateJobCriteria();
  const errors = [];

  const { jobs: rawJobs, errors: sourceErrors } = await fetchFromSources(criteria.sources);
  errors.push(...sourceErrors);

  const candidates = filterJobsByCriteria(rawJobs, criteria);

  // Exact dedupe first (cheap, indexed).
  const existingKeys = new Set(
    (await Job.find({ dedupeKey: { $in: candidates.map((c) => c.dedupeKey) } }).select('dedupeKey').lean()).map(
      (j) => j.dedupeKey
    )
  );
  const notExactDuplicates = candidates.filter((job) => !existingKeys.has(job.dedupeKey));

  // Fuzzy dedupe second: catches re-posts of the same role with slightly
  // reworded titles that an exact key match wouldn't. Only compared
  // against recent jobs (not the whole history) to keep this fast.
  const recentJobs = await Job.find({ createdAt: { $gte: new Date(Date.now() - FUZZY_DEDUPE_WINDOW_DAYS * 86400000) } })
    .select('title company')
    .lean();

  const newCandidates = notExactDuplicates.filter(
    (candidate) => !recentJobs.some((existing) => isLikelyDuplicate(candidate, existing))
  );

  const { results: aiFiltered, errors: aiErrors } = await filterJobsWithAI(newCandidates, criteria);
  errors.push(...aiErrors);

  let inserted = 0;
  const insertedJobs = [];
  for (const job of aiFiltered) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const created = await Job.create({
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
      insertedJobs.push(created);
    } catch (err) {
      // Duplicate key races (two candidates normalizing to the same key
      // within one run) are expected and harmless; anything else is worth
      // surfacing in the run summary.
      if (err.code !== 11000) errors.push(`Insert failed for "${job.title}": ${err.message}`);
    }
  }

  // Keep the listing free of dead links — conservative, small batch,
  // never blocks the main insert flow above.
  let staleResult = { checked: 0, expiredCount: 0 };
  try {
    staleResult = await checkStaleJobs();
  } catch (err) {
    errors.push(`Stale check failed: ${err.message}`);
  }

  const summary = {
    fetched: rawJobs.length,
    matchedCriteria: candidates.length,
    newCandidates: newCandidates.length,
    inserted,
    staleChecked: staleResult.checked,
    staleExpired: staleResult.expiredCount,
    errors,
    ranAt: new Date(),
  };

  criteria.lastRunAt = summary.ranAt;
  criteria.lastRunSummary = `Fetched ${summary.fetched}, ${summary.matchedCriteria} matched your criteria, ${summary.inserted} new job(s) added, ${summary.staleExpired} marked expired.${
    errors.length ? ` (${errors.length} warning(s) - see server logs.)` : ''
  }`;
  await criteria.save();

  if (errors.length) {
    // eslint-disable-next-line no-console
    console.warn('[jobPipeline] completed with warnings:', errors);
  }

  if (inserted > 0) {
    const preview = insertedJobs
      .slice(0, 5)
      .map((j) => `• ${j.title} — ${j.company}`)
      .join('\n');
    const more = insertedJobs.length > 5 ? `\n...and ${insertedJobs.length - 5} more` : '';
    await sendTelegramMessage(
      `🧭 Job fetch complete: ${inserted} new job(s) matched your criteria.\n\n${preview}${more}`
    );
  }

  return summary;
}

module.exports = { runJobFetchPipeline };
