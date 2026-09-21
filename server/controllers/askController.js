const { getOrCreateSiteContent } = require('../models/SiteContent');
const Project = require('../models/Project');
const AskUsage = require('../models/AskUsage');
const asyncHandler = require('../utils/asyncHandler');
const { callAI, isAIConfigured } = require('../services/aiClient');

const MAX_QUESTION_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 6;
const DAILY_LIMIT = Number(process.env.ASK_DAILY_LIMIT) || 15;

function fail(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD" (UTC)
}

// Backed by MongoDB rather than in-memory, so the cap survives server
// restarts — important on a free-tier host that sleeps/wakes often,
// where an in-memory counter would silently reset each time. Keyed by
// IP since there's no account system; not perfect (shared IPs, VPNs),
// but requires no login and can't be reset just by refreshing the page.
async function checkAndIncrementUsage(ip) {
  const date = todayKey();
  const existing = await AskUsage.findOne({ ip, date });

  if (existing && existing.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  const updated = await AskUsage.findOneAndUpdate(
    { ip, date },
    { $inc: { count: 1 } },
    { upsert: true, new: true }
  );

  return { allowed: true, remaining: Math.max(0, DAILY_LIMIT - updated.count) };
}

async function buildContext() {
  const [content, projects] = await Promise.all([
    getOrCreateSiteContent(),
    Project.find({ status: 'published' }).select('title description technologies githubUrl liveUrl').lean(),
  ]);

  const skillsList = (content.skills || []).map((g) => `${g.label}: ${g.items.map((i) => i.name).join(', ')}`).join('\n');
  const focusList = (content.focusAreas || []).map((f) => `- ${f.title}: ${f.description}`).join('\n');
  const projectList = projects
    .map((p) => `- ${p.title}: ${p.description} (Tech: ${(p.technologies || []).join(', ')})`)
    .join('\n');

  return `Name: ${content.brand?.name}
Role: ${content.brand?.role}
About: ${content.about?.intro}
Approach: ${content.about?.approachText}
Years of experience: ${content.about?.yearsExperience}

Skills:
${skillsList}

Focus areas:
${focusList}

Published projects:
${projectList || '(none published yet)'}

Contact: ${content.contact?.email || '(not public)'}`;
}

const askAboutWork = asyncHandler(async (req, res) => {
  if (!isAIConfigured()) {
    fail('The Q&A assistant is not configured yet.', 503);
  }

  const { question, history } = req.body || {};

  if (typeof question !== 'string' || !question.trim()) {
    fail('A question is required', 400);
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    fail(`Question cannot exceed ${MAX_QUESTION_LENGTH} characters`, 400);
  }

  const usage = await checkAndIncrementUsage(req.ip);
  if (!usage.allowed) {
    const error = new Error("You've reached today's question limit for this assistant. Please try again tomorrow.");
    error.statusCode = 429;
    throw error;
  }

  let historyText = '';
  if (Array.isArray(history)) {
    const recent = history
      .filter((m) => m && typeof m.role === 'string' && typeof m.content === 'string')
      .slice(-MAX_HISTORY_MESSAGES);
    historyText = recent.map((m) => `${m.role === 'user' ? 'Visitor' : 'You'}: ${m.content.slice(0, 400)}`).join('\n');
  }

  const context = await buildContext();

  const system = `You are answering questions on behalf of a real person, speaking as "I" — you are not a generic assistant. Only use the information below to answer. If asked something you don't have information about, say you don't have that detail rather than guessing. If asked something unrelated to this person's work/background/skills (e.g. general trivia, coding help unrelated to them, or anything inappropriate), politely redirect to topics about their work. Keep answers concise — a few sentences, not an essay.

INFORMATION ABOUT ME:
${context}`;

  const prompt = `${historyText ? `Conversation so far:\n${historyText}\n\n` : ''}Visitor's question: ${question.trim()}`;

  const answer = await callAI({ system, prompt, temperature: 0.4, maxTokens: 400 });

  res.status(200).json({
    success: true,
    answer: answer.trim() || "Sorry, I couldn't come up with an answer to that.",
    remaining: usage.remaining,
    dailyLimit: DAILY_LIMIT,
  });
});

module.exports = { askAboutWork };
