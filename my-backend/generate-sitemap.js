import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

// Fix __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://mangaslick.vercel.app';

// Static URLs
const staticUrls = [
  '/page/1',
  '/Community',
  '/genre/manga',
  '/genre/manhwa',
  '/genre/manhua',
  '/login',
  '/signup',
];

// Predefined famous mangas slugs you want always included
const famousMangasRaw = [
  'one piece',
  'jujutsu kaisen',
  'The legend of the northern blade',
];
const famousMangas = famousMangasRaw.map(slugify);

// Helper: Convert manga title to slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')                 // split accents from letters
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9 -]/g, '')     // remove invalid chars
    .trim()
    .replace(/\s+/g, '-')            // spaces to hyphens
    .replace(/-+/g, '-');            // collapse multiple hyphens
}

// Fetch most followed (famous) manga/manhwa/manhua from API
async function fetchFamousMangaSlugs() {
  try {
    const response = await axios.get('https://api.mangadex.org/manga', {
      params: {
        limit: 10,
        includes: ['cover_art'],
        'order[followedCount]': 'desc',
        availableTranslatedLanguage: ['en'],
        contentRating: ['safe', 'suggestive'],
      },
    });
    const mangaList = response.data?.data || [];
    return mangaList.map(m => {
      const titleObj = m.attributes.title;
      const title = titleObj.en || Object.values(titleObj)[0] || 'unknown-manga';
      return slugify(title);
    });
  } catch (err) {
    console.error('❌ Failed to fetch famous manga slugs:', err);
    return [];
  }
}

// Fetch latest released manga/manhwa/manhua from API
async function fetchLatestReleasesSlugs() {
  try {
    const response = await axios.get('https://api.mangadex.org/manga', {
      params: {
        limit: 10,
        includes: ['cover_art'],
        'order[latestUploadedChapter]': 'desc',
        availableTranslatedLanguage: ['en'],
        contentRating: ['safe', 'suggestive'],
      },
    });
    const mangaList = response.data?.data || [];
    return mangaList.map(m => {
      const titleObj = m.attributes.title;
      const title = titleObj.en || Object.values(titleObj)[0] || 'unknown-manga';
      return slugify(title);
    });
  } catch (err) {
    console.error('❌ Failed to fetch latest releases slugs:', err);
    return [];
  }
}

// Notify search engines (Google, Bing) about sitemap update
async function notifySearchEngines() {
  const sitemapUrl = `${BASE_URL}/mysitemap.xml`;
  try {
    await Promise.all([
      axios.get('https://www.google.com/ping', { params: { sitemap: sitemapUrl } }),
      axios.get('https://www.bing.com/ping', { params: { sitemap: sitemapUrl } }),
    ]);
    console.log('✅ Search engines notified about sitemap update.');
  } catch (err) {
    console.error('❌ Failed to notify search engines:', err);
  }
}

async function generateSitemap() {
  // Fetch slugs dynamically
  const famousSlugsFromApi = await fetchFamousMangaSlugs();
  const latestSlugsFromApi = await fetchLatestReleasesSlugs();

  // Combine all slugs: predefined famous + API fetched famous + latest releases
  const allSlugsSet = new Set([
    ...famousMangas,
    ...famousSlugsFromApi,
    ...latestSlugsFromApi,
  ]);
  const allSlugs = [...allSlugsSet];

  // Compose sitemap URL entries
  const urlEntries = [
    ...staticUrls.map(url => `
  <url>
    <loc>${BASE_URL}${url}</loc>
    <changefreq>${url === '/page/1' ? 'daily' : 'weekly'}</changefreq>
    <priority>${url === '/page/1' ? '1.0' : '0.7'}</priority>
  </url>`),

    ...allSlugs.map(slug => `
  <url>
    <loc>${BASE_URL}/manga/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;

  fs.writeFileSync(
    path.join(__dirname, '../mangaslickreact/public', 'mysitemap.xml'),
    sitemap.trim()
  );
  console.log('✅ Sitemap generated successfully with famous and latest manga slugs!');

  // Notify search engines
  await notifySearchEngines();
}

// Schedule cron job to run daily at midnight (00:00)
cron.schedule('0 0 * * *', () => {
  console.log('🕛 Running scheduled sitemap generation...');
  generateSitemap().catch(console.error);
});

// Run once immediately on script start
generateSitemap();
