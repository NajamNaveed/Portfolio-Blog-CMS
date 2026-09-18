const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b';
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

async function callGroq({ system, prompt, temperature, maxTokens }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured');

  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt });

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Groq API request failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callGemini({ system, prompt, temperature, maxTokens }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature, maxOutputTokens: maxTokens },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Gemini API request failed (${res.status}): ${errBody.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
}

// Every AI-powered feature in this project (job filtering, the "ask about
// my work" widget, project-draft-from-repo) goes through this one
// function, switching provider via AI_PROVIDER=groq|gemini. This means
// swapping providers — e.g. if one free tier runs low, or a model gets
// deprecated — is a single env var change, not a code change.
async function callAI({ system, prompt, temperature = 0.3, maxTokens = 1024 }) {
  const provider = (process.env.AI_PROVIDER || 'groq').toLowerCase();
  if (provider === 'gemini') return callGemini({ system, prompt, temperature, maxTokens });
  return callGroq({ system, prompt, temperature, maxTokens });
}

function isAIConfigured() {
  const provider = (process.env.AI_PROVIDER || 'groq').toLowerCase();
  return provider === 'gemini' ? Boolean(process.env.GEMINI_API_KEY) : Boolean(process.env.GROQ_API_KEY);
}

module.exports = { callAI, isAIConfigured };
