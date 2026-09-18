const express = require('express');
const Post = require('../models/Post');
const Project = require('../models/Project');

const router = express.Router();

function getSiteUrl() {
  // The public frontend's own URL (e.g. https://najamnaveed.com), not
  // this API's URL — sitemap entries must point at the pages a crawler
  // can actually render.
  return (process.env.PUBLIC_SITE_URL || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
}

router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const siteUrl = getSiteUrl();

    const [posts, projects] = await Promise.all([
      Post.find({ status: 'published' }).select('slug updatedAt').lean(),
      Project.find({ status: 'published' }).select('slug updatedAt').lean(),
    ]);

    const staticEntries = [
      { path: '/', priority: '1.0' },
      { path: '/about', priority: '0.8' },
      { path: '/projects', priority: '0.8' },
      { path: '/blog', priority: '0.7' },
      { path: '/contact', priority: '0.6' },
    ];

    const urls = [
      ...staticEntries.map((e) => `<url><loc>${siteUrl}${e.path}</loc><priority>${e.priority}</priority></url>`),
      ...posts.map(
        (p) =>
          `<url><loc>${siteUrl}/blog/${p.slug}</loc><lastmod>${new Date(p.updatedAt).toISOString()}</lastmod><priority>0.6</priority></url>`
      ),
      ...projects.map(
        (p) => `<url><loc>${siteUrl}/projects</loc><lastmod>${new Date(p.updatedAt).toISOString()}</lastmod></url>`
      ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

router.get('/robots.txt', (req, res) => {
  const siteUrl = getSiteUrl();
  res.set('Content-Type', 'text/plain');
  res.send(`User-agent: *\nDisallow: /admin\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml`);
});

module.exports = router;
