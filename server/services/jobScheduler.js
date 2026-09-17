const { getOrCreateJobCriteria } = require('../models/JobCriteria');
const { runJobFetchPipeline } = require('./jobPipeline');

const CHECK_INTERVAL_MS = 30 * 1000; // check twice a minute so a slow tick can't skip the target minute

let lastRunKey = null;
let isRunning = false;

function getTimeParts(timeZone) {
  const now = new Date();
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);
  const date = new Intl.DateTimeFormat('en-CA', { timeZone }).format(now); // YYYY-MM-DD
  return { time, date };
}

async function tick() {
  if (isRunning) return; // don't overlap with a run still in progress

  try {
    const criteria = await getOrCreateJobCriteria();
    const timeZone = process.env.JOB_SCHEDULE_TIMEZONE || 'UTC';
    const { time, date } = getTimeParts(timeZone);
    const runKey = `${date}T${time}`;

    if (time === criteria.scheduleTime && runKey !== lastRunKey) {
      lastRunKey = runKey;
      isRunning = true;
      console.log(`[jobScheduler] scheduled time ${criteria.scheduleTime} (${timeZone}) reached — running job fetch...`);
      try {
        const summary = await runJobFetchPipeline();
        console.log(`[jobScheduler] run complete: ${summary.inserted} new job(s) added.`);
      } catch (err) {
        console.error('[jobScheduler] run failed:', err.message);
      } finally {
        isRunning = false;
      }
    }
  } catch (err) {
    console.error('[jobScheduler] tick failed:', err.message);
  }
}

// Only relevant while this Node process stays running continuously — on
// a host that sleeps when idle (e.g. Render's free tier), this timer
// simply won't fire while asleep, which is why the GitHub Actions +
// secret-token endpoint approach exists for that case. This scheduler is
// for local development and any always-on host.
function startJobScheduler() {
  console.log(
    `[jobScheduler] started — checking every ${CHECK_INTERVAL_MS / 1000}s against your saved schedule time (timezone: ${
      process.env.JOB_SCHEDULE_TIMEZONE || 'UTC'
    }). This only runs automatically while this server process stays up.`
  );
  setInterval(tick, CHECK_INTERVAL_MS);
}

module.exports = { startJobScheduler };
