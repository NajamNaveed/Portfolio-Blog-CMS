// Each fetcher hits a free, keyless job board API and returns listings
// normalized to: { title, company, location, remote, url, description,
// tags, source, postedAt }. None of these require an API key — Adzuna
// was intentionally left out since it does.

const FETCH_TIMEOUT_MS = 12000;

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(`Request to ${url} failed with status ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

function stripHtml(html = '') {
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000);
}

async function fetchRemotive() {
  const data = await fetchJson('https://remotive.com/api/remote-jobs?limit=100');
  return (data.jobs || []).map((job) => ({
    title: job.title,
    company: job.company_name,
    location: job.candidate_required_location || 'Remote',
    remote: true,
    url: job.url,
    description: stripHtml(job.description),
    tags: job.tags || [],
    source: 'remotive',
    postedAt: job.publication_date ? new Date(job.publication_date) : null,
  }));
}

async function fetchRemoteOK() {
  const data = await fetchJson('https://remoteok.com/api', {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortfolioJobFetcher/1.0)' },
  });
  // The first array element is a legal-notice object, not a job.
  const jobs = Array.isArray(data) ? data.slice(1) : [];
  return jobs
    .filter((job) => job && job.position)
    .map((job) => ({
      title: job.position,
      company: job.company,
      location: job.location || 'Remote',
      remote: true,
      url: job.url?.startsWith('http') ? job.url : `https://remoteok.com${job.url || ''}`,
      description: stripHtml(job.description),
      tags: job.tags || [],
      source: 'remoteok',
      postedAt: job.date ? new Date(job.date) : null,
    }));
}

async function fetchArbeitnow() {
  const data = await fetchJson('https://www.arbeitnow.com/api/job-board-api');
  return (data.data || []).map((job) => ({
    title: job.title,
    company: job.company_name,
    location: job.location || (job.remote ? 'Remote' : ''),
    remote: Boolean(job.remote),
    url: job.url,
    description: stripHtml(job.description),
    tags: [...(job.tags || []), ...(job.job_types || [])],
    source: 'arbeitnow',
    postedAt: job.created_at ? new Date(job.created_at * 1000) : null,
  }));
}

async function fetchJobicy() {
  const data = await fetchJson('https://jobicy.com/api/v2/remote-jobs?count=100');
  return (data.jobs || []).map((job) => ({
    title: job.jobTitle,
    company: job.companyName,
    location: job.jobGeo || 'Remote',
    remote: true,
    url: job.url,
    description: stripHtml(job.jobExcerpt || job.jobDescription),
    tags: [...(job.jobIndustry || []), ...(job.jobType || [])],
    source: 'jobicy',
    postedAt: job.pubDate ? new Date(job.pubDate) : null,
  }));
}

async function fetchHimalayas() {
  // Himalayas hard-caps each page at 20 regardless of the `limit` param,
  // so two pages (offset 0 and 20) gets us up to 40 listings per run.
  const pages = await Promise.all(
    [0, 20].map((offset) => fetchJson(`https://himalayas.app/jobs/api?limit=20&offset=${offset}`))
  );
  const jobs = pages.flatMap((p) => p.jobs || []);
  return jobs.map((job) => ({
    title: job.title,
    company: job.companyName,
    location: (job.locationRestrictions || []).join(', ') || 'Worldwide',
    remote: true,
    url: job.applicationLink,
    description: stripHtml(job.excerpt || job.description || ''),
    tags: job.categories || [],
    source: 'himalayas',
    postedAt: job.publishedAt ? new Date(job.publishedAt * 1000) : null,
  }));
}

function parseRssItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match = itemRegex.exec(xml);
  while (match) {
    const block = match[1];
    const get = (tag) => {
      const tagMatch = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return tagMatch ? tagMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    };
    items.push({
      title: get('title'),
      link: get('link'),
      description: get('description'),
      pubDate: get('pubDate'),
      region: get('region'),
    });
    match = itemRegex.exec(xml);
  }
  return items;
}

async function fetchWeWorkRemotely() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let xml;
  try {
    const res = await fetch('https://weworkremotely.com/remote-jobs.rss', { signal: controller.signal });
    if (!res.ok) throw new Error(`WeWorkRemotely RSS request failed with status ${res.status}`);
    xml = await res.text();
  } finally {
    clearTimeout(timeout);
  }

  // WWR's RSS bakes the company into the title as "Company: Role" rather
  // than giving it as a separate field.
  return parseRssItems(xml).map((item) => {
    const [company, ...rest] = item.title.split(':');
    const title = rest.join(':').trim() || item.title;
    return {
      title,
      company: rest.length ? company.trim() : 'Unknown',
      location: item.region || 'Remote',
      remote: true,
      url: item.link,
      description: stripHtml(item.description),
      tags: [],
      source: 'weworkremotely',
      postedAt: item.pubDate ? new Date(item.pubDate) : null,
    };
  });
}

const SOURCE_FETCHERS = {
  remotive: fetchRemotive,
  remoteok: fetchRemoteOK,
  arbeitnow: fetchArbeitnow,
  jobicy: fetchJobicy,
  himalayas: fetchHimalayas,
  weworkremotely: fetchWeWorkRemotely,
};

// Fetches every requested source in parallel; a single source failing
// (rate limit, transient outage) doesn't abort the others.
async function fetchFromSources(sources) {
  const results = await Promise.allSettled(sources.map((key) => SOURCE_FETCHERS[key]?.() ?? Promise.resolve([])));

  const jobs = [];
  const errors = [];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      jobs.push(...result.value);
    } else {
      errors.push(`${sources[i]}: ${result.reason?.message || 'failed'}`);
    }
  });

  return { jobs, errors };
}

module.exports = { fetchFromSources, SOURCE_FETCHERS };
