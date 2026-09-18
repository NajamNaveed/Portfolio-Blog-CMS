const Job = require('../models/Job');

const CHECK_LIMIT = 15; // keep each pipeline run fast; the rest get caught on a later run
const RECHECK_AFTER_DAYS = 3;
const REQUEST_TIMEOUT_MS = 6000;

async function urlLooksDead(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
    return res.status === 404 || res.status === 410;
  } catch {
    // Network errors, timeouts, or sites that block HEAD requests are
    // inconclusive, not proof the posting is gone — never mark expired
    // on inconclusive evidence.
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

// Rechecks a small batch of not-recently-checked, still-active jobs each
// run and flips `expired` for any whose link now 404s/410s. Deliberately
// conservative: a failed/ambiguous check never marks a job expired,
// since removing someone's real lead is worse than leaving a stale one.
async function checkStaleJobs() {
  const cutoff = new Date(Date.now() - RECHECK_AFTER_DAYS * 24 * 60 * 60 * 1000);

  const candidates = await Job.find({
    expired: false,
    status: { $in: ['new', 'interested'] },
    $or: [{ expiredCheckedAt: null }, { expiredCheckedAt: { $lt: cutoff } }],
  })
    .sort({ expiredCheckedAt: 1 })
    .limit(CHECK_LIMIT)
    .select('_id url');

  let expiredCount = 0;

  for (const job of candidates) {
    // eslint-disable-next-line no-await-in-loop
    const dead = await urlLooksDead(job.url);
    // eslint-disable-next-line no-await-in-loop
    await Job.updateOne({ _id: job._id }, { expiredCheckedAt: new Date(), ...(dead ? { expired: true } : {}) });
    if (dead) expiredCount += 1;
  }

  return { checked: candidates.length, expiredCount };
}

module.exports = { checkStaleJobs };
