const { getOrCreateSiteContent } = require('../models/SiteContent');
const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');
const { callAI, isAIConfigured } = require('../services/aiClient');

const MAX_QUESTION_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 6;

function fail(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
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

  res.status(200).json({ success: true, answer: answer.trim() || "Sorry, I couldn't come up with an answer to that." });
});

module.exports = { askAboutWork };
