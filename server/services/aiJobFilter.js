const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-20b';
const BATCH_SIZE = 20;

function buildPrompt(criteria, batch) {
  const criteriaText = [
    `Keywords the person cares about: ${criteria.keywords?.join(', ') || '(none specified)'}`,
    `Work type wanted: ${criteria.workType}`,
    criteria.locations?.length ? `Acceptable on-site locations: ${criteria.locations.join(', ')}` : null,
    criteria.excludeKeywords?.length ? `Must NOT involve: ${criteria.excludeKeywords.join(', ')}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const listings = batch
    .map((job, i) => `${i}. Title: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nDescription: ${(job.description || '').slice(0, 500)}`)
    .join('\n---\n');

  return `You are screening job postings for one specific person based on their criteria below. For each listing, decide if it is a genuine, relevant, non-spam match worth showing them.

CRITERIA:
${criteriaText}

Reject listings that are: recruiting-agency spam with no real details, wildly unrelated to the keywords despite a coincidental keyword match, obvious duplicates of the same role, or missing basic information.

LISTINGS:
${listings}

Respond with ONLY a JSON array (no markdown, no commentary), one object per listing in the same order, each shaped exactly like:
{"index": 0, "keep": true, "score": 0.0, "reason": "short reason"}

"score" is your confidence this is a good match, from 0 to 1.`;
}

function extractJsonArray(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1) throw new Error('No JSON array found in AI response');
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function callGroq(prompt, apiKey) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Groq API request failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// Judges a list of candidate jobs against the criteria in small batches.
// If the AI call fails or returns something unparseable for a batch,
// that batch's jobs are kept as-is (score: null) rather than silently
// dropped — a broken AI pass should never delete real leads, only skip
// the extra filtering.
async function filterJobsWithAI(jobs, criteria, apiKey) {
  if (!apiKey || jobs.length === 0) {
    return { results: jobs.map((job) => ({ ...job, aiScore: null, aiReason: '' })), errors: apiKey ? [] : ['No AI API key configured — skipped AI filtering.'] };
  }

  const results = [];
  const errors = [];

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);
    try {
      // eslint-disable-next-line no-await-in-loop
      const content = await callGroq(buildPrompt(criteria, batch), apiKey);
      const verdicts = extractJsonArray(content);

      batch.forEach((job, idx) => {
        const verdict = verdicts.find((v) => v.index === idx);
        if (!verdict || verdict.keep !== false) {
          results.push({ ...job, aiScore: verdict?.score ?? null, aiReason: verdict?.reason || '' });
        }
      });
    } catch (err) {
      errors.push(`AI filtering batch ${i / BATCH_SIZE + 1}: ${err.message}`);
      batch.forEach((job) => results.push({ ...job, aiScore: null, aiReason: '' }));
    }
  }

  return { results, errors };
}

module.exports = { filterJobsWithAI };
